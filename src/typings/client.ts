import { Canvas } from "canvas";
import { CommandInteraction, ButtonInteraction, User } from "discord.js";

export enum ButtonIds {
    addCoins = 'panel.coins.add',
    removeCoins = 'panel.coins.remove',
    disconnect = 'panel.disconnect',
    reboot = 'panel.reboot-bot'
}

export type paginatorOptions<T = any> = {
    interaction: CommandInteraction | ButtonInteraction;
    user: User;
    datas: T[];
    mapper: (options: T) => Promise<Canvas>
    name: string;
    time?: number;
}
export type pnj = {
    name: string;
    emoji: string;
}