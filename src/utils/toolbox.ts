import { ActionRowBuilder, AnyComponentBuilder, BaseInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, Guild, InteractionReplyOptions } from "discord.js";
import perms from '../data/perms.json';
import { permType } from "../typings/utils";
import { station } from "../typings/station";
import stationsList from '../data/stations.json';
import player from "../cache/player";

export const capitalize = (str: string) => {
    if (str.length < 1) return str;
    if (str.length === 1) return str.toUpperCase();
    return str[0].toUpperCase() + str.slice(1);
};
export const random = ({ max = 100, min = 0 }: { max: number; min: number; }): number => {
    if (max < min) {
        const oldMax = max;
        max = min;
        min = oldMax;
    }

    return Math.floor(Math.random() * (max - min)) + min;
};
export const systemReply = (
    interaction: CommandInteraction | ButtonInteraction,
    content: InteractionReplyOptions
): Promise<unknown> => {
    const fnt = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    return (interaction[fnt] as CallableFunction)(content);
};

export const button = ({
    disabled = false,
    ...data
}: {
    label?: string;
    url?: string;
    style: keyof typeof ButtonStyle;
    id?: string;
    disabled?: boolean;
    emoji?: string;
}) => {
    const componentData: any = {
        style: ButtonStyle[data.style],
        type: ComponentType.Button,
        disabled
    };

    if (data.label) componentData.label = data.label;
    if (data.emoji) componentData.emoji = data.emoji;
    if (data.url && !data.id) componentData.url = data.url;
    if (data.id && !data.url) componentData.custom_id = data.id;

    return new ButtonBuilder(componentData);
};
export const row = <T extends AnyComponentBuilder>(...components: T[]) => {
    return new ActionRowBuilder({
        components
    }) as ActionRowBuilder<T>;
};
export const sqliseString = (str: string) => {
    if (typeof str !== 'string') return str;
    return str.replace(/"/g, '\\"').replace(/;/g, '\\;');
};
export const plurial = (num: number | any[], opts?: { singular?: string; plurial?: string }) => {
    const singular = opts?.singular ?? '';
    const plurial = opts?.plurial ?? 's';

    return (typeof num === 'number' ? num : num.length) === 1 ? singular : plurial;
};
export const numerize = (int: number) => int.toLocaleString('fr');
export const msToSentence = (time: number, multiply = false) => {
    if (multiply) time *= 1000;
    time = Math.floor(time);

    const s = Math.floor(time / 1000) % 60;
    const m = Math.floor(time / (1000 * 60)) % 60;
    const h = Math.floor(time / (1000 * 60 * 60)) % 24;
    const d = Math.floor(time / (1000 * 60 * 60 * 24)) % 365;
    const y = Math.floor(time / (1000 * 60 * 60 * 24 * 365));

    const superior = [
        { name: 'seconde', value: s },
        { name: 'minute', value: m },
        { name: 'heure', value: h },
        { name: 'jour', value: d },
        { name: 'an', value: y }
    ]
        .filter((x) => x.value > 0)
        .reverse();

    const format = [];
    superior.forEach((sup) => {
        format.push(`${numerize(sup.value)} ${sup.name}${plurial(sup.value)}`);
    });
    let str = '';

    format.forEach((v, i, a) => {
        str += v + (a[i + 1] ? (a[i + 2] ? ', ' : ' et ') : '');
    });

    return str;
};
export const getRolePerm = (key: permType<'role'>) => {
    return perms.role[key];
};
export const getChannelPerm = (key: permType<'channel'>) => {
    return perms.channel[key];
};
export const stations = (): station[] => {
    return stationsList
}
export const getNode = (guild: Guild | BaseInteraction) => {
    guild = guild instanceof Guild ? guild : guild.guild;
    return player.nodes.get(guild);
}
export const getStation = (url: string) => stations().find(x => x.url === url);