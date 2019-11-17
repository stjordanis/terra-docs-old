---
id: dev-spec-market
title: Market
---

The Market module contains the logic for atomic swaps between Terra currencies (e.g. UST<>KRT), as well as between Terra and Luna (e.g. SDT<>LUNA).

A user can swap SDT \(TerraSDR\), UST \(TerraUSD\), or any other Terra currency for Luna at the exchange rate registered with the oracle, and the network will charge a minimum spread of 2% taken as the network's swap fee against front-running.

For example, assume that oracle reports that the Luna<>SDT exchange rate is 10, and for Luna<>KRT, 10,000. Factoring in the spread, swapping 1 SDT will return 980 KRT worth of Luna (2% of 1000 is 20, taken as the swap fee).

Using the same exchange rates in the above example, a user can swap 1 SDT for 0.1 Luna, or 0.1 Luna for 1 SDT (before spread).

## Constant Product Market-Maker

Starting with Columbus-3 (Vodka testnet), Terra now uses a constant-product automated market making algorithm to ensure liquidity for Terra<>Luna swaps.

Before, Terra had enforced a daily Luna supply change cap such that Luna could inflate or deflate only up to the cap in any given 24 hour period, after which further swaps would fail. This was to prevent excessive volatility in Luna supply which could lead to divesting attacks \(a large increase in Terra supply putting the peg at risk\) or consensus attacks \(a large increase in Luna supply being staked can lead to a consensus attack on the blockchain\).

Now, with constant-product, the following invariant CP is maintained throughout any swaps, and informs the market-maker on how to properly price swaps whilst maintaining liquidity:

```text
CP = (Total units of TerraSDR Pool) * (Total SDR value of Luna Pool)
```

For example, we'll start with equal pools of Terra and Luna, both worth 1000 SDR total. The size of the Terra pool is 1000 UST, and assuming the price of Luna<>SDR is 0.5, the size of the Luna pool is 2000 Luna. A swap of 100 SDT for Luna would return around 90.91 SDR worth of Luna (~= 181.82 LUNA). The offer of 100 SDT is added to the Terra pool, and the 90.91 SDT worth of Luna are taken out of the Luna pool. 

```text
CP = 1000000 SDR
(1000 SDT) * (1000 SDR of Luna) = 1000000 SDR
(1100 SDT) * (909.0909... SDR of Luna) = 1000000 SDR
```

This algorithm ensures that the Terra protocol remains liquid for Terra<>Luna swaps. Of course, this specific example was meant to be more illustrative than realistic -- with much larger liquidity pools used in production, the magnitude of the spread is diminished. 

### Auto-Replenishing Liquidity Pools

The market starts out with two liquidity pools of equal sizes, one representing Terra (all denominations) and another representing Luna, initialiazed by the parameter `BasePool`. The blockchain maintains in its state `TerraPoolDelta`, which is a number that represents the deviation between Terra/Luna pools from their initial base values -- one number that  provides a descriptive snapshot of the demand difference.

At the end of each block, the market module will "replenish" the pools by decreasing the delta between the Terra and Luna pools. The rate at which the pools will be replenished toward equilibrium is set by the parameter `PoolRecoveryPeriod`, with lower periods meaning faster recovery times, denoting more sensitivity to changing prices.

This mechanism ensures liquidity and acts as a sort of low-pass filter, allowing for the spread fee (which is calculated by the delta) to drop back down when changes in price are interpreted by the network as a lasting, rising trend in the true price of the peg rather than spikes from large, temporary positions from trading. 

## Defense Mechanisms

Since Terra's price feed is derived from validator oracles, there is necessarily a delay between the on-chain reported price and the actual realtime price. 

This difference is on the order of about 1 minute (our oracle `VotePeriod` is 30 seconds), which is negligible for nearly all practical transactions. However an attacker could take advantage of this lag and extract value out of the network through a front-running attack.

To defend against this, Terra has implemented the following mechanisms:

- a Tobin Tax (set at 0.3%) for spot-trading Terra<>Terra swaps
- a minimum spread (currently set at 2%) for Terra<>Luna swaps

## Message Types

### Swap Request - `MsgSwap`

```go
// MsgSwap contains a swap request
type MsgSwap struct {
	Trader    sdk.AccAddress `json:"trader" yaml:"trader"`         // Address of the trader
	OfferCoin sdk.Coin       `json:"offer_coin" yaml:"offer_coin"` // Coin being offered
	AskDenom  string         `json:"ask_denom" yaml:"ask_denom"`   // Denom of the coin to swap to
}
```

A `MsgSwap` transaction denotes the `Trader`'s intent to swap their balance of `OfferCoin` for new denomination `AskDenom`.

#### Swap Procedure

The trader can submit a `MsgSwap` transaction with the amount / denomination of the coin to be swapped, the "offer", and the denomination of the coins to be swapped into, the "ask".

