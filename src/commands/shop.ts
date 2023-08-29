import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import shopManager from '../cache/shop';
import { confirm, numerize, pnjTalk, resize } from '../utils/toolbox';
import { item } from 'shop-manager';
import { TextPaginator } from '../structures/TextPaginator';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import shop from '../cache/shop';
import coins from '../cache/coins';

export default new AmethystCommand({
    name: 'magasin',
    description: 'Accède au magasin',
    options: [
        {
            name: 'voir',
            description: 'Affiche le magasin',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'acheter',
            description: 'Achète un objet du magasin',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'objet',
                    description: 'Objet que vous voulez acheter',
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        }
    ],
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction, options }) => {
    const cmd = options.getSubcommand();

    if (cmd === 'voir') {
        const shop = shopManager.guildItems(interaction);

        if (!shop.size) return interaction.reply(`${pnjTalk('gerard')} Il n'y a rien à vendre`).catch(log4js.trace);

        const limit = 6;

        const base = `${pnjTalk('gerard')} Tu peux jeter un oeil à mon étalage :\n\n`;

        const mapper = (item: item) =>
            `**${item.name}**${item.quantity > 0 ? ` (x**${numerize(item.remaining)}**)` : ''}\n\`${numerize(
                item.price
            )}\` gold\n> ${item.type === 'role' ? `<@&${item.content}>` : item.content}`;

        if (shop.size <= limit) {
            interaction
                .reply({
                    allowedMentions: {
                        roles: [],
                        users: []
                    },
                    content: resize(`${base}${shop.map(mapper).join('\n\n')}`, 2000)
                })
                .catch(log4js.trace);
        } else {
            const datas = [base];

            shop.forEach((x, i) => {
                if (i % limit === 0 && i > 0) datas.push(base);

                datas[datas.length - 1] += `${mapper(x)}\n\n`;
            });

            new TextPaginator({
                interaction,
                user: interaction.user,
                disableMentions: true,
                displayPages: true,
                name: 'magasin',
                datas
            });
        }
    }
    if (cmd === 'acheter') {
        const id = parseInt(options.getString('objet'));
        const item = shop.guildItems(interaction).get(id);
        const stats = coins.getData({
            guild_id: interaction.guild.id,
            user_id: interaction.user.id
        });

        if (item.remaining === 0 && item.quantity !== 0)
            return interaction.reply(`${pnjTalk('gerard')} Désolé, il ne m'en reste plus en stock`).catch(log4js.trace);

        if (item.price > stats.coins)
            return interaction
                .reply(`${pnjTalk('gerard')} Tu n'as pas assez de gold pour acheter ça`)
                .catch(log4js.trace);

        if (item.type === 'role' && shop.getInventory(interaction, interaction).items.find((x) => x.id === item.id))
            return interaction.reply(`${pnjTalk('gerard')} Vous avez déjà ce rôle`).catch(log4js.trace);

        const confirmation = await confirm({
            interaction,
            user: interaction.user,
            content: {
                content: `${pnjTalk('gerard')} Êtes-vous sûr d'acheter **${item.name}** pour **${numerize(
                    item.price
                )}** gold ?`
            }
        }).catch(log4js.trace);

        if (!confirmation || confirmation === 'cancel' || !confirmation.value)
            return interaction
                .editReply({
                    content: `${pnjTalk('gerard')} Je comprends`,
                    components: []
                })
                .catch(log4js.trace);

        coins.removeCoins({
            guild_id: interaction.guild.id,
            user_id: interaction.user.id,
            coins: item.price
        });
        shop.buyItem(interaction, interaction, item.id);

        if (item.type === 'role') {
            (interaction.member as GuildMember).roles.add(item.content).catch(log4js.trace);
        }
        interaction
            .editReply({
                content: `${pnjTalk('gerard')} Ravi d'avoir fait affaire avec vous !`,
                components: []
            })
            .catch(log4js.trace);
    }
});
