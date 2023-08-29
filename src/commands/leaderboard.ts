import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import coins from '../cache/coins';
import { canvasLeaderboard } from '../utils/canvas';
import { AttachmentBuilder } from 'discord.js';
import { ImagesPaginator } from '../structures/ImagesPaginator';

export default new AmethystCommand({
    name: 'classement',
    description: 'Classement de gold',
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction, client }) => {
    const leaderboard = coins.getLeaderboard(interaction.guild.id).map((x, i) => ({ ...x, place: i + 1 }));

    if (!leaderboard.length) return interaction.reply(`Personne n'est classé`).catch(log4js.trace);

    await Promise.all([
        interaction.deferReply().catch(log4js.trace)
        // interaction.guild.members.fetch().catch(log4js.trace)
        // This is temporary
    ]).catch(log4js.trace);
    const defaultPP = client.user.displayAvatarURL({ forceStatic: true, size: 128, extension: 'jpg' });

    const data = leaderboard.map((x) => ({
        user: {
            username: interaction.guild.members.cache.get(x.user_id)?.user?.username ?? x.user_id,
            pp:
                interaction.guild.members.cache
                    .get(x.user_id)
                    ?.user?.displayAvatarURL({ forceStatic: true, extension: 'jpg', size: 128 }) ?? defaultPP
        },
        coins: {
            coins: x.coins,
            bank: x.bank,
            user_id: x.user_id,
            guild_id: x.guild_id
        },
        place: x.place
    }));
    if (leaderboard.length <= 5) {
        const canvas = await canvasLeaderboard(data);
        if (!canvas) return interaction.editReply(':x: | Une erreur est survenue').catch(log4js.trace);

        interaction
            .editReply({
                files: [new AttachmentBuilder(canvas.toBuffer('image/jpeg'), { name: 'leaderboard.jpg' })]
            })
            .catch(log4js.trace);
    } else {
        const datas = [[]];

        data.forEach((x, i) => {
            if (i % 5 === 0 && i > 0) datas.push([]);

            datas[datas.length - 1].push(x);
        });

        new ImagesPaginator({
            interaction,
            user: interaction.user,
            datas,
            mapper: canvasLeaderboard,
            name: 'classement'
        });
    }
});
