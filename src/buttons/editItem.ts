import { ButtonHandler, log4js } from "amethystjs";
import { ButtonIds } from "../typings/client";
import ownerOnly from "../preconditions/ownerOnly";
import { getItem, numerize, pingRole, row, button as buttonBuilder } from "../utils/toolbox";
import { baseValid } from "../utils/contents";
import { ComponentType, Message, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import shop from "../cache/shop";

export default new ButtonHandler({
    customId: ButtonIds.editItem,
    preconditions: [ownerOnly]
}).setRun(async({ button, user }) => {
    const rep = await getItem({
        guild: button,
        user: button.user,
        interaction: button
    });
    if (!rep) return;
    const { value: item, interaction: modal } = rep
    await modal.deferReply().catch(log4js.trace)

    const time = 600000
    const endsAt = Date.now() + time

    const embed = () => {
        return baseValid(user)
            .setTitle("Modification d'item")
            .setDescription(`Vous modifiez l'item **${item.name}**\nFin de la modification <t:${Math.floor(endsAt / 1000)}:R>\n\nToutes les modifications que vous apporterez seront appliquées en direct`)
            .setFields(
                {
                    name: 'Nom',
                    value: item.name,
                    inline: true
                },
                {
                    name: 'Quantité',
                    value: item.quantity === 0 ? 'Infinie' : numerize(item.quantity),
                    inline: true
                },
                {
                    name: 'Quantité restante',
                    value: item.quantity === 0 ? 'Infinie' : numerize(item.remaining),
                    inline: true
                },
                {
                    name: 'Prix',
                    value: numerize(item.price) + ' gold',
                    inline: false
                },
                {
                    name: 'Contenu',
                    value: item.type === 'role' ? pingRole(item.content) : item.content,
                    inline: false
                }
            )
    }
    const components = (disabled = false) => {
        return [
            row(
                buttonBuilder({
                    label: 'Nom',
                    id: 'name',
                    style: 'Primary',
                    disabled 
                }),
                buttonBuilder({
                    label: item.quantity === 0 ? 'Quantité (non modifiable si infinie)' : 'Quantité',
                    id: 'quantity',
                    disabled: item.quantity === 0 || disabled,
                    style: 'Primary'
                }),
                buttonBuilder({
                    label: item.quantity === 0 ? 'Quantité restante (non modifiable si quantité infinie' : 'Quantité restante',
                    disabled: item.quantity === 0 || disabled,
                    style: 'Secondary',
                    id: 'remaining'
                }),
                buttonBuilder({
                    label: `Changer en quantité ${item.quantity === 0 ? 'finie' : 'infinie'}`,
                    style: 'Secondary',
                    id: 'switch',
                    disabled
                }),
                buttonBuilder({
                    label: 'Prix',
                    style: 'Secondary',
                    id: 'price',
                    disabled
                })
            ),
            row(
                buttonBuilder({
                    label: item.type === 'role' ? "Contenu (non modifiable si rôle)" : "Contenu",
                    disabled: item.type === 'role' || disabled,
                    style: 'Primary',
                    id: 'content'
                }),
                buttonBuilder({
                    label: 'Terminer',
                    disabled: disabled,
                    style: 'Success',
                    id: 'finish'
                })
            )
        ]
    }

    const edit = (disabled = false) => {
        modal.editReply({
            components: components(disabled),
            embeds: [embed()]
        }).catch(log4js.trace)
    }
    const disable = () => {
        edit(true)
    }
    const enable = () => {
        edit()
    }
    const finish = (callback = log4js.trace) => {
        modal.deleteReply().catch(callback)
    }

    edit();
    const reply = await modal.fetchReply().catch(log4js.trace) as Message<true>
    if (!reply) return finish(disable)

    const collector = reply.createMessageComponentCollector({
        time,
        componentType: ComponentType.Button
    });

    collector.on('collect', async(interaction) => {
        if (interaction.user.id !== user.id) {
            interaction.reply({
                content: `:x: | Vous ne pouvez pas interagir avec ce message`,
                ephemeral: true
            })
            return
        }

        const id = interaction.customId as 'finish' | 'name' | 'price' | 'quantity' | 'remaining' | 'content' | 'switch'
        if (id === 'finish') {
            collector.stop()
            return
        }
        if (id === 'switch') {
            if (item.quantity === 0) {
                item.quantity = 10
                item.remaining = 10

                shop.setInfinite(interaction, item.id, false, 10);
            } else {
                item.quantity = 0;
                item.remaining = 0
                shop.setInfinite(interaction, item.id, true)
            }

            interaction.deferUpdate().catch(log4js.trace)
            edit();
        }
        if (id === 'price' || id === 'quantity' || id === 'remaining') {
            const vocabulary = {
                price: { modal: { title: 'Prix', label: 'prix', placeholder: 'entrez le prix' } },
                quantity: { modal: { title: 'Quantité', label: 'Quantité', placeholder: 'entrez la quantité' } },
                remaining: { modal: { title: "Quantité restante", label:' Quantité', placeholder: "entrez le nombre d'items achetables" } }
            }[id]

            await interaction.showModal(
                new ModalBuilder()
                    .setTitle(vocabulary.modal.title)
                    .setCustomId('edit-modal')
                    .setComponents(
                        row(
                            new TextInputBuilder()
                                .setLabel(vocabulary.modal.label)
                                .setPlaceholder(vocabulary.modal.placeholder)
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                                .setCustomId('input')
                        )
                    )
            ).catch(log4js.trace)
            const rep = await interaction.awaitModalSubmit({
                time: 120000
            }).catch(log4js.trace)
            if (!rep) return;

            const int = parseInt(rep.fields.getTextInputValue('input'));
            if (!int || isNaN(int) || int < 1) {
                rep.reply({
                    content: `:x: | Veuillez entrer un nombre valide supérieur à 0`,
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }
            if (id === 'remaining') {
                item.remaining = Math.min(int, item.quantity)

                shop.updateRemaining(button, item.id, int)
            }
            if (id === 'quantity') {
                item.quantity = int;
                item.remaining = Math.min(item.quantity, item.quantity)

                shop.updateQuantity(button, item.id, int)
            }
            if (id === 'price') {
                item.price = int

                shop.updatePrice(button, item.id, int)
            }
            rep.deferUpdate().catch(log4js.trace)
            edit();
        }
        if (id === 'name' || id === 'content') {
            const vocabulary = {
                name: { style: TextInputStyle.Short, max: 80, modal: { title: "Nom", label: "nom de l'item", placeholder: "entrez le nom de l'item" } },
                content: { style: TextInputStyle.Paragraph, max: 250, modal: { title: "Contenu", label: "Contenu de l'item", placeholder: "entrez le contenu de l'item" } }
            }[id];

            await interaction.showModal(
                new ModalBuilder()
                    .setTitle(vocabulary.modal.title)
                    .setCustomId('edit.modal.text')
                    .setComponents(
                        row(new TextInputBuilder()
                            .setLabel(vocabulary.modal.label)
                            .setPlaceholder(vocabulary.modal.placeholder)
                            .setMaxLength(vocabulary.max)
                            .setStyle(vocabulary.style)
                            .setRequired(true)
                            .setCustomId('input')
                        )
                    )
            ).catch(log4js.trace)
            const rep = await interaction.awaitModalSubmit({
                time: 120000
            }).catch(log4js.trace)
            if (!rep) return;

            const text = rep.fields.getTextInputValue('input')
            item[id] = text

            if (id === 'content') {
                shop.updateContent(button, item.id, text)
            } else {
                shop.updateName(button, item.id, text)
            }

            edit()
            rep.deferUpdate().catch(log4js.trace)
        }
    })
    collector.on('end', () => {
        finish(disable);
    })
})