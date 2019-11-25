---
id: dev-architecture
title: Architecture
---

Terra Core is built using the [Cosmos SDK](https://cosmos.network/sdk), which provides a robust framework for constructing blockchains that run atop the [Tendermint](https://tendermint.com/) Consensus Protocol. It is highly recommended that you review these projects before diving into the Terra developer documentation, as they assume familiarity with concepts such as ABCI, Validators, Keepers, Message Handlers, etc.

## Modules Overview

The node software is organized into individual modules that implement different parts of the Terra protocol. Here are they, listed by the order of their genesis.

1. `genaccounts` - import & export genesis account
2. [`distribution`](dev-spec-distribution.md): distribute rewards between validators and delegators
    - tax and reward distribution
    - community pool
3. [`staking`](dev-spec-staking.md): validators and Luna
4. [`auth`](dev-spec-auth.md): ante handler
    - vesting accounts
    - stability layer fee
5. [`bank`](dev-spec-bank.md) - sending funds from account to account
6. `slashing` - low-level Tendermint slashing (double-signing, etc)
7. [`supply`](dev-spec-supply.md) - Terra / Luna supplies
8. [`oracle`](dev-spec-oracle.md) - exchange rate feed oracle
    - vote tallying weighted median
    - ballot rewards
    - slashing misbehaving oracles
9. [`treasury`](dev-spec-treasury.md): miner incentive stabilization
    - macroecnomic monitoring
    - monetary policy levers (Tax Rate, Reward Weight)
    - seigniorage settlement
10. [`gov`](dev-spec-governance.md): on-chain governance
    - proposals
    - parameter updating
11. [`market`](dev-spec-market.md): price-stabilization
    - Terra<>Terra spot-conversion, Tobin Tax
    - Terra<>Luna market-maker, Constant-Product spread
12. `crisis` - reports consensus failure state with proof to halt the chain
13. `genutil` - handles `gentx` commands
    - filter and handle `MsgCreateValidator` messages

## Conventions

### Currency Denominations

There are two types of tokens that can be held by accounts and wallets in the Terra protocol:

1) **Terra Stablecoins** are transactional assets that are track the exchange rate of various fiat currencies. By convention, given a fiat currency, the Terra peg that corresponds to it is Terra-`<3-letter ISO4217 currency-code>` (see [here](https://www.xe.com/iso4217.php)) abbreviated `<country-code>T`, where the `T` replaces the currency's designator. For instance, TerraKRW is the peg for the Korean Won, and is abbreviated KRT.

    The flagship, standard Terra currency is TerraSDR, or SDT, the peg to the IMF's Special Drawing Rights. The protocol will use SDT as its default, "base" currency to do calculations and setting standards. 

2) **Luna**, the native staking asset that entitles the staking delegator to mining rewards (including exchange rate ballot rewards) if bonded to an active validator. Also is necessary for making governance proposals and collateralizes the Terra economy.

Both Terra (of all denominations) and Luna tokens are divisible up to microunits ($\times 10^{-6}$). The micro-unit is considered the atomic unit of tokens, and cannot be further divided. Below is a list of several denominations that are recognized by the protocol at the time of writing:

| Denomination | Micro-Unit | Code | Value |
| :-- | :-- | :-- | :-- |
| Luna | µLuna | `uluna` | 0.000001 Luna |
| TerraSDR | µSDR | `usdr` | 0.000001 SDT |
| TerraKRW | µKRW | `ukrw` | 0.000001 KRT |
| TerraUSD | µUSD | `uusd` | 0.000001 UST |
| TerraMNT | µMNT | `umnt` | 0.000001 MNT |

Note that the Terra protocol is only aware of the value of fiat currencies through their Terra stablecoin counterparts, which are assumed to trade relatively close to the value of the fiat currency they are pegged to, due to arbitrage activity.