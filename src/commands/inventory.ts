import { AmethystCommand, log4js, preconditions } from "amethystjs";
import shop from '../cache/shop'
import { pnjTalk } from "../utils/toolbox";
import { canvasInventory } from "../utils/canvas";
import { AttachmentBuilder, GuildMember } from "discord.js";
import { inventoryItem } from "shop-manager";
import { ImagesPaginator } from "../structures/ImagesPaginator";

export default new AmethystCommand({
    name: 'inventaire',
    description: "Affiche votre inventaire",
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction }) => {
    const inventory = shop.getInventory(interaction, interaction);

    if (!inventory.items.length) return interaction.reply(`${pnjTalk('gerard')} Vous ne m'avez rien acheté`).catch(log4js.trace)

    const sets = [[]];
    inventory.items.forEach((item, i) => {
        if (i % 6 === 0 && i > 0) sets.push([]);

        sets[sets.length - 1].push(item)
    })
    
    await Promise.all([
        interaction.deferReply(),
        interaction.guild.roles.fetch()
    ]).catch(log4js.trace)

    const data = (items: inventoryItem[]) => ({ guild: interaction.guild, user: { username: (interaction.member as GuildMember)?.nickname ?? interaction.user.username, pp: interaction.user.displayAvatarURL({ forceStatic: true, extension: 'jpg', size: 128 }) }, items });

    if (sets.length === 1) {
        const canvas = await canvasInventory(data(sets[0]));
        if (!canvas) return interaction.editReply(`:x: | Une erreur est survenue`).catch(log4js.trace)

        interaction.editReply({
            files: [ new AttachmentBuilder(canvas.toBuffer('image/jpeg'), { name: 'inventaire.jpg' }) ]
        }).catch(log4js.trace)
    } else {
        new ImagesPaginator({
            datas: sets.map(data),
            interaction,
            user: interaction.user,
            mapper: canvasInventory,
            name: 'inventaire'
        })
    }
})