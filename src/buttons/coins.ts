import { ButtonHandler, log4js, waitForInteraction } from "amethystjs";
import { ButtonIds } from "../utils/client";
import { numerize, pingUser, row } from "../utils/toolbox";
import { ComponentType, Message, ModalBuilder, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder } from "discord.js";
import coins from "../cache/coins";

export default new ButtonHandler({
    customId: ButtonIds.addCoins,
    identifiers: [ButtonIds.removeCoins]
}).setRun(async({ button, user }) => {
    const actionText = button.customId === ButtonIds.addCoins ? 'ajouter du gold' : 'retirer du gold';
    const miniAction = button.customId === ButtonIds.addCoins ? 'ajouter' : 'retirer'
    const past = button.customId === ButtonIds.addCoins ? 'ajoutés' : 'retirés'

    const msg = await button.reply({
        content: `À quel utilisateur voulez-vous ${actionText} ?`,
        ephemeral: true,
        components: [
            row(
                new UserSelectMenuBuilder()
                    .setMaxValues(1)
                    .setCustomId('add-or-remove.user')
            )
        ],
        fetchReply: true
    }).catch(log4js.trace) as Message<true>

    if (!msg) return

    const userInput = await waitForInteraction({
        message: msg,
        user,
        componentType: ComponentType.UserSelect
    }).catch(log4js.trace)
    const cancel = () => {
        button.deleteReply(msg).catch(() => {
            button.editReply({
                content: 'Annulé',
                components: []
            }).catch(log4js.trace)
        });
    }
    
    if (!userInput) return cancel();

    const userId = userInput.values[0];
    userInput.showModal(
        new ModalBuilder()
            .setTitle("Gold")
            .setComponents(
                row(new TextInputBuilder()
                    .setLabel("Quantité")
                    .setPlaceholder(`Quelle quantité de gold voulez-vous ${miniAction} ?`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setCustomId('quantity')
                )
            ).setCustomId('add-or-remove.modal')
    ).catch(log4js.trace)

    const modalRep = await userInput.awaitModalSubmit({
        time: 120000
    }).catch(log4js.trace)

    if (!modalRep) return cancel()
    let quantity = parseInt(modalRep.fields.getTextInputValue('quantity'));
    if (!quantity || isNaN(quantity) || quantity < 0) {
        modalRep.reply({
            content: `:x: | Merci de saisir un nombre valide, supérieur à 0`,
            ephemeral: true
        }).catch(log4js.trace)
        return cancel()
    }

    if (miniAction === 'ajouter') {
        coins.addCoins({
            guild_id: button.guild.id,
            user_id: userId,
            coins: quantity
        });
    } else {
        quantity = Math.min(coins.getData({ guild_id: button.guild.id, user_id: userId }).coins, quantity);
        
        coins.removeCoins({
            guild_id: button.guild.id,
            user_id: userId,
            coins: quantity
        })
    }

    modalRep.deferUpdate().catch(log4js.trace);
    button.editReply({
        content: `${numerize(quantity)} gold ont été ${past} à ${pingUser(userId)}`,
        components: []
    }).catch(log4js.trace)
})