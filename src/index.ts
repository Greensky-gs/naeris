import { AmethystClient } from "amethystjs";
import { config } from "dotenv";
config()

export const client = new AmethystClient({
    intents: ['Guilds']
}, {
    token: process.env.token,
    commandsFolder: './dist/commands',
    eventsFolder: './dist/events',
    preconditionsFolder: './dist/preconditions',
    buttonsFolder: './dist/buttons',
    botName: 'Naéris',
    debug: true,
    waitForDefaultReplies: {
        everyone: "Vous n'êtes pas autorisé à interagir avec ce message",
        user: "Vous n'êtes pas autorisé à interagir avec ce message"
    },
    defaultCooldownTime: 0
})

client.start({});