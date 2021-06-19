import { Contract } from 'ethers';

export default async function getPoolInfo(poolId: string, vaultContract: Contract) {
  const { balances, tokens } = await vaultContract.getPoolTokens(poolId);

  const poolInfo = tokens.map((token: string, index: number) => ({
    token,
    balance: balances[index],
  }));

  return poolInfo;
}
