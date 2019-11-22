---
id: dev-spec-treasury
title: Treasury
---

The Treasury module is the "central bank" of the Terra economy. It keeps track of income from stability fees and other mining rewards, measures macroeconomic activity, and modulates Luna miner incentive toward stable, long-term growth through adjustment of Tax Rate and Reward Weight.

## Observed Indicators

The Treasury observes and records three indicators for each epoch (set to 1 week). The protocol then computes and compares the short-term (`WindowShort`) and long-term (`WindowLong`) moving averages to be able to determine the relative direction and velocity of the macroeconomic activity.

- __Tax Rewards__: Income generated from transaction fees (stability fee) in a during a time interval.

- __Seigniorage Rewards__: Amount of Terra from seigniorage that has been burned.

- __Staked Luna__: Total Luna that has been staked by users and bonded by their delegated validators.

The Total Mining Rewards for Luna is equal to the sum of the Tax Rewards and the Seigniorage Rewards.

## Monetary Policy Levers

The Treasury module has two monetary policy levers:

- __Tax Rate__, which adjusts the amount of income coming from Terra transactions.

- __Reward Weight__, also known as _Luna burn rate_, which is the portion of seigniorage that is burned to reward miners by creating scarcity within Luna.

Every `WindowLong`, the Treasury re-evaluates each lever to stabilize unit staking returns for Luna, thereby ensuring stable and predictable minign rewards from staking.

## Policy Constraints

