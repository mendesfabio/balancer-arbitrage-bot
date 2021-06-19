import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

import vaultAbi from './abis/Vault.json';
import {
  vaultAddress, balWethPool, balDaiPool, wethDaiPool,
} from './constants';

dotenv.config();

const infuraEndpoint = String(process.env.INFURA_ENDPOINT);

const provider = new ethers.providers.WebSocketProvider(infuraEndpoint);

const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, provider);

const pools = [balWethPool, balDaiPool, wethDaiPool];

async function getPoolInfo(poolId: string) {
  const { balances, tokens } = await vaultContract.getPoolTokens(poolId);

  const poolInfo = tokens.map((token: string, index: number) => ({
    token,
    balance: ethers.utils.formatEther(balances[index]),
  }));

  return poolInfo;
}

// eslint-disable-next-line func-names
(async function () {
  const poolsInfo = await Promise.all(pools.map(async (poolId) => getPoolInfo(poolId)));

  // eslint-disable-next-line no-console
  console.log(poolsInfo);
}());
