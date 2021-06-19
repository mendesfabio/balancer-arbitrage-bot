import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const getProvider = () => {
  const infuraEndpoint = process.env.INFURA_ENDPOINT;

  if (!infuraEndpoint) throw Error('Infura endpoint is not defined.');

  return new ethers.providers.WebSocketProvider(infuraEndpoint);
};

export default getProvider;
