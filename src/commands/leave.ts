import { AmethystCommand, log4js } from 'amethystjs';
import playing from '../preconditions/playing';
import connected from '../preconditions/connected';
import connectedSameChannel from '../preconditions/connectedSameChannel';
import { getNode } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'quitter',
    description: 'Quitte le salon vocal en cours',
    preconditions: [playing, connected, connectedSameChannel]
}).setChatInputRun(async ({ interaction }) => {
    getNode(interaction).node.stop(true);
    interaction.reply("🎧 | J'ai quitté le salon vocal").catch(log4js.trace);
});
