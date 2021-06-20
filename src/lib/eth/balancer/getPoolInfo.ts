import getVaultContract from '@balancer/getVaultContract';
import getWeightedPoolContract from '@balancer/getWeightedPoolContract';
import getTokenData from '@lib/getTokenData';
import { ethers } from 'ethers';

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

export default getPoolInfo;
