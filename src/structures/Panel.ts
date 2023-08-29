import { log4js } from "amethystjs";
import { Client, Collection, Message, TextChannel } from "discord.js";
import { base } from "../utils/contents";
import { button, pingUser, row } from "../utils/toolbox";
import { ButtonIds } from "../typings/client";

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
        ),
        row(
            button({
                label: 'Ajouter une musique',
                style: 'Primary',
                id: ButtonIds.createStation
            }),
            button({
                label: 'Supprimer une musique',
                style: 'Primary',
                id: ButtonIds.deleteStation
            }),
            button({
                label: 'Créer un item',
                style: 'Secondary',
                id: ButtonIds.addItem
            }),
            button({
                label: 'Supprimer un item',
                style: 'Secondary',
                id: ButtonIds.removeItem
            }),
            button({
                label: 'Modifier un item',
                style: 'Secondary',
                id: ButtonIds.editItem
            })
        )]
    }
    private async start() {
        this.channel = (this.client.channels.cache.get(process.env.panel) ?? await this.client.channels.fetch(process.env.panel).catch(log4js.trace)) as TextChannel
        if (!this.channel) {
            throw new Error('No panel channel found')
        }

        let toDelete = (((await this.channel.messages.fetch().catch(log4js.trace)) ?? new Collection()) as Collection<string, Message<true>>).filter(x => x.deletable).toJSON().slice(0, 99)
        await this.channel.bulkDelete(toDelete).catch(log4js.trace)
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