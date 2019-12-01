---
id: dev-spec-distribution
title: Distribution
---

> Terra's Distribution module inherits from Cosmos SDK's [`distribution`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/distribution) module. This document is a stub, and covers mainly important Terra-specific notes about how it is used.
{note}

The `Distribution` module describes a mechanism that keeps track of collected fees and *passively* distributes them to validators and delegators. In addition, the Distribution module also defines the [Community Pool](#community-pool), which are funds under the control of on-chain Governance.

## Validator and Delegator Rewards

> Passive distribution means that validators and delegators will have to manually collect their fee rewards by submitting withdrawal transactions. Read up on how to do so with `terracli` [here](node-terracli.md#distribution).

Collected rewards are pooled globally and divided out passively to validators and delegators. Each validator has the opportunity to charge commission to the delegators on the rewards collected on behalf of the delegators. Fees are collected directly into a global reward pool and validator proposer-reward pool. Due to the nature of passive accounting, whenever changes to parameters which affect the rate of reward distribution occurs, withdrawal of rewards must also occur.

## Community Pool

The Community Pool is a reserve of tokens that is designated for funding projects that promote further adoption and stimulate growth for the Terra economy. The portion of seigniorage that is designated for ballot winners of the Exchange Rate Oracle is called the Reward Weight, a value governed by the [Treasury](dev-spec-treasury.md#reward-weight). The rest of that seigniorage is all dedicated to the Community Pool.

## Governance Proposals

The Distribution module defines a special proposal that upon being passed, will disburse the coins specified in `Amount` to the `Recipient` account using funds from the Community Pool.

### `CommunitySpendProposal`

```go
type CommunityPoolSpendProposal struct {
	Title       string         `json:"title" yaml:"title"`
	Description string         `json:"description" yaml:"description"`
	Recipient   sdk.AccAddress `json:"recipient" yaml:"recipient"`
	Amount      sdk.Coins      `json:"amount" yaml:"amount"`
}
```