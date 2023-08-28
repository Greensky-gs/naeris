import { account } from "coins-manager";

export type coinsImage = {
    coins: account<'multiguild'>;
    user: {
        username: string;
        pp: string
    };
}
export type leaderboardImage = {
    coins: account<'multiguild'>;
    user: {
        username: string;
        pp: string;
    };
    place: number;
}