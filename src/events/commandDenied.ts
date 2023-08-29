import { AmethystEvent, commandDeniedCode, log4js } from 'amethystjs';
import { guildOnly, missingPermissions } from '../utils/contents';

export default new AmethystEvent('commandDenied', (command, reason) => {
    if (command.interaction.isChatInputCommand()) {
        if (reason.code === commandDeniedCode.GuildOnly) {
            command.interaction
                .reply({
                    embeds: [guildOnly(command.interaction)],
                    ephemeral: true
                })
                .catch(log4js.trace);
            return;
        }
        if (
            reason.code === commandDeniedCode.UserMissingPerms ||
            reason.code === commandDeniedCode.ClientMissingPerms
        ) {
            command.interaction
                .reply({
                    embeds: [
                        missingPermissions(
                            command.interaction,
                            reason.metadata.permissions.missing,
                            reason.code === commandDeniedCode.ClientMissingPerms ? 'client' : 'user'
                        )
                    ],
                    ephemeral: true
                })
                .catch(log4js.trace);
        }

        if (reason.metadata.silent === true) return;
        command.interaction
            .reply({
                content: ":x: | Échec de l'interaction",
                ephemeral: true
            })
            .catch(log4js.trace);
    }
});
