import { AmethystEvent } from "amethystjs";
import shop from "../cache/shop";
import player from "../cache/player";
import coins from "../commands/coins";

export default new AmethystEvent('ready', (client) => {
    [shop, player, coins];
})