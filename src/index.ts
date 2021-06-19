import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import vaultAbi from './lib/eth/abis/Vault.json';
import { vaultAddress } from './lib/eth/balancer';
import { balDaiPool, balWethPool, wethDaiPool } from './lib/eth/balancer/pools';
import { tokenList } from './lib/eth/tokens';
dotenv.config();

const getProvider = () => {
  const infuraEndpoint = process.env.INFURA_ENDPOINT;

  if (!infuraEndpoint) throw Error('Infura endpoint is not defined.');

  return new ethers.providers.WebSocketProvider(infuraEndpoint);
};

const getVaultContract = () => {
  const provider = getProvider();
  return new ethers.Contract(vaultAddress, vaultAbi, provider);
};

const getTokenData = (address: string, balance: number) => ({
  address,
  symbol: getTokenSymbolFromAddress(address),
  weight: undefined,
  balance: ethers.utils.formatEther(balance),
});

async function getPoolInfo(poolId: string) {
  const vaultContract = getVaultContract();

  const { balances, tokens } = await vaultContract.getPoolTokens(poolId);

  const tokenInfo = tokens.map((token, index) =>
    getTokenData(token, balances[index]),
  );

  return { poolId, swapFee: undefined, tokens: tokenInfo };
}

const getTokenSymbolFromAddress = (inputAddress: string) => {
  return tokenList.filter(({ address }) => address == inputAddress)[0].symbol;
};

(async function () {
  const pools = [balWethPool, balDaiPool, wethDaiPool];
  const poolsInfo = await Promise.all(
    pools.map(async (poolId) => getPoolInfo(poolId)),
  );

  console.log(JSON.stringify(poolsInfo, null, 4));
})();
