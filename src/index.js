const JSONReader = require('@madissia/json-reader')

const Settings = JSONReader('./settings.json')

/// Set defaults ///
Settings.discord = Settings.discord || {}
Settings.discord.token = Settings.discord.token || ''
Settings.discord.clientID = Settings.discord.clientID || ''
Settings.discord.muteRole = Settings.discord.muteRole || 'Jail'
Settings.ignoreTokens = Settings.ignoreTokens || [ '.', '<', '>', ':' ]

// Value between 0.6 and 1, percentage of messages to be similar for action to be taken
Settings.similarityThreshold = Settings.similarityThreshold || 0.75
if(Settings.similarityThreshold < 0.6) Settings.similarityThreshold = 0.6
if(Settings.similarityThreshold > 1.0) Settings.similarityThreshold = 1.0

// Minimum amount of similar messages over the threshold needed to take action
Settings.minSimilarMessages = Settings.minSimilarMessages || 3
// Time, in seconds, for messages to be buffered to check for similar messages
Settings.messageBufferTime = Settings.messageBufferTime || 60

Settings.save()

const Client = new (require('discord.js')).Client()

let MessageBuffer = []

getCharacterOccurrence = (value) =>
{
	let charOccurrence = new Map()
	value.forEach(c => charOccurrence.has(c) ? charOccurrence(c)++ : charOccurrence.set(c, 1))
	return [...charOccurrence.values()]
}

editDistance = (a, b) =>
{
	a = a.toLowerCase()
	b = b.toLowerCase()

	let costs = new Array()
	for(let i = 0; i <= a.length; i++)
	{
		let lastValue = i
		for(let j = 0; j <= b.length; j++)
		{
			if(i != 0 && j > 0)
			{
				let newValue = costs[j - 1]
				if(a.charAt(i - 1) != b.charAt(j - 1))
					newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
				costs[j - 1] = lastValue
				lastValue = newValue
			}
			else if(i == 0)
				costs[j] = j
		}
		if(i > 0)
			costs[b.length] = lastValue
	}
	return costs[b.length]
}

calculateSimilarity = (a, b) =>
{
	let longer = a, shorter = b
	if(longer.length < shorter.length)
	{
		longer = b
		shorter = a
	}

	if(longer.length == 0)
		return 0
	return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length)
}

Client.on('ready', () =>
{
	console.log(`Logged in as ${Client.user.tag}`)

	if(Settings.discord.clientID)
		console.log('\nYou can add this bot to your server by following the link:\n' +
					`\thttps://discordapp.com/oauth2/authorize?client_id=${Settings.discord.clientID}&scope=bot&permissions=268511232\n`)
})
Client.on('message', msg =>
{
	if(!msg.cleanContent || Settings.ignoreTokens.includes(msg.cleanContent[0])) // Skip messages with no content, such as image uploads, or specified tokens (e.g. for bots)
		return

	let content = msg.cleanContent.replace(/\W+/, '').toLowerCase()
	let timestamp = new Date().getTime()
	let similarMessages = []

	for(let i = MessageBuffer.length - 1; i >= 0; i--)
	{			
		let timeDifference = timestamp - MessageBuffer[i].timestamp
		if(timeDifference >= (1000 * Settings.messageBufferTime)) // If older than set time, remove from buffer (measured in milliseconds)
		{
			MessageBuffer.splice(i, 1)
			continue
		}

		let similarity = calculateSimilarity(content, MessageBuffer[i].content)

		if(similarity >= Settings.similarityThreshold)
			similarMessages.push(MessageBuffer[i])
	}

	MessageBuffer.push({
		message: msg,
		content: content,
		sender: msg.member,
		timestamp: timestamp,
		deleted: false
	})

	console.log(`Checking message: '${msg.cleanContent}' (${similarMessages.length} similar message(s))`)
	if(similarMessages.length >= Settings.minSimilarMessages)
	{
		similarMessages.push(MessageBuffer[MessageBuffer.length - 1])

		let muteRoleStr = Settings.discord.muteRole.toLowerCase()
		let muteRole = [...msg.guild.roles.values()].find(role => role.name.toLowerCase() == muteRoleStr || role.id == muteRoleStr)
		console.log(`Message '${msg.content}' is too similar to ${similarMessages.length} messages, muting peeps...`)
		similarMessages.forEach(x =>
			{
				let foundMessage = MessageBuffer.find(bufferMsg => bufferMsg.message.id == x.message.id)
				if(!foundMessage || foundMessage.deleted)
					return

				foundMessage.deleted = true
				x.message.delete()
	
				console.log(`Muting '${x.sender.displayName}'...`)
				x.sender.addRole(muteRole, 'Spamming')
			})
	}
})

if(!Settings.discord.token)
{
	console.error('No discord token was provided but is required\nExiting application...\n\n')
	process.exit(0)
}

Client.login(Settings.discord.token)