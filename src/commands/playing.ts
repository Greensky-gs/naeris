import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import playing from '../preconditions/playing';
import { getNode, getStationByUrl } from '../utils/toolbox';
import { canvasPlaying } from '../utils/canvas';
import { AttachmentBuilder } from 'discord.js';

export default new AmethystCommand({
    name: 'musique',
    description: 'Affiche la musique en cours',
    preconditions: [preconditions.GuildOnly, playing]
}).setChatInputRun(async ({ interaction }) => {
    const node = getNode(interaction);
    const timestamps = node.node.getTimestamp();
    const station = getStationByUrl(node.currentTrack.url);

    await interaction.deferReply().catch(log4js.trace);
    const canvas = await canvasPlaying({
        songName: station?.name ?? node.currentTrack.title,
        timestamp: node.node.getTimestamp()
    });
    if (!canvas) return interaction.editReply(`:x: | Une erreur est survenue`).catch(log4js.trace);
    interaction
        .editReply({
            files: [new AttachmentBuilder(canvas.toBuffer('image/jpeg'), { name: 'playing.jpg' })]
        })
        .catch(log4js.trace);
});
