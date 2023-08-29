import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import playing from '../preconditions/playing';
import connected from '../preconditions/connected';
import connectedSameChannel from '../preconditions/connectedSameChannel';
import { ApplicationCommandOptionType } from 'discord.js';
import { getNode } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'volume',
    description: 'Modifie le volume',
    preconditions: [preconditions.GuildOnly, playing, connected, connectedSameChannel],
    options: [
        {
            name: 'volume',
            description: 'Volume sur lequel vous voulez mettre la musique',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            maxValue: 100,
            minValue: 0
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const volume = options.getInteger('volume');
    getNode(interaction).node.setVolume(volume);

    interaction.reply(`🎧 | Le volume a été mis sur **${volume}%**`).catch(log4js.trace);
});
