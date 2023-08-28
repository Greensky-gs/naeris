import { ButtonHandler, log4js, waitForInteraction } from "amethystjs";
import { ButtonIds } from "../typings/client";
import { row, button as buttonBuilder } from "../utils/toolbox";
import { ComponentType, Message } from "discord.js";

export default new ButtonHandler({
    customId: ButtonIds.reboot
}).setRun(async({ button, user }) => {
    const res = await button.reply({
        content: `Redémarrage <t:${Math.floor((Date.now() + 10000) / 1000)}:R>`,
        components: [row(buttonBuilder({ label: 'Annuler', style: 'Danger', id: 'reboot.cancel' }))],
        fetchReply: true
    }).catch(log4js.trace) as Message<true>;

    const rep = await waitForInteraction({
        componentType: ComponentType.Button,
        time: 10000,
        message: res,
        user
    }).catch(log4js.trace)

    await button.deleteReply().catch(log4js.trace);
    if (!!rep) return;

    process.exit();
})