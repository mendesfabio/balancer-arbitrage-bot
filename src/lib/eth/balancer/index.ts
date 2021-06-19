import getVaultContract from './getVaultContract';
import * as pools from './pools';

export const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

export default { ...pools, vaultAddress, getVaultContract };
