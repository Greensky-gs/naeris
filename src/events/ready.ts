import { AmethystEvent } from 'amethystjs';
import shop from '../cache/shop';
import player from '../cache/player';
import coins from '../commands/coins';
import { Panel } from '../structures/Panel';

export default new AmethystEvent('ready', (client) => {
    [shop, player, coins];
    new Panel(client);
});
