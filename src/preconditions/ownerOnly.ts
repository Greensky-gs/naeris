import { Precondition, log4js } from 'amethystjs';
import owners from '../data/owners.json';
import { ownerOnly } from '../utils/contents';

export default new Precondition('bot owner only').setButtonRun(({ button, user }) => {
    if (!owners.includes(user.id)) {
        button
            .reply({
                embeds: [ownerOnly(button)],
                ephemeral: true
            })
            .catch(log4js.trace);
        return {
            ok: false,
            type: 'button',
            button,
            metadata: {
                silent: true
            }
        };
    }
    return {
        ok: true,
        type: 'button',
        button,
        metadata: {
            silent: true
        }
    };
});
