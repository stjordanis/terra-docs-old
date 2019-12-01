---
id: dev-spec-governance
title: Governance
---

> Terra's Governance module inherits from Cosmos SDK's [`gov`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/governance) module. This document is a stub, and covers mainly important Terra-specific notes about how it is used.
{note}

Governance is the process through which participants within the Terra network can effect change on the protocol by submitting petitions known as "proposals," arriving at a popular consensus when a threshold amount of support has been reached for it. The proposal structure is versatile and allows for holders of Luna (those who have an interest in the long-term viability of the network) to voice their opinion on both blockchain parameter updates as well as future development of the Terra protocol.

## Proposals

```go
type Proposal struct {
	Content `json:"content" yaml:"content"` // Proposal content interface

	ProposalID       uint64         `json:"id" yaml:"id"`                                 //  ID of the proposal
	Status           ProposalStatus `json:"proposal_status" yaml:"proposal_status"`       // Status of the Proposal {Pending, Active, Passed, Rejected}
	FinalTallyResult TallyResult    `json:"final_tally_result" yaml:"final_tally_result"` // Result of Tallys

	SubmitTime     time.Time `json:"submit_time" yaml:"submit_time"`           // Time of the block where TxGovSubmitProposal was included
	DepositEndTime time.Time `json:"deposit_end_time" yaml:"deposit_end_time"` // Time that the Proposal would expire if deposit amount isn't met
	TotalDeposit   sdk.Coins `json:"total_deposit" yaml:"total_deposit"`       // Current deposit on this proposal. Initial value is set at InitialDeposit

	VotingStartTime time.Time `json:"voting_start_time" yaml:"voting_start_time"` // Time of the block where MinDeposit was reached. -1 if MinDeposit is not reached
	VotingEndTime   time.Time `json:"voting_end_time" yaml:"voting_end_time"`     // Time that the VotingPeriod for this proposal will end and votes will be tallied
}
```

A Proposal is a data structure representing a petition for a change that is submitted by to the blockchain alongside a deposit. Once its deposit reaches a certain value ([`MinDeposit`](#mindeposit)), the proposal is confirmed and voting opens. Bonded Luna hoolders can then send [`TxGovVote`]() transactions to vote on the proposal. Terra currently follows a simple voting scheme of 1 Bonded Luna = 1 Vote.

### Text Proposals

```go
type TextProposal struct {
	Title       string `json:"title" yaml:"title"`
	Description string `json:"description" yaml:"description"`
}
```

### Parameter Change Proposals

```go
type ParameterChangeProposal struct {
	Title       string        `json:"title" yaml:"title"`
	Description string        `json:"description" yaml:"description"`
	Changes     []ParamChange `json:"changes" yaml:"changes"`
}

type ParamChange struct {
	Subspace string `json:"subspace" yaml:"subspace"`
	Key      string `json:"key" yaml:"key"`
	Subkey   string `json:"subkey,omitempty" yaml:"subkey,omitempty"`
	Value    string `json:"value" yaml:"value"`
}
```

> Parameter Change Proposals are actually located in the Params module, an internal module. It is shown here for your convenience.
{note}

Parameter Change Proposals are a special type of proposal which, once passed, will automaticaly go in effect by directly altering the network's parameter specified. For each module, you can find the parameters associated with it by browsing to the **Parameters** section of the module specification.

### Software Upgrade Proposals

> Software Upgrade Proposals also exist due to inheritance from Cosmos SDK but are for the moment considered unavailable, as they have not yet been implemented. They thus share the same semantics as a simple Text Proposal. It is strongly advised to not submit these types of proposals at the risk of losing your Luna deposit.
{warning}

## Parameters

The subspace for the Governance module is `gov`.

```go
type DepositParams struct {
	MinDeposit       sdk.Coins     `json:"min_deposit,omitempty" yaml:"min_deposit,omitempty"`
	MaxDepositPeriod time.Duration `json:"max_deposit_period,omitempty" yaml:"max_deposit_period,omitempty"` //  Maximum period for Atom holders to deposit on a proposal. Initial value: 2 months
}

type TallyParams struct {
	Quorum    sdk.Dec `json:"quorum,omitempty" yaml:"quorum,omitempty"`
	Threshold sdk.Dec `json:"threshold,omitempty" yaml:"threshold,omitempty"`
	Veto      sdk.Dec `json:"veto,omitempty" yaml:"veto,omitempty"`
}

type VotingParams struct {
	VotingPeriod time.Duration `json:"voting_period,omitempty" yaml:"voting_period,omitempty"`
}
```

### `MinDeposit`

Minimum deposit for a proposal to enter voting period.

- type: `sdk.Coins`
- default value: `uluna`

### `MaxDepositPeriod`

Maximum period for Luna holders to deposit on a proposal. 

- type: `time.Duration`
- default value: `2 months`

### `Quorum`

Minimum percentage of total stake needed to vote for a result to be considered valid.

- type: `sdk.Dec`
- default value: ``

### `Threshold`

Minimum proportion of Yes votes for proposal to pass.

- type: `sdk.Dec`
- default value: `0.5` (50%)

### `Veto`

Minimum value of Veto votes to Total votes ratio for proposal to be vetoed.

- type: `sdk.Dec`
- default value: `0.33` (1/3rd)

### `VotingPeriod`

Length of the voting period.

- type: `string`
- default value: ``
