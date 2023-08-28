import { AmethystCommand, log4js, preconditions } from "amethystjs";
import shopManager from "../cache/shop";
import { numerize, pnjTalk, resize } from "../utils/toolbox";
import { item } from "shop-manager";
import { TextPaginator } from "../structures/TextPaginator";

export default new AmethystCommand({
    name: 'magasin',
    description: "Affiche le magasin",
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async({ interaction }) => {
    const shop = shopManager.guildItems(interaction)

    if (!shop.size) return interaction.reply(`${pnjTalk('gerard')} Il n'y a rien à vendre`).catch(log4js.trace)

    const limit = 6;

    const base = `${pnjTalk('gerard')} Tu peux jeter un oeil à mon étalage :\n\n`

    const mapper = (item: item) => `**${item.name}**${item.quantity > 0 ? ` (x**${numerize(item.remaining)}**)` : ''}\n\`${numerize(item.price)}\` gold\n> ${item.type === 'role' ? `<@&${item.content}>` : item.content}`;

    if (shop.size <= limit) {
        interaction.reply({
            allowedMentions: {
                roles: [],
                users: []
            },
            content: resize(`${base}${shop.map(mapper).join('\n\n')}`, 2000)
        }).catch(log4js.trace)
    } else {
        const datas = [base];
    
        shop.forEach((x, i) => {
            if (i % limit === 0 && i > 0) datas.push(base)

            datas[datas.length - 1]+= `${mapper(x)}\n\n`
        })

        new TextPaginator({
            interaction,
            user: interaction.user,
            disableMentions: true,
            displayPages: true,
            name: 'magasin',
            datas
        })
    }
})