import { AmethystClient } from "amethystjs";
import { Partials } from "discord.js";
import { config } from "dotenv";
config()

export const client = new AmethystClient({
    // intents: ['Guilds', 'GuildVoiceStates', 'GuildMembers'],
    intents: ['Guilds', 'GuildVoiceStates'], // This is temporary
    partials: [Partials.GuildMember]
}, {
    token: process.env.token,
    commandsFolder: './dist/commands',
    eventsFolder: './dist/events',
    preconditionsFolder: './dist/preconditions',
    buttonsFolder: './dist/buttons',
    autocompleteListenersFolder: './dist/autocompletes',
    botName: 'Naéris',
    debug: true,
    waitForDefaultReplies: {
        everyone: "Vous n'êtes pas autorisé à interagir avec ce message",
        user: "Vous n'êtes pas autorisé à interagir avec ce message"
    },
    defaultCooldownTime: 0
})

client.start({});