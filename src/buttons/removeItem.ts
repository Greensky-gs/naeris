import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../typings/client";
import { getItem } from "../utils/toolbox";
import shop from "../cache/shop";

export default new ButtonHandler({
    customId: ButtonIds.removeItem
}).setRun(async({ button, user }) => {
    const item = await getItem({
        guild: button,
        interaction: button,
        user: button.user
    }).catch(log4js.trace)
    if (!item) return;

    shop.removeItem(item.id);
})