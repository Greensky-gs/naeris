import { AnySelectMenuInteraction, ButtonInteraction, CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import perms from '../data/perms.json';

export type permType<Type extends keyof typeof perms> = keyof (typeof perms)[Type];
export type confirmReturn<T extends CommandInteraction | ButtonInteraction | AnySelectMenuInteraction | ContextMenuCommandInteraction> = { value: boolean; interaction: T } | 'cancel';
