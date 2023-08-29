import { CoinsManager } from 'coins-manager';
import { database } from '../utils/query';

const manager = new CoinsManager(database, { type: 'multiguild' });
manager.start();

export default manager;
