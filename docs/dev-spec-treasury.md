---
id: dev-spec-treasury
title: Treasury
---

The Treasury module is the "central bank" of the Terra economy. It monitors changes in the macroeconomic variables, and adjusts Terra monetary polices accordingly.

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

### `RewardWeightUpdateProposal`

```go
type RewardWeightUpdateProposal struct {
	Title        string  `json:"title" yaml:"title"`                 // Title of the Proposal
	Description  string  `json:"description" yaml:"description"`     // Description of the Proposal
	RewardWeight sdk.Dec `json:"reward_weight" yaml:"reward_weight"` // target RewardWeight
}
```

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