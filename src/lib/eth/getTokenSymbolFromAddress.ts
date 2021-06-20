import { tokenList } from '@eth/tokens';

const getTokenSymbolFromAddress = (inputAddress: string) => {
  return tokenList.filter(({ address }) => address == inputAddress)[0].symbol;
};

export default getTokenSymbolFromAddress;
