import { ethers } from 'ethers';
import { getProvider } from '../../eth';
import vaultAbi from '../abis/Vault.json';
import { vaultAddress } from '../balancer';

const getVaultContract = () => {
  const provider = getProvider();

  return new ethers.Contract(vaultAddress, vaultAbi, provider);
};

export default getVaultContract;
