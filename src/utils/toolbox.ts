import { ActionRowBuilder, AnyComponentBuilder, BaseInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, Guild, GuildMember, InteractionReplyOptions, Message, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import perms from '../data/perms.json';
import { permType } from "../typings/utils";
import { station } from "../typings/station";
import stationsList from '../data/stations.json';
import player from "../cache/player";
import { guildResolvable, item, userResolvable } from "shop-manager";
import pnjs from '../data/pnj.json'
import { pnj as pnjType } from "../typings/client";
import shop from "../cache/shop";
import { log4js, waitForInteraction } from "amethystjs";

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
export const pingUser = (user: userResolvable) => `<@${user instanceof User || user instanceof GuildMember ? user.id : user instanceof BaseInteraction ? user.user.id : user instanceof Message ? user.author.id : user}>`
export const pnj = (name: keyof typeof pnjs): pnjType => pnjs[name];
export const pnjTalk = (resolvable: keyof typeof pnjs | pnjType) => {
    const { name, emoji } = typeof resolvable === 'string' ? pnj(resolvable) : resolvable;
    return `${emoji} **${name} :**`
}
export const resize = (str: string, length = 100) => {
    if (str.length <= length) return str;
    return str.slice(0, str.length - 2) + '...'
}
export const getItem = ({ guild, interaction, user }: { guild: guildResolvable; interaction: ButtonInteraction; user: User }): Promise<void | item> => {
    return new Promise(async (resolve) => {
        await interaction.showModal(
            new ModalBuilder()
                .setTitle("Item")
                .setCustomId('select-item')
                .setComponents(
                    row(
                        new TextInputBuilder()
                            .setRequired(true)
                            .setLabel('item')
                            .setCustomId('query')
                            .setPlaceholder("Nom de l'item")
                            .setStyle(TextInputStyle.Short)
                    )
                )
        ).catch(log4js.trace)
        const rep = await interaction.awaitModalSubmit({
            time: 300000
        }).catch(log4js.trace)
        if (!rep) return resolve();

        const query = rep.fields.getTextInputValue('query').toLowerCase()
        const list = shop.guildItems(guild)
    
        const selected = list.filter(x => 
            x.name.toLowerCase().includes(query) ||
            query.includes(x.name.toLowerCase()) ||
            x.content.toLowerCase().includes(query) ||
            query.includes(x.content.toLowerCase())
        )
    
        const defer = () => {
            rep.deferUpdate().catch(log4js.trace)
        }
        if (!selected.size) {
            defer()
            return resolve()
        };
        if (selected.size === 1) {
            defer()
            return resolve(selected.first());
        }

        const components = () => {
            const base = (i: number) => new StringSelectMenuBuilder().setCustomId(i.toString()).setMaxValues(1)
            const rows = [base(0)];
            
            selected.forEach((sel, i) => {
                if (i % 25 === 0 && i > 0) rows.push(base(i))

                rows[rows.length - 1].addOptions({
                    label: resize(sel.name),
                    description: sel.type === 'role' ? `Rôle <@&${sel.content}>` : resize(sel.content),
                    value: sel.id.toString()
                });
            })

            return rows.map(x => row(x));
        }

        const msg = await rep.reply({
            content: `**${numerize(selected.size)}** items correspondent à votre recherche. Lequel souhaitez-vous utiliser ?`,
            components: components(),
            fetchReply: true
        }).catch(log4js.trace) as Message<true>;
        if (!msg) return resolve();

        const res = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            user,
            message: msg
        }).catch(log4js.trace)
        rep.deleteReply().catch(log4js.trace)

        if (!res) return resolve()
        const id = parseInt(res.values[0])

        return resolve(selected.get(id))
    })

    
}