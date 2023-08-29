import { AnySelectMenuInteraction, ButtonInteraction, Collection, CommandInteraction, ContextMenuCommandInteraction, ModalSubmitInteraction, SelectMenuComponentOptionData, User } from 'discord.js';
import perms from '../data/perms.json';

export type permType<Type extends keyof typeof perms> = keyof (typeof perms)[Type];

export type confirmReturn<T extends CommandInteraction | ButtonInteraction | AnySelectMenuInteraction | ContextMenuCommandInteraction> = { value: boolean; interaction: T } | 'cancel';
export type selectOptions<T, D extends boolean> = { interaction: CommandInteraction | ButtonInteraction; user: User; list: Collection<string | number, T>; modal?: { title?: string; label?: string; placeholder?: string }, elementName?: string, selectMenuOption: (opt: T, index: number) => SelectMenuComponentOptionData, filter: (opt: T, query: string) => boolean, deleteModal?: D
}
export type selectReturn<T, D extends boolean> = D extends true ? Promise<void | T> : Promise<void | { value: T; interaction: ModalSubmitInteraction }>