Both Tax Rate and Reward Weight updates are constrained by the [`TaxPolicy`](#taxpolicy) and [`RewardPolicy`](#rewardpolicy) parameters. The type `PolicyConstraint` specifies the floor, ceiling, and the max periodic changes for each variable. 

```go
// PolicyConstraints wraps constraints around updating a key Treasury variable
type PolicyConstraints struct {
    RateMin       sdk.Dec  `json:"rate_min"`
    RateMax       sdk.Dec  `json:"rate_max"`
    Cap           sdk.Coin `json:"cap"`
    ChangeRateMax sdk.Dec  `json:"change_max"`
}
```

The logic for constraining a policy lever update is performed by `pc.Clamp()`, shown below.

```go
// Clamp constrains a policy variable update within the policy constraints
func (pc PolicyConstraints) Clamp(prevRate sdk.Dec, newRate sdk.Dec) (clampedRate sdk.Dec) {
	if newRate.LT(pc.RateMin) {
		newRate = pc.RateMin
	} else if newRate.GT(pc.RateMax) {
		newRate = pc.RateMax
	}

	delta := newRate.Sub(prevRate)
	if newRate.GT(prevRate) {
		if delta.GT(pc.ChangeRateMax) {
			newRate = prevRate.Add(pc.ChangeRateMax)
		}
	} else {
		if delta.Abs().GT(pc.ChangeRateMax) {
			newRate = prevRate.Sub(pc.ChangeRateMax)
		}
	}
	return newRate
}
```

## Proposal Types

Instead of handling `Msg`s like [`Oracle`](dev-spec-oracle.md) and [`Market`](dev-spec-market.md), the Treasury module responds to [`Governance`](dev-spec-governance.md) proposals.

### `TaxRateUpdateProposal`

```go
type TaxRateUpdateProposal struct {
	Title       string  `json:"title" yaml:"title"`             // Title of the Proposal
	Description string  `json:"description" yaml:"description"` // Description of the Proposal
	TaxRate     sdk.Dec `json:"tax_rate" yaml:"tax_rate"`       // target TaxRate
}
```

At the point of evaluation, the treasury hikes up tax rates when tax revenues in a shorter time window is performing poorly in comparison to the longer term tax revenue average. It lowers tax rates when short term tax revenues are outperforming the longer term index.

### `RewardWeightUpdateProposal`

```go
type RewardWeightUpdateProposal struct {
	Title        string  `json:"title" yaml:"title"`                 // Title of the Proposal
	Description  string  `json:"description" yaml:"description"`     // Description of the Proposal
	RewardWeight sdk.Dec `json:"reward_weight" yaml:"reward_weight"` // target RewardWeight
}
```

The Treasury mirrors the tax rate when adjusting the mining reward weight. It observes the overall burden seigniorage burn needs to bear in the overall reward profile, `SeigniorageBurdenTarget`, and hikes up rates accordingly as tax rates rise. In order to make sure that unit mining rewards do not stay stagnant, the treasury adds a `MiningIncrement` to each policy update, such that mining rewards increase steadily over time.

## State

### Tax Rate

`sdk.Dec` representing the on-chain tax rate for the current epoch.

- default value: `sdk.NewDecWithPrec(1, 3)` (0.1%)

### Reward Weight

`sdk.Dec` representing the on-chain reward weight for the current epoch.

- default value: `sdk.NewDecWithPrec(5, 2)` (5%)

### Tax Caps

`sdk.Int` indexed per denomination `denom`.

### Tax Proceeds

`sdk.Coins`

### Epoch Initial Issuance

- `k.GetEpochInitialIssuance(ctx) (res sdk.Coins)`
- `k.RecordEpochInitialIssuance(ctx)`
- `k.SetEpochInitialIssuance(ctx, issuance sdk.Coins)`
- `k.PeekEpochSeigniorage(ctx) sdk.Int`

An `sdk.Coins` that represents the total supply of Luna at the beginning of the epoch. Note that peeking will give the total amount of µLuna instead of `sdk.Coins` for convenience.

### Historical Indicators

#### Tax Rate

`sdk.Dec` by epoch (`int64` key).

#### Seigniorage Rewards

`sdk.Dec` by epoch (`int64` key).

#### Total Staked Luna

`sdk.Int` by epoch (`int64` key).

## Functions

## Transitions

### End-Block

At the end of each block, the Treasury module checks if it's the end of the epoch. If so, the following procedure is:

1. Update all the indicators with `k.UpdateIndicators()`

2. Check if the blockchain is still in the probation period.

3. Settle all open seigniorage balances for the epoch and forward funds to the Oracle and Community-Pool accounts

4. Calculate the Tax Rate, Reward Weight, and Tax Cap for the next epoch.

5. Emit the [`policy_update`](#policy_update) event, recording the new policy lever values.

6. Finally, update Luna issuance with `k.RecordEpochInitialIssuance()`


## Events

The Treasury module emits the following events

### policy_update

| Key | Value |
| :-- | :-- |
| `"tax_rate"` | tax rate |
| `"reward_weight"` | reward weight |
| `"tax_cap"` | tax cap |

## Parameters

```go
type Params struct {
	TaxPolicy               PolicyConstraints `json:"tax_policy" yaml:"tax_policy"`
	RewardPolicy            PolicyConstraints `json:"reward_policy" yaml:"reward_policy"`
	SeigniorageBurdenTarget sdk.Dec           `json:"seigniorage_burden_target" yaml:"seigniorage_burden_target"`
	MiningIncrement         sdk.Dec           `json:"mining_increment" yaml:"mining_increment"`
	WindowShort             int64             `json:"window_short" yaml:"window_short"`
	WindowLong              int64             `json:"window_long" yaml:"window_long"`
	WindowProbation         int64             `json:"window_probation" yaml:"window_probation"`
}
```

### `TaxPolicy`

- type: `PolicyConstraints`
- default value:

```go
DefaultTaxPolicy = PolicyConstraints{
    RateMin:       sdk.NewDecWithPrec(5, 4), // 0.05%
    RateMax:       sdk.NewDecWithPrec(1, 2), // 1%
    Cap:           sdk.NewCoin(core.MicroSDRDenom, sdk.OneInt().MulRaw(core.MicroUnit)), // 1 SDR Tax cap
    ChangeRateMax: sdk.NewDecWithPrec(25, 5), // 0.025%
}
```

### `RewardPolicy`

- type: `PolicyConstraints`
- default value:

```go
DefaultRewardPolicy = PolicyConstraints{
    RateMin:       sdk.NewDecWithPrec(5, 2), // 5%
    RateMax:       sdk.NewDecWithPrec(90, 2), // 90%
    ChangeRateMax: sdk.NewDecWithPrec(25, 3), // 2.5%
    Cap:           sdk.NewCoin("unused", sdk.ZeroInt()), // UNUSED
}
```

### `SeigniorageBurdenTarget`

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(67, 2)` (5%)

### `MiningIncrement`

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(107, 2)` (107%; exponential growth)

### `WindowShort`

- type: `int64`
- default value: `4` (month = 4 weeks)

### `WindowLong`

- type: `int64`
- default value: `4` (year = 52 weeks)

### `WindowProbation`

- type: `int64`
- default value: `12` (3 months = 12 weeks)

## Errors

### `ErrInvalidEpoch`

Called when the epoch queried exceeds the current epoch.