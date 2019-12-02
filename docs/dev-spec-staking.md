---
id: dev-spec-staking
title: Staking
---

> Terra's Staking module inherits from Cosmos SDK's [`staking`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/staking) module. This document is a stub, and covers mainly important Terra-specific notes about how it is used.
{note}

The Staking module enables Terra's Proof-of-Stake functionality by requiring validators to bond Luna, the native staking asset.

## Transitions

### End-Block

> This section was taken from the official Cosmos SDK docs, and placed here for your convenience to understand the Staking module's parameters.

Each abci end block call, the operations to update queues and validator set
changes are specified to execute.

#### Validator Set Changes

The staking validator set is updated during this process by state transitions
that run at the end of every block. As a part of this process any updated
validators are also returned back to Tendermint for inclusion in the Tendermint
validator set which is responsible for validating Tendermint messages at the
consensus layer. Operations are as following:

- the new validator set is taken as the top `params.MaxValidators` number of
  validators retrieved from the ValidatorsByPower index
- the previous validator set is compared with the new validator set:
  - missing validators begin unbonding and their `Tokens` are transferred from the
  `BondedPool` to the `NotBondedPool` `ModuleAccount`
  - new validators are instantly bonded and their `Tokens` are transferred from the
  `NotBondedPool` to the `BondedPool` `ModuleAccount`

In all cases, any validators leaving or entering the bonded validator set or
changing balances and staying within the bonded validator set incur an update
message which is passed back to Tendermint.

#### Queues

Within staking, certain state-transitions are not instantaneous but take place
over a duration of time (typically the unbonding period). When these
transitions are mature certain operations must take place in order to complete
the state operation. This is achieved through the use of queues which are
checked/processed at the end of each block.

##### Unbonding Validators

When a validator is kicked out of the bonded validator set (either through
being jailed, or not having sufficient bonded tokens) it begins the unbonding
process along with all its delegations begin unbonding (while still being
delegated to this validator). At this point the validator is said to be an
unbonding validator, whereby it will mature to become an "unbonded validator"
after the unbonding period has passed.

Each block the validator queue is to be checked for mature unbonding validators
(namely with a completion time <= current time). At this point any mature
validators which do not have any delegations remaining are deleted from state.
For all other mature unbonding validators that still have remaining
delegations, the `validator.Status` is switched from `sdk.Unbonding` to
`sdk.Unbonded`.

##### Unbonding Delegations

Complete the unbonding of all mature `UnbondingDelegations.Entries` within the
`UnbondingDelegations` queue with the following procedure:

- transfer the balance coins to the delegator's wallet address
- remove the mature entry from `UnbondingDelegation.Entries`
- remove the `UnbondingDelegation` object from the store if there are no
  remaining entries.

##### Redelegations

Complete the unbonding of all mature `Redelegation.Entries` within the
`Redelegations` queue with the following procedure:

- remove the mature entry from `Redelegation.Entries`
- remove the `Redelegation` object from the store if there are no
  remaining entries.

## Parameters

The subspace for the Staking module is `staking`.

```go
type Params struct {
	UnbondingTime time.Duration `json:"unbonding_time" yaml:"unbonding_time"`
	MaxValidators uint16        `json:"max_validators" yaml:"max_validators"`
	MaxEntries    uint16        `json:"max_entries" yaml:"max_entries"`
	BondDenom string `json:"bond_denom" yaml:"bond_denom"`
}
```

### `UnbondingTime`

Time duration of unbonding, in nanoseconds.

- type: `time.Duration`
- default value: `time.Hour * 24 * 7 * 3` (3 weeks)

### `MaxValidators`

Maximum number of active validators.

- type: `uint16`
- default value: `100`

### `MaxEntries`

Max entries for either unbonding delegation or redelegation (per pair/trio). We need to be a bit careful about potential overflow here, since this is user-determined.

- type: `uint16`
- default value: `7`

### `BondDenom`

Defines the denomination of the asset required for staking.

- type: `string`
- default value: `uluna`
