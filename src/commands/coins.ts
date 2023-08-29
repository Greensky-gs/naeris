import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';
import coins from '../cache/coins';
import { pingUser } from '../utils/toolbox';
import { canvasCoins } from '../utils/canvas';

export default new AmethystCommand({
    name: 'coins',
    description: "Affiche l'argent d'un utilisateur",
    options: [
        {
            name: 'utilisateur',
            description: 'Utilisateur dont vous voulez voir le profil',
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction, options }) => {
    const user = options.getUser('utilisateur') ?? interaction.user;

    const bank = coins.getData({ guild_id: interaction.guild.id, user_id: user.id });
    if (bank.coins + bank.bank === 0)
        return interaction
            .reply({
                content: `:x: | ${
                    user.id === interaction.user.id
                        ? `Vous n'avez pas d'argent sur vous`
                        : `${pingUser(user)} n'a pas d'argent sur lui`
                }`,
                allowedMentions: {
                    users: []
                }
            })
            .catch(log4js.trace);

    await interaction.deferReply().catch(log4js.trace);
    const canvas = await canvasCoins({
        coins: bank,
        user: {
            username: user.username,
            pp: user.displayAvatarURL({ forceStatic: true, extension: 'jpg', size: 256 })
        }
    });

    if (!canvas) return interaction.editReply(`:x: | Une erreur est survenue`).catch(log4js.trace);

    interaction
        .editReply({
            files: [new AttachmentBuilder(canvas.toBuffer('image/jpeg'), { name: `gold.jpg` })]
        })
        .catch(log4js.trace);
});
