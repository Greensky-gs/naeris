import { account } from 'coins-manager';
import { PlayerTimestamp } from 'discord-player';
import { Guild, User } from 'discord.js';
import { inventoryItem } from 'shop-manager';

export type coinsImage = {
    coins: account<'multiguild'>;
    user: {
        username: string;
        pp: string;
    };
};
export type leaderboardImage = {
    coins: account<'multiguild'>;
    user: {
        username: string;
        pp: string;
    };
    place: number;
};
export type inventoryImage = {
    user: {
        username: string;
        /**
         * 128 formats
         * JPG extension
         */
        pp: string;
    };
    items: inventoryItem[];
    guild: Guild;
};
export type playingImage = {
    timestamp: PlayerTimestamp;
    songName: string;
    seed?: 0 | 1 | 2 | 3;
};
export type welcomeImage = {
    user: User;
}