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

  return new ethers.providers.JsonRpcProvider(infuraEndpoint);
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
  balance1: parseFloat(ethers.utils.formatEther(balance)),
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

  // console.log(JSON.stringify(poolsInfo, null, 4));

  let pricePairs = { BAL: null, DAI: null, WETH: null };

  poolsInfo.map(({ tokens }) => {
    const [first, second] = tokens;

    const relativePrice =
      (first.balance / second.balance) * (second.weight / first.weight);

    const nodes = {
      [first.symbol]: {
        [second.symbol]: relativePrice,
      },
      [second.symbol]: {
        [first.symbol]: 1 / relativePrice,
      },
    };

    for (const token in nodes) {
      if (!pricePairs[token]) {
        Object.assign(pricePairs, { ...pricePairs, [token]: nodes[token] });
      } else {
        Object.assign(pricePairs, {
          ...pricePairs,
          [token]: { ...pricePairs[token], ...nodes[token] },
        });
      }
    }
    //console.log(nodes);
  });
  //console.log(pricePairs);

  const paths = []

  for (const token in pricePairs) {

    for (const bar in pricePairs[token]) {

      const first = {pair: [token, bar], price: pricePairs[token][bar]}

      const foo = Object.keys(pricePairs[bar]).filter((item) => item !== token)[0]

      const second = {pair: [bar, foo], price: pricePairs[bar][foo]}

      const third = {pair: [foo, token], price: pricePairs[foo][token]}

      paths.push([first, second, third])
    }
  }

  const rates = paths.map(path => {
    return path.map(({price}) => price).reduce((acc, cur) => {
      return acc * cur
    })
  })

  const kind = 0;

  const assets = [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  ]

  const funds = {
    "sender": "0xE64F06F695De4C4E21BA8F383a2675Fd884Ac720",
    "recipient": "0xE64F06F695De4C4E21BA8F383a2675Fd884Ac720"
  }

  const swaps = [
    {
      "poolId": "0x0297e37f1873d2dab4487aa67cd56b58e2f27875000200000000000000000003",
      "assetInIndex": "1",
      "assetOutIndex": "0",
      "amount": ethers.utils.parseEther("0.05"),
      "userData": "0x",
    },
    {
      "poolId": "0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e",
      "assetInIndex": "0",
      "assetOutIndex": "1",
      "amount": ethers.utils.parseEther("0.05"),
      "userData": "0x",
    }
  ]

  const vaultContract = getVaultContract();

  const args = [kind, swaps, assets, funds]

  const result = await vaultContract.callStatic.queryBatchSwap(...args);

  console.log('res', result.map((res) => ethers.utils.formatEther(res)));

  console.log(assets, paths[1])
})();

// BAL DAI WETH
// WETH DAI BAL

// BAL WETH DAI
// DAI WETH BAL

// WETH BAL DAI
// DAI BAL WETH

// (WETH -> BAL) -> (BAL -> DAI) -> (DAI -> WETH)
// ((114.5)*19.33)*1/2177.35 = 1,016504007164673

// (DAI -> BAL) -> (BAL -> WETH) -> (WETH -> DAI)
// ((1/19.33)*(1/114.50))*(2177.35) = 0,983763952676677

// (WETH -> BAL) == (BAL -> ETH)
// (DAI -> WETH) == (WETH -> DAI)
// (BAL -> WETH) == (WETH -> BAL)
