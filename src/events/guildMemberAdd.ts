import { AmethystEvent, log4js } from "amethystjs";
import { AttachmentBuilder, TextChannel } from "discord.js";
import { joinCanvas } from "../utils/canvas";

export default new AmethystEvent('guildMemberAdd', async(member) => {
    if (member.guild.id !== process.env.guild) return;

    const channel = (member.guild.channels.cache.get(process.env.join) ?? await member.guild.channels.fetch(process.env.join).catch(log4js.trace)) as TextChannel;
    if (!channel) return;

    const canvas = await joinCanvas({ user: member.user }).catch(log4js.trace)
    if (!canvas) return;

    channel.send({
        files: [new AttachmentBuilder(canvas.toBuffer('image/jpeg'), { name: 'welcome.jpg' })]
    }).catch(log4js.trace)
})