1. Market module receives `MsgSwap` message and performs basic validation checks
2. Calculate exchange rate and spread using [`ComputeSwap()`](#computeswap)
3. Update new Terra/Luna pool deltas with [`ApplySwapToPool()`](#applyswaptopool)
4. Transfer coins from account to module using `supply.SendCoinsFromAccountToModule()`
5. Charge a spread (if applicable), by subtracting from asked coins
6. Burn offered coins, with `supply.BurnCoins()`
7. Mint asked coins (after spread is subtracted) with `supply.MintCoins()`
8. Send newly minted coins to trader `supply.SendCoinsFromModuleToAccount()`
9. Emit [`MsgSwap`](#msgswap) event to publicize swap and record spread fee

If the trader's `Account` has insufficient balance to execute the swap, the swap transaction fails. Upon successful completion of swaps involving Luna, a portion of the coins to be credited to the user's account is withheld as the spread fee.

## Tags

The Market module emits the following events/tags

### MsgSwap

| Key | Value |
| :-- | :-- |
| `"offer"` | offered coins |
| `"trader"` | trader's address |
| `"swap_coin"` | swapped coins |
| `"swap_fee"` | spread fee |

## State

```go
type Keeper struct {
	cdc        *codec.Codec
	storeKey   sdk.StoreKey
	paramSpace params.Subspace

	oracleKeeper types.OracleKeeper
	SupplyKeeper types.SupplyKeeper

	// codespace
	codespace sdk.CodespaceType
}
```

The Market module makes use of some global params, which can be accessed and altered with `k.GetParams()` and `k.SetParams()`. See [Parameters](#parameters) for more.

Market also tracks the difference between the Terra (all denominations) and Luna liquidity pools in the store, which can be accessed and altered with `k.GetTerraPoolDelta()` and `k.SetTerraPoolDelta()`. 

The Market module accesses the [Oracle](dev-spec-oracle.md) module for information regarding price and the [Supply](dev-spec-supply.md) module to update account balances after swapping.

- [`Params`](#parameters)
    - `PoolRecoveryPeriod : int64`
    - `BasePool : sdk.Dec`
    - `MinSpread : sdk.Dec`
    - `TobinTax : sdk.Dec`
- `TerraPoolDelta : sdk.Dec` - represents the difference between size of current Terra pool and its original base size, valued in USDR. Can recreate size of Terra and Luna pools.

## Functions

### `ComputeSwap()`

```go
func (k Keeper) ComputeSwap(ctx sdk.Context, offerCoin sdk.Coin, askDenom string)
    (retDecCoin sdk.DecCoin, spread sdk.Dec, err sdk.Error)
```

`ComputeSwap()` returns the amount of asked coins that should be returned for a given `offerCoin` at the effective exchange rate registered with the oracle, alongside the spread that should be taken.

If the `offerCoin`'s denomination is the same as `askDenom`, this will return an `ErrRecursiveSwap`.

> A different version `ComputeInternalSwap()` is used internally, which just performs the calculations without the constant-product spread.
{note}


### `ApplySwapToPool()`

```go
func (k Keeper) ApplySwapToPool(ctx sdk.Context, offerCoin sdk.Coin, askCoin sdk.DecCoin) sdk.Error
```

`ApplySwapToPools()` is called during the swap to update each of the Terra and Luna pools reflecting their new total balances. The pools remain unchanged during Terra<>Terra swaps. `offerPool` increases by the amount of `offer` tokens, and `askPool` decreases by `ask` tokens provided by the market.

For instance, if I am swapping 2 TerraSDR for 3 LUNA, the offer pool (Terra) will increase by 2 SDR and the ask pool (Luna) will decrease by 3 tokens. In practice, rather than keeping track of the sizes of the two pools, it is encoded in a +/- number `TerraPoolDelta`, with postive numbers representing a larger Terra pool. Thus, the delta would increase from 0 to 2.

The true effective size of the Terra and Luna liquidity pools can be recreated from this number using the following formula:

```text
TerraPool = BaesPool + TerraPoolDelta
LunaPool = BasePool*BasePool / TerraPool
```

## End-Block

Market module calls `k.ReplenishPools()` at the end of every block, which decreases the value of `TerraPoolDelta` (which measures the difference between Terra and Luna pools) depending on `PoolRecoveryPeriod`.

This allows the network to sharply increase spread fees in during acute price fluctuations, and automatically return the spread to normal after some time when the price change is long term.

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

Number of blocks it takes for the Terra & Luna pools to naturally "reset" toward equilibrium  (delta ~= 0) through automated pool replenishing.

- type: `int64`
- default value: `14400` (`core.BlocksPerDay`)

### `BasePool`

Initial starting size of both Terra and Luna liquidity pools.

- type: `sdk.Dec`
- default value: `1000000 * core.MicroUnit` (1,000,000,000 USDR)

### `MinSpread`

Minimum spread charged on Terra<>Luna swaps to prevent leaking value from front-running attacks.

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(2, 2)` (2%)

### `TobinTax`

A fee added on for swap between Terra currencies (spot-trading).

- type: `sdk.Dec`
- default value: `sdk.NewDecWithPrec(30, 4)` (0.3%)

## Errors

### `ErrNoEffectivePrice`

Called when a price for the asset is not registered with the oracle.

### `ErrInsufficientSwapCoins`

Called when not enough coins are being requested for a swap.

### `ErrRecursiveSwap`

Called when Ask and Offer coin denominations are equal.