import { ButtonHandler, log4js, waitForInteraction } from 'amethystjs';
import { ButtonIds } from '../typings/client';
import {
    ComponentType,
    Message,
    ModalBuilder,
    RoleSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { row, button as buttonBuilder } from '../utils/toolbox';
import { itemType } from 'shop-manager';
import shop from '../cache/shop';
import ownerOnly from '../preconditions/ownerOnly';

export default new ButtonHandler({
    customId: ButtonIds.addItem,
    preconditions: [ownerOnly]
}).setRun(async ({ button, user }) => {
    const msg = (await button
        .reply({
            fetchReply: true,
            content: `Quel est le type de l'item que vous voulez ajouter ?`,
            components: [
                row(
                    buttonBuilder({
                        label: 'Texte',
                        id: 'string',
                        style: 'Secondary'
                    }),
                    buttonBuilder({
                        label: 'Rôle',
                        id: 'role',
                        style: 'Secondary'
                    })
                )
            ]
        })
        .catch(log4js.trace)) as Message<true>;
    if (!msg) return;

    const typeRep = await waitForInteraction({
        componentType: ComponentType.Button,
        user,
        message: msg
    }).catch(log4js.trace);
    const cancel = () => {
        button.deleteReply(msg).catch(() => {
            button
                .editReply({
                    content: 'Annulé',
                    components: []
                })
                .catch(log4js.trace);
        });
    };

    if (!typeRep) return cancel();
    const type = typeRep.customId as itemType;

    typeRep
        .showModal(
            new ModalBuilder()
                .setTitle('Item')
                .setCustomId('add-item')
                .setComponents(
                    [
                        row(
                            new TextInputBuilder()
                                .setLabel('Nom')
                                .setMaxLength(100)
                                .setRequired(true)
                                .setPlaceholder("Nom de l'item")
                                .setStyle(TextInputStyle.Short)
                                .setCustomId('name')
                        ),
                        type === 'string'
                            ? row(
                                  new TextInputBuilder()
                                      .setLabel('Contenu')
                                      .setMaxLength(150)
                                      .setRequired(true)
                                      .setPlaceholder("Contenu de l'item")
                                      .setStyle(TextInputStyle.Short)
                                      .setCustomId('content')
                              )
                            : null,
                        row(
                            new TextInputBuilder()
                                .setLabel('Prix')
                                .setPlaceholder("Prix de l'item")
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                                .setCustomId('price')
                        ),
                        row(
                            new TextInputBuilder()
                                .setLabel('Quantité')
                                .setPlaceholder("Quantité de l'item (laisser vide pour infini)")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setCustomId('quantity')
                        )
                    ].filter((x) => !!x)
                )
        )
        .catch(log4js.trace);

    const modalRep = await typeRep
        .awaitModalSubmit({
            time: 300000
        })
        .catch(log4js.trace);
    if (!modalRep) return cancel();

    const content = type === 'string' ? modalRep.fields.getTextInputValue('content') : null;
    const name = modalRep.fields.getTextInputValue('name');
    const quantity = parseInt(modalRep.fields.getTextInputValue('quantity') || '0');
    const price = parseInt(modalRep.fields.getTextInputValue('price'));

    if ((!quantity && quantity !== 0) || isNaN(quantity) || quantity < 0 || !price || isNaN(price) || price < 1) {
        await modalRep
            .reply({
                ephemeral: true,
                content: `:x: | Veuillez préciser un nombre valide, supérieur à 0 pour la quantité et le prix`
            })
            .catch(log4js.trace);
        return cancel();
    }

    modalRep.deferUpdate().catch(log4js.trace);
    let value = content;
    if (type === 'role') {
        button
            .editReply({
                content: `Quel rôle voulez-vous assigner à cet item ?`,
                components: [row(new RoleSelectMenuBuilder().setCustomId('roles').setMaxValues(1))]
            })
            .catch(log4js.trace);

        const roleRep = await waitForInteraction({
            componentType: ComponentType.RoleSelect,
            message: msg,
            user
        }).catch(log4js.trace);

        if (!roleRep) return cancel();
        value = roleRep.values[0];

        await roleRep.deferUpdate().catch(log4js.trace);
    }
    await button
        .editReply({
            components: []
        })
        .catch(log4js.trace);

    const res = await shop
        .addItem({
            content: value,
            type,
            guild: button,
            price,
            quantity,
            name
        })
        .catch(log4js.trace);

    if (!res || res === 'no reply from database') {
        button
            .editReply({
                content: `Une erreur a eu lieu lors de l'interaction avec la base de données`,
                components: []
            })
            .catch(log4js.trace);

        setTimeout(cancel, 10000);
        return;
    }
    cancel();
});
