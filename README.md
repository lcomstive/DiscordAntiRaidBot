# Discord Antiraid Bot (*DAB*)

A basic raid detection and deletion bot for a Discord server
(*only works in servers, doesn't work in DMs or group chats*).

All messages in the past 60 seconds ([`settings.messageBufferTime`](#messageBufferTime)) are recorded and checked for similarity,
if 3 or more messages ([`settings.minSimilarMessages`](#minSimilarMessages)) are above a similarity threshold ([`settings.similarityThreshold`](#similarityThreshold)) then all users that sent messages deemed
similar are given a role ([`settings.discord.muteRole`](#discord.muteRole)).

## Installation
 
 - Download the source code (*this repository*) and extract it somewhere
 - Open a terminal/command prompt and navigate to the extracted folder
 - Run `node .` then wait a few seconds and exit (e.g. via `CTRL+C`)
	- This sets default settings and makes sure everything runs as intended
 - Create a Discord bot account at [Discord's site](https://discordapp.com/developers/applications/)
	- Take note of the `Client ID`
	- On the left hand side, select the bot tab and confirm the prompt
	- Take note of the `Token` under the username
 - On the Discord server you'll be adding the bot to,
 	create a role for the people detected as raiders.
 - Edit `settings.json` (*see [Configuring](#Configuring)*)
	- Set `discord.token` and `discord.clientID` as per noted above
	- Set `discord.muteRole` as the name of the raid-detected role (*case insensitive*)
 - Run `node .` and send 5 messages that are very similar to test

## Configuring
### `ignoreTokens`
An array of tokens (*single characters*).
If any of these tokens are found as the first letter of any message, that message is ignored.
Intended for ignoring bot commands (e.g. `!help`, `>rolldice`).

### `discord.token` & `discord.clientID`
Generated on [Discord's site](https://discordapp.com/developers/applications/)

### `discord.muteRole`
The role created in your Discord Server to assign people flagged as potential-raiders.

### `similarityThreshold`
A value between 0.6 and 1.0 to represent minimum percentage of likeness
between messages to be flagged as similar.

Value of `1.0` means messages have to be exactly the same to be flagged
(*case insensitive, ignoring numbers*).

*Default is `0.65`*

### `minSimilarMessages`
Minimum amount of messages to be similar before muting all senders of
flagged messages.

*Default is `3`*

### `messageBufferTime`
The bot stores all messages in the past `messageBufferTime` seconds,
comparing them against newly sent messages for resemblance.

*Default is `60`*

# License
*DAB* is released under the [MIT License](./LICENSE.md) and
*does not* guarantee to prevent any and all raids (*but it tries it's hardest*)