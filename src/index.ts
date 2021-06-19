import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import vaultAbi from './lib/eth/abis/Vault.json';
import poolAbi from './lib/eth/abis/WeightedPool.json';
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

const getWeightedPoolContract = (poolId: string) => {
  const provider = getProvider();

  return new ethers.Contract(poolId.slice(0, 42), poolAbi, provider);
};

const getTokenData = (address: string, balance: number, weight: number) => ({
  address,
  symbol: getTokenSymbolFromAddress(address),
  weight,
  balance,
});

async function getPoolInfo(poolId: string) {
  const vaultContract = getVaultContract();

  const poolContract = getWeightedPoolContract(poolId);

  const weights = (await poolContract.getNormalizedWeights()).map(
    (bn: ethers.BigNumber) => parseFloat(ethers.utils.formatEther(bn)),
  );

  const swapFee = parseFloat(
    ethers.utils.formatEther(await poolContract.getSwapFeePercentage()),
  );

  const { balances, tokens } = await vaultContract.getPoolTokens(poolId);

  const tokenInfo = tokens.map((token: string, index: number) =>
    getTokenData(token, balances[index], weights[index]),
  );

  return { poolId, swapFee, tokens: tokenInfo };
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

  poolsInfo.map(({ tokens }) => {
    const [first, second] = tokens;

    const relativePrice =
      (first.balance / second.balance) * (first.weight / second.weight);

    console.log(`${first.symbol}/${second.symbol}: ${relativePrice}`);
  });
})();
