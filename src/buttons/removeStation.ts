import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../typings/client";
import ownerOnly from "../preconditions/ownerOnly";
import { removeStation, selectStation } from "../utils/toolbox";

export default new ButtonHandler({
    customId: ButtonIds.deleteStation,
    preconditions: [ownerOnly]
}).setRun(async({ button, user }) => {
    const station = await selectStation({
        interaction: button,
        user
    }).catch(log4js.trace)
    if (!station) return;

    removeStation(station)
})