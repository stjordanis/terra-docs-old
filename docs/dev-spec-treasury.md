---
id: dev-spec-treasury
title: Treasury
---

The Treasury module acts as the "central bank" of the Terra economy, [measuring macroeconomic activity](#observed-indicators) by observing Luna rewards and [adjusting monetary policy](#monetary-policy-levers) to modulate miner incentives toward stable, long-term growth.

> While the Treasury stabilizes miner demand, the [`Market`](dev-spec-market.md) is responsible for Terra price-stability.
{note}

## Observed Indicators

The Treasury observes three macroeconomic indicators for each epoch (set to 1 week), keeping [historical records](#historical-indicators). For the epoch, consider:

- __Tax Rewards__: $T$, Income generated from transaction fees (stability fee) in a during a time interval.
- __Seigniorage Rewards__: $S$, Amount of Terra from seigniorage that has been burned.
- __Staked Luna__: $\lambda$, Total Luna that has been staked by users and bonded by their delegated validators.

Total mining rewards $R = T + S$ for Luna is simply the sum of the Tax Rewards and the Seigniorage Rewards.

Another figure of interest is the __Tax Reward per unit Luna__, represented by $ R / \lambda $.

The protocol can compute and compare the short-term ([`WindowShort`](#windowshort)) and long-term ([`WindowLong`](#windowlong)) moving averages of the above indicators to determine the relative direction and velocity of the Terra economy.

## Monetary Policy Levers

The Treasury module has two monetary policy levers to control mining incentives:

- __Tax Rate__, which adjusts the amount of income coming from Terra transactions. Note that there is also a [_tax cap_](#tax-caps) which exists for each denomination, meaning the income per transaction with that denomination is capped (currently set to 1 SDR).

- __Reward Weight__, which is the portion of seigniorage allocated for the reward pool for the ballot winners for correctly voting within the reward band of the weighted median of exchange rate in the [`Oracle`](dev-spec-oracle.md) module.

> From Columbus-3, the Reward Weight lever replaces the previous lever for controlling the rate of Luna burn in seigniorage. Now, miners are compensated through burning from swap fees, and ballot rewards in the oracle. 
{note}

After `WindowLong` epochs, the Treasury re-calibrates each lever to stabilize unit returns for Luna, thereby ensuring predictable mining rewards from staking.

Both [Tax Rate](#tax-rate) and [Reward Weight](#reward-weight) are stored as values in the `KVStore`, and can have their values updated either through passed governance proposals.

### Policy Constraints 

Updates are constrained by the [`TaxPolicy`](#taxpolicy) and [`RewardPolicy`](#rewardpolicy) parameters, respectively. The type `PolicyConstraints` specifies the floor, ceiling, and the max periodic changes for each variable. 

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

- `k.GetTaxRate(ctx) (taxRate sdk.Dec)`
- `k.SetTaxRate(ctx, taxRate sdk.Dec)`

`sdk.Dec` representing the value of the Tax Rate policy lever for the current epoch.

- default value: `sdk.NewDecWithPrec(1, 3)` (0.1%)

### Reward Weight

- `k.GetRewardWeight(ctx) sdk.Dec`
- `k.SetRewardWeight(ctx, rewardWeight sdk.Dec)`

`sdk.Dec` representing the value of the Reward Weight policy lever for the current epoch.

- default value: `sdk.NewDecWithPrec(5, 2)` (5%)

### Tax Caps

- `k.GetTaxCap(ctx, denom string) sdk.Int`
- `k.SetTaxCap(ctx, denom string, taxCap sdk.Int)`

Treasury keeps a `KVStore` that maps a denomination `denom` to an `sdk.Int` that represents that maximum income that can be generated from taxes on a transaction in that denomination. 

For instance, if a transaction's value were 100 SDT, and tax rate and tax cap 5% and 1 SDT respectively, the income generated from the transaction would be 1 SDT.

### Tax Proceeds

- `k.RecordEpochTaxProceeds(ctx, delta sdk.Coins)`
- `k.PeekEpochTaxProceeds(ctx) sdk.Coins`

`sdk.Coins`

### Epoch Initial Issuance

- `k.RecordEpochInitialIssuance(ctx)`
- `k.PeekEpochSeigniorage(ctx) sdk.Int`

`sdk.Coins` that represents the total supply of Luna at the beginning of the epoch. Recording the initial issuance will automatically use the [`Supply`](dev-spec-supply.md) to determine the total issuance of Luna. Note: peeking will return the total amount of µLuna as `sdk.Int` instead of `sdk.Coins` for convenience.

### Historical Indicators

#### Tax Rate

`sdk.Dec` by epoch (`int64` key).

#### Seigniorage Rewards

`sdk.Dec` by epoch (`int64` key).

#### Total Staked Luna

`sdk.Int` by epoch (`int64` key).

## Functions

### `k.UpdateIndicators()`

```go
func (k Keeper) UpdateIndicators(ctx sdk.Context)
```

### `k.UpdateTaxPolicy()`

```go
func (k Keeper) UpdateTaxPolicy(ctx sdk.Context) (newTaxRate sdk.Dec)
```

This function gets called at the end of an epoch to update the Tax Rate monetary lever.

Consider $ r_t $ to be the current tax rate, and $ n $ to be the [`MiningIncrement`](#miningincrement) parameter.

1. Calculate the rolling average $T_y$ of Tax Rewards per unit Luna over the last year `WindowLong`.

2. Calculate the rolling average $T_m$ of Tax Rewards per unit Luna over the last month `WindowShort`.

3. If $T_m = 0$, there was no tax revenue in the last month. The tax rate should thus be set to the maximum permitted by the Tax Policy.

4. Otherwise, the new tax rate is $r_{t+1} = (n r_t T_y)/T_m$, subject to the rules of `pc.Clamp()` (see [constraints](#policy-constraints)).

### `k.UpdateRewardPolicy()`

```go
func (k Keeper) UpdateRewardPolicy(ctx sdk.Context) (newRewardWeight sdk.Dec)
```

### `k.UpdateTaxCap()`

```go
func (k Keeper) UpdateTaxCap(ctx sdk.Context) sdk.Coins
```

### `k.SettleSeigniorage()`

```go
func (k Keeper) SettleSeigniorage(ctx sdk.Context)
```

This function is called at the end of an epoch to compute seigniorage and forwards the funds to the [`Oracle`](dev-spec-oracle.md) module for ballot rewards, and the [`Distribution`](dev-spec-distribution.md) for the community pool.

1. Let the $S(t)$ be the seignorage of epoch $t$, calculated by taking the difference between the Luna supply at the time of calling and the supply at the start of the epoch ([Epoch Initial Issuance](#epoch-initial-issuance)).

2. Let $R$ be the value of the Reward Weight lever. Amount $S(t)$ of new Luna is minted, and the [`Oracle`](dev-spec-oracle.md) module receives $S(t) * R$ of the seigniorage.

3. The remainder of the coins $ S(t) * (1 - R) $ is sent to the [`Distribution`](dev-spec-distribution.md) module, where it is allocated into the community pool.

## Transitions

### End-Block

If the blockchain is at the final block of the epoch, the following procedure is run:

1. Update all the indicators with [`k.UpdateIndicators()`](#kupdateindicators)

2. Check if the blockchain is still in the probation period.

3. [Settle seigniorage](#ksettleseigniorage) balances for the epoch by forwarding funds to the Oracle and Community-Pool accounts.

4. Calculate the [Tax Rate](#kupdatetaxpolicy), [Reward Weight](#kupdaterewardpolicy), and [Tax Cap](#kupdatetaxcap) for the next epoch.

5. Emit the [`policy_update`](#policy_update) event, recording the new policy lever values.

6. Finally, update Luna issuance with [`k.RecordEpochInitialIssuance()`](#epochinitialissuance)

## Events

The Treasury module emits the following events

### `policy_update`

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

Constraints / rules for updating the [Tax Rate](#tax-rate) monetary policy lever.

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

Constraints / rules for updating the [Reward Weight](#reward-weight) monetary policy lever.

### `SeigniorageBurdenTarget`

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(67, 2)` (5%)

### `MiningIncrement`

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(107, 2)` (107%; exponential growth)

### `WindowShort`

- type: `int64`
- default value: `4` (month = 4 weeks)

A number of epochs that specifuies a time interval for calculating short-term moving average.

### `WindowLong`

- type: `int64`
- default value: `4` (year = 52 weeks)

A number of epochs that specifies a time interval for calculating long-term moving average.

### `WindowProbation`

- type: `int64`
- default value: `12` (3 months = 12 weeks)

A number of epochs that specifies a time interval for the probationary period.

## Errors

### `ErrInvalidEpoch`

Called when the epoch queried exceeds the current epoch.