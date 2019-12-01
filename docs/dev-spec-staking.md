---
id: dev-spec-staking
title: Staking
---

> Terra's Staking module inherits from Cosmos SDK's [`staking`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/staking) module. This document is a stub, and covers mainly important Terra-specific notes about how it is used.
{note}

## Parameters

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
- default value: `100`

### `MaxValidators`

Maximum number of validators (max uint16 = 65535).

- type: `uint16`
- default value: `100`

### `KeyMaxEntries`

Max entries for either unbonding delegation or redelegation (per pair/trio). We need to be a bit careful about potential overflow here, since this is user-determined.

- type: `uint16`
- default value: `7`

### `BondDenom`

Defines the denomination of the asset required for staking.

- type: `string`
- default value: `uluna`
