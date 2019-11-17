---
id: dev-spec-oracle
title: Oracle
---

The Oracle module provides the Terra blockchain with an up-to-date and accurate price feed of exchange rates of Luna against various fiat currencies such that the [Market](dev-spec-market.md) module may always provide fair exchanges between Terra<>Terra currency pairs, as well as Terra<>Luna.

Should the system fail to gain an accurate measure of Luna price, a small set of arbitrageurs could profit at the cost of the entire network.

As price information is extrinsic to the blockchain, the Terra network relies on a special set within the validator set to provide price information by submitting a vote for what they believe to be the current price during a periodic price-update interval.

## Voting Procedure

The Oracle obtains consensus on the price of Luna with the following procedure:

* Let $$\{ P_1, P_2, \cdots P_n \}$$ be a set of time intervals, each of duration `params.VotePeriod` (currently set to 30 seconds). Within the span of each $P_i$ validators must submit two messages: 

  * A `MsgPricePrevote`, containing the SHA256 hash of the exchange rate of Luna with respect to a Terra peg. For example, in order to support swaps for Terra currencies pegged to KRW, USD, SDR, three prevotes must be submitted: one vote for each of uluna<>ukrw, uluna<>uusd, and uluna<>usdr.

  * A `MsgPriceVote`, containing the salt used to create the hash for the prevote submitted in the previous interval $P_{i-1}$.

