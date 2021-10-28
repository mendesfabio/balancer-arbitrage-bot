import vaultAbi from './abis/Vault.json';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

const getProvider = () => {
  const infuraEndpoint = process.env.INFURA_ENDPOINT;

  if (!infuraEndpoint) throw Error('Infura endpoint is not defined.');

  return new ethers.providers.JsonRpcProvider(infuraEndpoint);
};

const getVaultContract = () => {
  const provider = getProvider();

  return new ethers.Contract(vaultAddress, vaultAbi, provider);
};

(async function () {

  const kind = 0;

  const assets = [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0xba100000625a3754423978a60c9317c58a424e3D',
  ];

  const funds = {
    sender: '0x0000000000000000000000000000000000000000',
    recipient: '0x0000000000000000000000000000000000000000',
  };

  const swaps = [
    {
      poolId:
        '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
      assetInIndex: '1',
      assetOutIndex: '0',
      amount: ethers.utils.parseEther('1'),
      userData: '0x',
    },
  ];

  const vaultContract = getVaultContract();

  const args = [kind, swaps, assets, funds];

  const result = await vaultContract.callStatic.queryBatchSwap(...args);

  console.log(result);
})();
