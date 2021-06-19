# Balancer Arbitrage Bot - HackMoney

Design an arbitrage bot that resolves price discrepancies between Balancer V2 and other popular DEXs (e.g., Uniswap, Sushiswap, Curve)

The bot should also take advantage of “Flash Swaps” within Balancer V2 itself, equalizing prices across many Balancer pools without requiring any token reserves.

1. Research for a set of pools we are going to arbitrage between them. 

- https://app.balancer.fi/#/

2. Fetch pools balances using Balancer Vault API.

- https://docs.balancer.fi/developers/smart-contracts/apis/vault

3. Write the logic to detect (and maximize) profitable opportunities between the selected pools.

- https://hackernoon.com/arbitrage-as-a-shortest-path-problem-u2l34ow
- https://balancer.fi/whitepaper.pdf

4. Verify whether the arbitrage is possible using Vault's `queryBatchSwap`function. 

- https://docs.balancer.fi/developers/smart-contracts/apis/vault#querybatchswap

5. Make the swap function itself combining batch swaps, flash swaps and internal balances.

- https://docs.balancer.fi/developers/guides/batch-swaps
- https://docs.balancer.fi/developers/guides/flash-swaps

6. Explore ways to defend our transaction against front-running bots.

- https://arxiv.org/pdf/1904.05234.pdf

## Todo

- find ideal path;
  - can use Balancer's `batch swap` API to verify if a batch swap would go through without spending gas;
- hide from front-running bots;
  - transaction with an account and send profits to another;
  - write a smart contract that executes the swap and returns part of the profits to you and part to the front running bot (would be nice because even if we could send the minimum amount of gas frontrunnning bots would have an incentive to pay for the transaction to profit from it.)

## Addresses

### Vault

- 0xBA12222222228d8Ba445958a75a0704d566BF2C8

### Tokens

- BAL - 0xba100000625a3754423978a60c9317c58a424e3D
- DAI - 0x6B175474E89094C44Da98b954EedeAC495271d0F
- WETH - 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

### Pools

- 60/40 WETH/DAI - 0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a
- 80/20 BAL/WETH - 0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014
- 50/50 BAL/DAI - 0x4626d81b3a1711beb79f4cecff2413886d461677000200000000000000000011
