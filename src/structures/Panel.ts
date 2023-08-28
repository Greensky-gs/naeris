import { log4js } from "amethystjs";
import { Client, TextChannel } from "discord.js";
import { base } from "../utils/contents";
import { button, pingUser, row } from "../utils/toolbox";
import { ButtonIds } from "../utils/client";

export class Panel {
    private client: Client;
    private channel: TextChannel;

    constructor(client: Client) {
        this.client = client;
        
        this.start()
    }

    private get components() {
        return [row(
            button({
                label: 'Déconnecter du vocal',
                style: 'Primary',
                id: ButtonIds.disconnect
               }),
            button({
                label: 'Ajouter du gold',
                style: 'Secondary',
                id: ButtonIds.addCoins
            }),
            button({
                label: 'Retirer du gold',
                style: 'Secondary',
                id: ButtonIds.removeCoins
            }),
            button({
                label: 'Redémarrer le bot',
                style: 'Danger',
                id: ButtonIds.reboot
            })
        )]
    }
    private async start() {
        this.channel = (this.client.channels.cache.get(process.env.panel) ?? await this.client.channels.fetch(process.env.panel).catch(log4js.trace)) as TextChannel
        if (!this.channel) {
            throw new Error('No panel channel found')
        }

        await this.channel.bulkDelete(100).catch(log4js.trace)
        const msg = await this.channel.send({
            embeds: [ base(this.client.user).setColor('#8177E5').setTitle("Panel de contrôle").setDescription(`Panel de contrôle de ${pingUser(this.client.user)}`) ],
            components: this.components
        }).catch(log4js.trace)

        if (msg) {
            await msg.pin().catch(log4js.trace)
            this.channel.bulkDelete(1).catch(log4js.trace)
        }
    }
}