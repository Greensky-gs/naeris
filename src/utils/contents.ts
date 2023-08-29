import { BaseInteraction, EmbedBuilder, GuildMember, Message, PermissionsString, User } from 'discord.js';
import { capitalize, getRolePerm } from './toolbox';

type userResolvable = BaseInteraction | GuildMember | Message | User;

const getUser = (user: userResolvable): User =>
    user instanceof BaseInteraction || user instanceof GuildMember
        ? user.user
        : user instanceof Message
        ? user.author
        : user;
export const base = (user: userResolvable, options?: { footer?: boolean }) => {
    user = getUser(user);
    const embed = new EmbedBuilder().setTimestamp();

    if (options?.footer !== false)
        embed.setFooter({
            text: user.username,
            iconURL: user.displayAvatarURL()
        });

    return embed;
};

export const baseDenied = (user: userResolvable, title: string) =>
    base(user)
        .setColor('#93722E')
        .setTitle(`🚫 | ${capitalize(title)}`);
export const guildOnly = (user: userResolvable) =>
    baseDenied(user, 'Serveur uniquement').setDescription(`Cette commande n'est utilisable que dans un serveur`);
export const missingPermissions = (user: userResolvable, permissions: PermissionsString[], type: 'client' | 'user') => {
    const embed = baseDenied(user, 'permissions manquantes').setDescription(
        `${type === 'client' ? "Je n'ai" : "Vous n'avez"} pas les permissions nécessaires pour faire ça.\n${
            type === 'client' ? 'Il me' : 'Il vous'
        } manque ${
            permissions.length === 0
                ? `la permission \`${getRolePerm(permissions[0])}\``
                : `les permissions ${permissions.map((x) => `\`${getRolePerm(x)}\``).join(', ')}`
        }`
    );

    return embed;
};
export const notConnected = (user: userResolvable) =>
    baseDenied(user, 'salon vocal').setDescription(`Vous n'êtes pas connecté dans un salon vocal`);
export const alreadyPlaying = (user: userResolvable) =>
    baseDenied(user, 'musique en cours').setDescription(`Je suis déjà en train de jouer de la musique`);
export const notPlaying = (user: userResolvable) =>
    baseDenied(user, 'pas de musique').setDescription(`Je ne suis pas en train de jouer de la musique`);
export const notSameChannel = (user: userResolvable) =>
    baseDenied(user, 'Pas le même salon').setDescription(`Vous n'êtes pas connecté dans le même salon que moi`);
export const ownerOnly = (user: userResolvable) =>
    baseDenied(user, 'Propriétaire uniquement').setDescription(
        `Seul le propriétaire du bot est autorisé à effectuer cette commande`
    );
export const baseValid = (user: userResolvable) => base(user).setColor('#16878E');
