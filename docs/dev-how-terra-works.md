---
id: dev-how-terra-works
title: How Terra Works
---

> This is a summary of the main ideas from our [official whitepaper](https://s3.ap-northeast-2.amazonaws.com/terra.money.home/static/Terra_White_paper.pdf). 
>
> The latest developments regarding Terra can be found on [Agora](https://agora.terra.money/), our forum for discussing research.
{tip}

This document is intended to be a brief, non-technical summary that aims to provide readers with big-picture understanding about the Terra Platform. 

## Introduction

Terra is a distributed ledger of account balances maintained by validators. These validators follow the Tendermint DPoS algorithm and vote on blocks. In order to become a validator, one must demonstrate investment in the Terra protocol by staking their Luna tokens, a sign of skin-in-the-game that aligns their incentives with maintaining the integrity of the ledger, at the risk of losing their staked deposit. The Luna token is the native staking asset recognized by the Terra protocol and represents mining power, granting its staking validator access to transaction fees and miner rewards, allowing them to benefit from increased user adoption and growth within the Terra ecosystem. 

## Stabilization Mechanisms

### Price Stabilization

Terra achieves price-stability by algorithmically adjusting its supply according to fluctuations in demand. For instance, an increase in demand in Terra manifests in an increase in the volume of Terra transactions and as well as a surge in the price of Terra. As a result, Terra must apply some balancing, reactionary force to ensure that its price does not deviate from its peg. In this scenario, the supply of Terra must increase to compensate for the extra demand. This is known as expansion. The protocol needs to mint and sell Terra to introduce it into the market. Terra achieves this by natural efficient market forces, through the opportunism of individual arbitrageurs who can extract risk-free profit by purchasing 1 newly minted TerraSDR (worth more than its peg) for 1 SDR of Luna, banking on the difference. In essence, the value associated with the increased demand in one unit of Terra is spread out across newly minted Terra, collateralized by the Luna used to purchase it. This recaptured value in Luna, now owned by the system, is called seigniorage and represents the profit gained from minting Terra (and it costs next to nothing to mint!). 

In the opposite scenario, a fall in demand for Terra results in decreased transactional activity and a drop in the price. In this case, the supply needs to be cut to keep the peg within the acceptable stability bounds. This is called contraction, and is similarly enabled by the protocol market-maker, offering 1 SDR worth of newly minted Luna for 1 TerraSDR (which is worth less than 1 SDR). The drop in value from the decrease in demand is absorbed by Luna holders, and as the Luna supply is diluted, the value is transferred from the Luna collateral to raise the price of Terra.

So the basic mechanism behind Terra's price stability is outlined: a protocol-level market-maker for Terra/Luna swaps provides an elastic monetary policy that is both sensitive to deviations in price and swift to react to apply balancing forces through arbitrageurs who profit on the difference. So long as there is a threshold level of demand within the Terra ecosystem, be it manifested in Luna price or Terra transaction volume, the balancing act of exchanging value back and forth across currency and collateral to maintain the peg provides a robust defense against tumultuous volatility. However, it's impossible to design a perfectly stable asset under all conditions, and the Terra protocol does have vulnerabilities.

### Miner Incentive Stabilization

As mentioned before, the Terra's price stability requires a certain level of demand to persist through circumstances of extreme volatility. After all, the system fails if the total value across all Luna dips below the amount necessary to uphold the peg against an exceptionally large fall in demand for Terra. Terra derives its price-stability from stability of mining demand, because it is miners who pay in the short-term to absorb the volatility through price changes in Luna. It is thus imperative to ensure miners remain incentivized to stake Luna in all market conditions, booms and busts alike, because staking is a long-term commitment. However, there is inherent volatility in unit mining rewards, since miner reward is directly correlated with economic cycles of the Terra economy -- the more transactions, the more you make in transaction fees.

In the presence of volatile mining rewards, miners are reluctant to want to continue staking because it's difficult to determine whether or not it would be profitable, given staking involves locking away the Luna for a period of time. This uncertainty needs to be eliminated by ensuring stable mining rewards that aren't affected by Terra's market conditions. Therefore, in addition to a price-stabilization mechanism for Terra currencies, there is also a demand-stabilization mechanism for Luna which helps ensure long-term viability of the Terra system through adjusting unit mining rewards (by modulating transaction fees and Luna burnrate) to counteract volatility coming from macroeconomic trends of the Terra economy. Miners are much more comfortable making a commitment when staking if there is consistent and predictable profit, than with volatile rewards which oscillates frequently between positive and negative, and an allowance for steady growth in rewards over time compensates them for their long-term investment in the Terra network.

## Powering the Innovation of Money

Value enters the Terra ecosystem through Luna<>Fiat. Luna collateralizes Terra because 1 TerraSDR can always be exchanged for 1 SDR of Luna. Luna also stabilizes Terra since arbitrageurs will resolve the price difference and extract profit -- profits will be in Luna and Terra. For instance, if 1 TerraSDR < SDR, arbitrageurs will sell their TerraSDR for 1 SDR of Luna, that TerraSDR will be burned, 1 SDR of Luna will be minted and the arbitrageur gains the difference in Luna. Notice how this balancing act involves exchanging value between currency and collateral. Those who invest in collateral (miners / Luna holders) are investing long-term in the network and agree to absorb short-term volatility in exchange for predictable mining profit and steady growth. Terra holders pay transaction fees to miners for them shouldering the price changes. This system continues to work if there is enough value in Terra or Luna to continue the momentum of the balancing act.

Terra's value will continue to grow by encouraging more businesses to accept Terra due to its increased convenience and the benefit of its seigniorage model, meaning better fees for customers and vendors. Luna value is maintained by encouraging staking with stable mining rewards with assured growth.
