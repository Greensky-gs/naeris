import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../typings/client";
import ownerOnly from "../preconditions/ownerOnly";
import { ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { addStation, getStationByUrl, row } from "../utils/toolbox";
import { getBasicInfo, getVideoID, validateURL, videoInfo } from "ytdl-core";

export default new ButtonHandler({
    customId: ButtonIds.createStation,
    preconditions: [ownerOnly]
}).setRun(async({ button, user }) => {
    await button.showModal(
        new ModalBuilder()
            .setTitle("Musique")
            .setCustomId('createStation')
            .setComponents(
                row(new TextInputBuilder()
                    .setLabel('Nom')
                    .setPlaceholder('Nom de la musique')
                    .setCustomId('name')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                ),
                row(new TextInputBuilder()
                    .setLabel('URL')
                    .setPlaceholder(`https://youtube.com/watch?v=abcde12345`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setCustomId('url')
                )
            )
    ).catch(log4js.trace)
    const rep = await button.awaitModalSubmit({
        time: 300000
    }).catch(log4js.trace)

    if (!rep) return;

    const name = rep.fields.getTextInputValue('name')
    const url = rep.fields.getTextInputValue('url')

    if (!validateURL(url)) return rep.reply({ content: "Ce n'est pas une URL valide", ephemeral: true }).catch(log4js.trace)
    const id = getVideoID(url)
    const roboURL = `https://youtube.com/watch?v=${id}`

    if (getStationByUrl(roboURL)) return rep.reply({
        content: "Cette musique est déjà enregistrée",
        ephemeral: true
    }).catch(log4js.trace)
    
    addStation({
        name,
        url
    })

    rep.deferUpdate()
})