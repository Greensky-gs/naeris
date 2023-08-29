import { Precondition, log4js } from 'amethystjs';
import { GuildMember } from 'discord.js';
import { notSameChannel } from '../utils/contents';

export default new Precondition('connected same channel').setChatInputRun(({ interaction }) => {
    if ((interaction.member as GuildMember).voice.channel?.id !== interaction.guild.members.me.voice.channel.id) {
        interaction
            .reply({
                embeds: [notSameChannel(interaction)],
                ephemeral: true
            })
            .catch(log4js.trace);
        return {
            ok: false,
            type: 'chatInput',
            interaction,
            metadata: {
                silent: true
            }
        };
    }
    return {
        ok: true,
        type: 'chatInput',
        interaction
    };
});
