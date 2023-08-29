import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../typings/client";
import { getNode } from "../utils/toolbox";
import ownerOnly from "../preconditions/ownerOnly";

export default new ButtonHandler({
    customId: ButtonIds.disconnect,
    preconditions: [ownerOnly]
}).setRun(async({ button, user }) => {
    const node = getNode(button)

    if (!node || (!node.node.isPlaying() && !node.node.isPaused())) return button.reply({
        content: `:x: | Je ne suis pas en train de jouer de musique`,
        ephemeral: true
    }).catch(log4js.trace)

    node.node.stop();
    button.reply({
        content: `✅ | Déconnecté`,
        ephemeral: true
    }).catch(log4js.trace)
})