import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { alreadyPlaying } from '../utils/contents';
import { getNode, getStation } from '../utils/toolbox';
import player from '../cache/player';
import connected from '../preconditions/connected';

export default new AmethystCommand({
    name: 'jouer',
    description: 'Joue une musique',
    preconditions: [preconditions.GuildOnly, connected],
    options: [
        {
            name: 'musique',
            description: 'Musique que vous voulez écouter',
            required: true,
            type: ApplicationCommandOptionType.String,
            autocomplete: true
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const member = interaction.member as GuildMember;
    const station = getStation(options.getString('musique'));

    const node = getNode(interaction);

    if (node && (node.isPlaying() || node.node.isPaused() || node.node.isPlaying()))
        return interaction
            .reply({
                embeds: [alreadyPlaying(interaction)],
                ephemeral: true
            })
            .catch(log4js.trace);

    await interaction.deferReply().catch(log4js.trace);
    const search = await player.search(station.url, { requestedBy: interaction.user }).catch(log4js.trace);

    if (!search || !search.tracks.length)
        return interaction.editReply(`:x: | La musique n'a pas été trouvée`).catch(log4js.trace);

    const res = await player
        .play(member.voice.channel, search.tracks[0], {
            nodeOptions: {
                selfDeaf: true,
                leaveOnEmpty: true,
                leaveOnEnd: true,
                leaveOnEmptyCooldown: 10000,
                leaveOnEndCooldown: 10000,
                leaveOnStop: true,
                leaveOnStopCooldown: 10000,
                volume: 90
            }
        })
        .catch(log4js.trace);

    if (!res) return interaction.editReply(":x: | La musique n'a pas pu être jouée").catch(log4js.trace);
    interaction.editReply(`Lecture de **${station.name}**`).catch(log4js.trace);
});
