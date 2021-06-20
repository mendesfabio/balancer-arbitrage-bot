import poolAbi from '@eth/abis/WeightedPool.json';
import getProvider from '@eth/getProvider';
import { ethers } from 'ethers';

const getWeightedPoolContract = (poolId: string) => {
  const provider = getProvider();

  return new ethers.Contract(poolId.slice(0, 42), poolAbi, provider);
};

export default getWeightedPoolContract;
