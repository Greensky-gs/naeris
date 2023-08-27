import { Precondition, log4js } from "amethystjs";
import { GuildMember } from "discord.js";
import { notConnected } from "../utils/contents";

export default new Precondition('connected').setChatInputRun(({ interaction }) => {
    const member = interaction.member as GuildMember

    if (!member.voice?.channel) {
        interaction.reply({
                embeds: [ notConnected(interaction) ],
                ephemeral: true
            }).catch(log4js.trace)

        return {
            ok: false,
            type: 'chatInput',
            interaction,
            metadata: {
                silent: true
            }
        }
    }

    return {
        ok: true,
        type: 'chatInput',
        interaction
    }
})