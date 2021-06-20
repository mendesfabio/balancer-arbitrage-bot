import { ethers } from 'ethers';
import getTokenSymbolFromAddress from './getTokenSymbolFromAddress';

const getTokenData = (address: string, balance: number, weight: number) => ({
  address,
  symbol: getTokenSymbolFromAddress(address),
  weight,
  balance,
  balance1: parseFloat(ethers.utils.formatEther(balance)),
});

export default getTokenData;
