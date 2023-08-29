import { Precondition, log4js } from 'amethystjs';
import { getNode } from '../utils/toolbox';
import { notPlaying } from '../utils/contents';

export default new Precondition('playing').setChatInputRun(({ interaction }) => {
    const run = () => {
        interaction
            .reply({
                embeds: [notPlaying(interaction)],
                ephemeral: true
            })
            .catch(log4js.trace);
    };
    const node = getNode(interaction);
    if (!node) {
        run();
        return {
            ok: false,
            type: 'chatInput',
            interaction,
            metadata: {
                silent: true
            }
        };
    }
    if (!node.isPlaying() && !node.node.isPaused() && !node.node.isPlaying()) {
        run();
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
