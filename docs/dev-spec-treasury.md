---
id: dev-spec-treasury
title: Treasury
---

The Treasury module is the "central bank" of the Terra economy. It monitors changes in the macroeconomic variables, and adjusts Terra monetary polices accordingly.

## Observed Macroeconomic Variables

The treasury observes two main variables:

* Periodic Tax returns: stability fee income that has been made in a given period, namely `WindowShort`. In tandem to this, the treasury also monitors the rolling average of stability fee revenues in a longer timeframe, `WindowLong`, to be able to compare the performance of tax income in a shorter time window compared to a longer one.

* Periodic Terra seigniorage burn: the amount of Terra seigniorage that has been burned \(total periodic seigniorage \* mining reward weight\) in a given period. Similar to tax returns, the treasury measures the index in light of a short and long time window.

Tax income and seigniorage burn combined makes up the total mining rewards for Luna.

## Tax Rate and Reward Weight

The treasury module has two monetary policy levers in its toolkit. The tax rate, by which it can increase fees coming in from Terra transactions, and and the mining reward weight, which is the portion of seigniorage that is burned to reward miners via scarcity. Every `WindowLong`, it re-evaluates each lever to stabilize unit staking returns for Luna, thereby optimizing for stable cash flows from Terra staking.

## Policy Constraints

```go
// PolicyConstraints wraps constraints around updating a key Treasury variable
type PolicyConstraints struct {
    RateMin       sdk.Dec  `json:"rate_min"`
    RateMax       sdk.Dec  `json:"rate_max"`
    Cap           sdk.Coin `json:"cap"`
    ChangeRateMax sdk.Dec  `json:"change_max"`
}

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

Both tax rate and seigniorage burn weight updates are limited by `PolicyConstraint`, which specifies the floor, ceiling, and the max periodic changes for each variable.

Both tax rate and seigniorage burn weight updates are limited by `PolicyConstraint`, which specifies the floor, ceiling, and the max periodic changes for each variable.

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

`sdk.Coins`

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

### Tags

The Treasury module emits the following events/tags

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