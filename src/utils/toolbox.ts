import { ActionRowBuilder, AnyComponentBuilder, AnySelectMenuInteraction, BaseInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, CommandInteraction, ComponentType, ContextMenuCommandInteraction, Guild, GuildMember, InteractionReplyOptions, Message, ModalBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import perms from '../data/perms.json';
import { confirmReturn, permType } from "../typings/utils";
import { station } from "../typings/station";
import stationsList from '../data/stations.json';
import player from "../cache/player";
import { guildResolvable, item, userResolvable } from "shop-manager";
import pnjs from '../data/pnj.json'
import { pnj as pnjType } from "../typings/client";
import shop from "../cache/shop";
import { log4js, waitForInteraction } from "amethystjs";
import { writeFileSync } from 'node:fs'

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
export const getItem = async({ guild, interaction, user }: { guild: guildResolvable; interaction: ButtonInteraction; user: User }): Promise<void | item> => {
    return await select({
        interaction, user,
        list: shop.guildItems(interaction),
        filter: ((x, query) => 
            x.name.toLowerCase().includes(query) ||
            query.includes(x.name.toLowerCase()) ||
            x.content.toLowerCase().includes(query) ||
            query.includes(x.content.toLowerCase())
        ),
        selectMenuOption: (sel, i) => ({
            label: resize(sel.name),
            description: sel.type === 'role' ? `Rôle <@&${sel.content}>` : resize(sel.content),
            value: sel.id.toString()
        }),
        elementName: 'items',
        modal: {
            title: "Item",
            label: 'Nom',
            placeholder: "Nom de l'item"
        }
    });
}
export const select = <T>({
    interaction, user, list, selectMenuOption, filter,
    modal = { title: "Recherche d'éléments", label: 'Recherche', placeholder: "votre recherche" },
    elementName = 'éléments'
}: { interaction: ButtonInteraction; user: User; list: Collection<string | number, T>; modal?: { title?: string; label?: string; placeholder?: string }, elementName?: string, selectMenuOption: (opt: T, index: number) => SelectMenuComponentOptionData, filter: (opt: T, query: string) => boolean }): Promise<void | T> => {
    return new Promise(async (resolve) => {
        await interaction.showModal(
            new ModalBuilder()
                .setTitle(modal?.title ?? "Recherche d'éléments")
                .setCustomId('select-item')
                .setComponents(
                    row(
                        new TextInputBuilder()
                            .setRequired(true)
                            .setLabel(modal?.label ?? 'Élément')
                            .setCustomId('query')
                            .setPlaceholder(modal?.placeholder ?? 'votre recherche')
                            .setStyle(TextInputStyle.Short)
                    )
                )
        ).catch(log4js.trace)
        const rep = await interaction.awaitModalSubmit({
            time: 300000
        }).catch(log4js.trace)
        if (!rep) return resolve();

        const query = rep.fields.getTextInputValue('query').toLowerCase()

        const selected = list.filter(x => filter(x, query))
    
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
            
            selected.toJSON().forEach((sel, i) => {
                if (i % 25 === 0 && i > 0) rows.push(base(i))

                rows[rows.length - 1].addOptions(selectMenuOption(sel, i));
            })

            return rows.map(x => row(x));
        }

        const msg = await rep.reply({
            content: `**${numerize(selected.size)}** ${elementName} correspondent à votre recherche. Lequel souhaitez-vous utiliser ?`,
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
        const id = typeof [...list.keys()][0] === 'string' ? res.values[0] : parseInt(res.values[0])

        return resolve(selected.get(id))
    })
}
export const confirm = <T extends CommandInteraction | ButtonInteraction | AnySelectMenuInteraction | ContextMenuCommandInteraction>({
    interaction,
    user,
    content = { content: `Êtes-vous sûr ?` },
    time = 120000,
    components = [row(button({ label: 'Oui', style: 'Success', id: 'yes' }), button({ label: 'Non', style: 'Danger', id: 'no' }))],
    ephemeral = false
}: {
    interaction: T;
    user: User;
    content?: InteractionReplyOptions;
    time?: number;
    components?: ActionRowBuilder<ButtonBuilder>[];
    ephemeral?: boolean;
}): Promise<confirmReturn<T>> => {
    return new Promise(async (resolve) => {
        let msg: Message<true>;

        const ctxContent = <U extends boolean = false>(fetch?: U) => ({ ...content, fetchReply: fetch ?? false, components, ephemeral }) as InteractionReplyOptions & { fetchReply: U }
        if (interaction.replied || interaction.deferred) {
            interaction
                .editReply(ctxContent())
                .catch(() => {});
            msg = (await interaction.fetchReply().catch(() => {})) as Message<true>;
        } else {
            msg = (await interaction
                .reply(ctxContent(true))
                .catch(log4js.trace)) as Message<true>;
        }

        const reply = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg,
            time
        }).catch(() => {});

        if (!reply) return resolve('cancel');
        return resolve({
            value: reply.customId === 'yes',
            interaction: reply as T
        });
    });
};
export const getStationByUrl = (url: string) => stations().find(x => x.url === url)
export const addStation = (station: station) => {
    if (!getStationByUrl(station.url)) {
        stationsList.push(station)
        writeFileSync('./dist/data/stations.json', JSON.stringify(stationsList, null, 4))
    }
}
export const removeStation = (station: station) => {
    if (getStationByUrl(station.url)) {
        stationsList.splice(stationsList.indexOf(stationsList.find(x => x.url === station.url)), 1);
        writeFileSync('./dist/data/stations.json', JSON.stringify(stationsList, null, 4))
    }
}
export const selectStation = async({ user, interaction }: { user: User; interaction: ButtonInteraction }) => {
    const rep = await select({
        user,
        interaction,
        list: new Collection(stations().map(x => [x.url, x])),
        filter: (opt, query) => opt.name.toLowerCase().includes(query) || query.includes(opt.name.toLowerCase()),
        selectMenuOption: (opt) => ({ label: opt.name, description: `Musique ${opt.name}`, value: opt.url }),
        elementName: 'musiques',
        modal: {
            title: "Recherche de musiques",
            label: 'Musique',
            placeholder: "Nom de la musique"
        }
    }).catch(log4js.trace)
    if (!rep) return;
    return rep;
}