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

## Process Flows

### Block Lifecycle

The following processes get executed during each block transition:

#### Begin Block

- Distribution

- Slashing

#### Process Messages

#### End Block

- Crisis

- Oracle
    - If at the end of `VotePeriod`, run [Voting Procedure](dev-spec-oracle.md#voting-procedure) and **update Luna Exchange Rate**.
    - If at the end of `SlashWindow`, **penalize validators** who [missed](dev-spec-oracle.md#slashing) more `VotePeriod`s than permitted.

- Governance


- Market
    - [Replenish](dev-spec-market.md#end-block) liquidity pools, **allowing spread fees to decrease**.

- Treasury 
    - If at the end of `epoch`, update indicators, mint seigniorage, and recalibrate monetary policy levers (tax-rate, reward-weight) for the next epoch.

- Staking