* At the end of each $P_i$, votes submitted are tallied. 

  * The submitted salt of each vote is used to verify consistency with the prevote submitted by the validator in $P_{i-1}$. If the validator has not submitted a prevote, or the SHA256 resulting from the salt does not match the hash from the prevote, the vote is dropped.

  * For each currency C, if the total voting power of submitted votes exceeds 50%, a weighted median price of the vote is taken and is recorded on-chain as the effective exchange rate for Luna<>C for $P_{i+1}$.

  * Winners of the ballot for $P_{i-1}$, i.e. voters that have managed to vote within a small band around the weighted median, are rewarded with the spread fees collected on swap operations during $P_i$. For spread rewards, see [this](market.md#spread-rewards).
  
* If an insufficient amount of votes have been received for a currency, below `VoteThreshold`, its exchange rate is deleted from the store, and no swaps can be made with it during P. 

```text
Period  |  P1 |  P2 |  P3 |  ...    |
Prevote |  O  |  O  |  O  |  ...    |
        |-----\-----\-----\-----    |
Vote    |     |  O  |  O  |  ...    |
```

Effectively, this scheme forces the voter to commit to a price submission before knowing the votes of others and thereby reduces centralization and free-rider risk in the oracle.

## Message Types

### Submit a Prevote - `MsgPricePrevote`

```go
// MsgPricePrevote - struct for prevoting on the PriceVote.
// The purpose of prevote is to hide vote price with hash
// which is formatted as hex string in SHA256("salt:price:denom:voter")
type MsgPricePrevote struct {
    Hash      string         `json:"hash"` // hex string
    Denom     string         `json:"denom"`
    Feeder    sdk.AccAddress `json:"feeder"`
    Validator sdk.ValAddress `json:"validator"`
}
```

The `MsgPricePrevote` is just the submission of the leading 20 bytes of the SHA256 hex string run over a string containing the metadata of the actual `MsgPriceVote` to follow in the next period. The string is of the format: `salt:price:denom:voter`. Note that since in the subsequent `MsgPriceVote` the salt will have to be revealed, the salt used must be regenerated for each prevote submission.

`Denom` is the denomination of the currency for which the vote is being cast. For example, if the voter wishes to submit a prevote for the usd, then the correct `Denom` is `uusd`.

The price used in the hash must be the open market price of Luna, w.r.t. to the currency matching `Denom`. For example, if `Denom` is `uusd` and the going price for Luna is 1 USD, then "1" must be used as the price, as `1 uluna` = `1 uusd`. 

`Feeder` is used if the validator wishes to delegate oracle vote signing to a separate key to de-risk exposing their validator signing key.

`Validator` is the validator address of the original validator.

### Vote for price of Luna - `MsgPriceVote` 

```go
// MsgPriceVote - struct for voting on the price of Luna denominated in various Terra assets.
// For example, if the validator believes that the effective price of Luna in USD is 10.39, that's
// what the price field would be, and if 1213.34 for KRW, same.
type MsgPriceVote struct {
    Price     sdk.Dec        `json:"price"` // the effective price of Luna in {Denom}
    Salt      string         `json:"salt"`
    Denom     string         `json:"denom"`
    Feeder    sdk.AccAddress `json:"feeder"`
    Validator sdk.ValAddress `json:"validator"`
}
```

The `MsgPriceVote` contains the actual price vote. The `Salt` parameter must match the salt used to create the prevote, otherwise the voter cannot be rewarded.

### Delegate voting rights - `MsgDelegateFeederPermission`


Validators may also elect to delegate voting rights to another key to prevent the block signing key from being kept online. To do so, they must submit a `MsgDelegateFeederPermission`, delegating their oracle voting rights to a `FeedDelegate`, which in turn sign `MsgPricePrevote` and `MsgPriceVote` on behalf of the validator. 

> Make sure to populate the delegate address with some coins by which to pay fees.
{important}

```go
// MsgDelegateFeederPermission - struct for delegating oracle voting rights to another address.
type MsgDelegateFeederPermission struct {
	Operator     sdk.ValAddress `json:"operator"`
	FeedDelegate sdk.AccAddress `json:"feed_delegate"`
}
```

The `Operator` field contains the operator address of the validator. The `FeedDelegate` field is the address of the delegate account that will be submitting price related votes and prevotes on behalf of the `Operator`. 


## Parameters

```go

// Default parameter values
const (
	DefaultVotePeriod  = core.BlocksPerMinute // 30 seconds
	DefaultVotesWindow = int64(1000)          // 1000 oracle period
)

// Default parameter values
var (
	DefaultVoteThreshold            = sdk.NewDecWithPrec(50, 2) // 50%
	DefaultRewardBand               = sdk.NewDecWithPrec(1, 2) // 1%
	DefaultRewardDistributionPeriod = core.BlocksPerMonth // 432,000
	DefaultMinValidVotesPerWindow   = sdk.NewDecWithPrec(5, 2) // 5%
    DefaultWhitelist                = DenomList{core.MicroKRWDenom,
         core.MicroSDRDenom, core.MicroUSDDenom} // ukrw, usdr, uusd
)

...

// Params oracle parameters
type Params struct {
    // the number of blocks during which voting takes place.
    VotePeriod int64 `json:"vote_period" yaml:"vote_period"`

    // the minimum percentage of votes that must be received for a ballot to pass.
	VoteThreshold sdk.Dec `json:"vote_threshold" yaml:"vote_threshold"`
    
    // the ratio of allowable price error that can be rewared.
    RewardBand sdk.Dec `json:"reward_band" yaml:"reward_band"`
    
    // the number of blocks of the the period during which seigiornage reward comes in and then is distributed.
    RewardDistributionPeriod int64 `json:"reward_distribution_period" yaml:"reward_distribution_period"`
    
    // the denom list that can be acitivated,
	Whitelist DenomList `json:"whitelist" yaml:"whitelist"`
}
```

## Errors

### `ErrInvalidHashLength`

Called when the given hash has invalid length.

### `ErrUnknownDenomination`

Called when the denomination provided is not recognized.

### `ErrInvalidPrice`

Called when the price submitted is not valid.

### `ErrVerificationFailed`

Called when the given prevote has different hash from the retrieved one.

### `ErrNoPrevote`

Called when no prevote exists.

### `ErrNoVote`

Called when no vote exists.

### `ErrNoVotingPermission`

Called when the feeder does not have permission to submit a vote for the given operator.

### `ErrNotRevealPeriod`

Called when the feeder submits price-reveal vote during the wrong period.

### `ErrInvalidSaltLength`

Called when the salt length is not equal to `1`