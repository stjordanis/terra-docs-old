---
id: dev-spec-market
title: Market
---

The Market module contains the logic for atomic swaps between Terra currencies (e.g. UST<>KRT), as well as between Terra and Luna (e.g. SDT<>Luna).

The ability to guarantee an available, liquid market with fair exchange rates between different Terra denominations and between Terra and Luna is critical for user-adoption and price-stability. 

As mentioned in the protocol, the price stability of TerraSDR's peg to the SDR is achieved through Terra<>Luna arbitrage activity against the protocol's algorithmic market-maker which expands and contracts Terra supply to maintain the peg.

## Swap Fees

Since Terra's price feed is derived from validator oracles, there is necessarily a delay between the on-chain reported price and the actual realtime price. 

This difference is on the order of about 1 minute (our oracle `VotePeriod` is 30 seconds), which is negligible for nearly all practical transactions. However an attacker could take advantage of this lag and extract value out of the network through a front-running attack.

To defend against this, the Market module enforces the following swap fees:

- a Tobin Tax (set at [0.25%](#tobintax)) for spot-converting Terra<>Terra swaps
- a minimum spread (set at [2%](#minspread)) for Terra<>Luna swaps

## Terra/Luna Swaps

A user may swap SDT \(TerraSDR\), UST \(TerraUSD\), or any other Terra currency for Luna at the exchange rate registered with the oracle, and the protocol will charge a minimum spread of 2% taken as the network's swap fee against front-running.

For example, assume that oracle reports that the Luna<>SDT exchange rate is 10, and for Luna<>KRT, 10,000. Factoring in the spread, swapping 1 SDT will return 980 KRT worth of Luna (2% of 1000 is 20, taken as the swap fee).

Using the same exchange rates in the above example, a user can swap 1 SDT for 0.1 Luna, or 0.1 Luna for 1 SDT (before spread).

### Constant Product Market-Maker

Starting with Columbus-3 (Vodka testnet), Terra now uses a Constant Product market-making algorithm to ensure liquidity for Terra<>Luna swaps.

Before, Terra had enforced a daily Luna supply change cap such that Luna could inflate or deflate only up to the cap in any given 24 hour period, after which further swaps would fail. This was to prevent excessive volatility in Luna supply which could lead to divesting attacks \(a large increase in Terra supply putting the peg at risk\) or consensus attacks \(a large increase in Luna supply being staked can lead to a consensus attack on the blockchain\).

Now, with Constant Product, we define a value $CP$ set to the size of the Terra pool multiplied by a set **fiat value of Luna**, and ensure our market-maker maintains it as invariant during any swaps through adjusting the spread.

> Our implementation of Constant Product diverges from Uniswap's, as we use the fiat value of Luna instead of the size of the Luna pool. This nuance means changes in Luna's price don't affect the product, but rather the size of the Luna pool.
{note}

$$
CP = Pool_{Terra} * Fiat_{Luna}
$$


For example, we'll start with equal pools of Terra and Luna, both worth 1000 SDR total. The size of the Terra pool is 1000 UST, and assuming the price of Luna<>SDR is 0.5, the size of the Luna pool is 2000 Luna. A swap of 100 SDT for Luna would return around 90.91 SDR worth of Luna (≈ 181.82 Luna). The offer of 100 SDT is added to the Terra pool, and the 90.91 SDT worth of Luna are taken out of the Luna pool. 

```text
CP = 1000000 SDR
(1000 SDT) * (1000 SDR of Luna) = 1000000 SDR
(1100 SDT) * (909.0909... SDR of Luna) = 1000000 SDR
```

This algorithm ensures that the Terra protocol remains liquid for Terra<>Luna swaps. Of course, this specific example was meant to be more illustrative than realistic -- with much larger liquidity pools used in production, the magnitude of the spread is diminished. 

#### Virtual Liquidity Pools

The market starts out with two liquidity pools of equal sizes, one representing Terra (all denominations) and another representing Luna, initialiazed by the parameter `BasePool`.

In practice, rather than keeping track of the sizes of the two pools, the information is encoded in a number $\delta$, which the blockchain stores as `TerraPoolDelta`, representing the deviation of the Terra pool from its base size in units µSDR.

The size of the Terra and Luna liquidity pools can be generated from $\delta$ using the following formulas:

$$ \begin{aligned}
Pool_{Terra} &= Pool_{Base} + \delta \\ \\
Pool_{Luna} &= ({Pool_{Base}})^2 / Pool_{Terra}
\end{aligned} $$

At the [end of each block](#end-block), the market module will attempt to "replenish" the pools by decreasing the magnitude of $\delta$ between the Terra and Luna pools. The rate at which the pools will be replenished toward equilibrium is set by the parameter `PoolRecoveryPeriod`, with lower periods meaning faster recovery times, denoting more sensitivity to changing prices.

This mechanism ensures liquidity and acts as a sort of low-pass filter, allowing for the spread fee (which is a function of `TerraPoolDelta`) to drop back down when changes in price are interpreted by the network as a lasting, rising trend in the true price of the peg rather than noisy spikes from temporary trading activity.

## Message Types

### `MsgSwap`

#### Swap Request

```go
// MsgSwap contains a swap request
type MsgSwap struct {
	Trader    sdk.AccAddress `json:"trader" yaml:"trader"`         // Address of the trader
	OfferCoin sdk.Coin       `json:"offer_coin" yaml:"offer_coin"` // Coin being offered
	AskDenom  string         `json:"ask_denom" yaml:"ask_denom"`   // Denom of the coin to swap to
}
```

A `MsgSwap` transaction denotes the `Trader`'s intent to swap their balance of `OfferCoin` for new denomination `AskDenom`, for both Terra<>Terra and Terra<>Luna swaps.

#### Swap Procedure

The trader can submit a `MsgSwap` transaction with the amount / denomination of the coin to be swapped, the "offer", and the denomination of the coins to be swapped into, the "ask". The Market module will then use the following procedure to process `MsgSwap`.

1. Market module receives `MsgSwap` message and performs basic validation checks
2. Calculate exchange rate $ask$ and $spread$ using [`k.ComputeSwap()`](#kcomputeswap)
3. Update `TerraPoolDelta` with [`k.ApplySwapToPool()`](#kapplyswaptopool)
4. Transfer `OfferCoin` from account to module using `supply.SendCoinsFromAccountToModule()`
5. Burn offered coins, with `supply.BurnCoins()`
6. Let $ fee = spread * ask $, this is the spread fee.
7. Mint $ ask - fee $ coins of `AskDenom` with `supply.MintCoins()`. This implicitly applies the spread fee as the $ fee $ coins are burned.
8. Send newly minted coins to trader with `supply.SendCoinsFromModuleToAccount()`
9. Emit [`swap`](#swap) event to publicize swap and record spread fee

If the trader's `Account` has insufficient balance to execute the swap, the swap transaction fails. Upon successful completion of swaps involving Luna, a portion of the coins to be credited to the user's account is withheld as the spread fee.

## State

### Pool Delta δ - `TerraPoolDelta`

- `k.GetTerraPoolDelta(ctx) sdk.Dec`
- `k.SetTerraPoolDelta(ctx, delta sdk.Dec)`

An `sdk.Dec` that represents the difference between size of current Terra pool and its original base size, valued in µSDR.

## Functions

### `k.ComputeSwap()`

```go
func (k Keeper) ComputeSwap(ctx sdk.Context, offerCoin sdk.Coin, askDenom string)
    (retDecCoin sdk.DecCoin, spread sdk.Dec, err sdk.Error)
```

This function detects the swap type from the offer and ask denominations and returns:

1. The amount of asked coins that should be returned for a given `offerCoin`. This is achieved by first spot-converting `offerCoin` to µSDR and then from µSDR to the desired `askDenom` with the proper exchange rate reported from by the Oracle.

2. The spread % that should be taken as a swap fee given the swap type. Terra<>Terra swaps simply have the Tobin Tax spread fee. Terra<>Luna spreads are the greater of `MinSpread` and spread from Constant Product pricing.

If the `offerCoin`'s denomination is the same as `askDenom`, this will raise `ErrRecursiveSwap`.

> `k.ComputeSwap()` uses `k.ComputeInternalSwap()` internally, which just contains the logic for calculating proper ask coins to exchange, without the Constant Product spread.
{note}


### `k.ApplySwapToPool()`

```go
func (k Keeper) ApplySwapToPool(ctx sdk.Context, offerCoin sdk.Coin, askCoin sdk.DecCoin) sdk.Error
```

`k.ApplySwapToPools()` is called during the swap to update the blockchain's measure of $\delta$, `TerraPoolDelta`, when the balances of the Terra and Luna liquidity pools have changed. 

Terra currencies share the same liquidity pool, so `TerraPoolDelta` remains unaltered during Terra<>Terra swaps.

For Terra<>Luna swaps, the relative sizes of the pools will be different after the swap, and $\delta$ will be updated with the following formulas:

- For Terra to Luna, $ \delta' = \delta + Offer_{\mu SDR} $
- For Luna to Terra, $ \delta' = \delta - Ask_{\mu SDR} $

## Transitions

### End-Block

Market module calls `k.ReplenishPools()` at the end of every block, which decreases the value of `TerraPoolDelta` (which measures the difference between Terra and Luna pools) depending on `PoolRecoveryPeriod`, $pr$.

$$ \delta_{t+1} = \delta_{t} - (\delta_{t}/{pr}) $$

This allows the network to sharply increase spread fees in during acute price fluctuations, and automatically return the spread to normal after some time when the price change is long term.

## Events

The Market module emits the following events

### swap

| Key | Value |
| :-- | :-- |
| `"offer"` | offered coins |
| `"trader"` | trader's address |
| `"swap_coin"` | swapped coins |
| `"swap_fee"` | spread fee |


## Parameters

```go
type Params struct {
	PoolRecoveryPeriod int64   `json:"pool_recovery_period" yaml:"pool_recovery_period"`
	BasePool           sdk.Dec `json:"base_pool" yaml:"base_pool"`
	MinSpread          sdk.Dec `json:"min_spread" yaml:"min_spread"`
	TobinTax           sdk.Dec `json:"tobin_tax" yaml:"tobin_tax"`
}
```

### `PoolRecoveryPeriod`

Number of blocks it takes for the Terra & Luna pools to naturally "reset" toward equilibrium  ($\delta \to 0$) through automated pool replenishing.

- type: `int64`
- default value: `14400` (`core.BlocksPerDay`)

### `BasePool`

Initial starting size of both Terra and Luna liquidity pools.

- type: `sdk.Dec`
- default value: `sdk.NewDec(250000 * core.MicroUnit)` (250,000 SDR = 250,000,000,000 µSDR)

### `MinSpread`

Minimum spread charged on Terra<>Luna swaps to prevent leaking value from front-running attacks.

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(2, 2)` (2%)

### `TobinTax`

A fee added on for swap between Terra currencies (spot-trading).

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(25, 4)` (0.25%)


## Errors

### `ErrNoEffectivePrice`

Called when a price for the asset is not registered with the oracle.

### `ErrInsufficientSwapCoins`

Called when not enough coins are being requested for a swap.

### `ErrRecursiveSwap`

Called when Ask and Offer coin denominations are equal.