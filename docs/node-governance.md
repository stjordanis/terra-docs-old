---
id: node-governance
title: Participate in Governance
---

Governance is the process through which participants within the Terra network can effect change for the protocol, by arriving at consensus. Software upgrades and blockchain parameters can be automatically placed in effect through proposals. Other issues like large directional changes or decisions requiring human involvement can be also be voted on, through text proposals.

Proposals are submitted on the network through creating a proposal, depositing some Luna tokens, and 

Some considerations about the voting process:

- Voting is done by holders of bonded LUNA on a 1 LUNA = 1 vote basis

- Delegators inherit the vote of their validator if they don't vote

- Votes are tallied at the end of the voting period (2 weeks on mainnet) where
each address can vote multiple times to update its `Option` value (paying the transaction fee each time),
only the most recently cast vote will count as valid

- Voters can choose between options `Yes`, `No`, `NoWithVeto` and `Abstain`

- At the end of the voting period, a proposal is accepted if:

  - `(YesVotes / (YesVotes+NoVotes+NoWithVetoVotes)) > threshold(1/2)`

  - `(NoWithVetoVotes / (YesVotes+NoVotes+NoWithVetoVotes)) < veto(1/3)`

  - `((YesVotes+NoVotes+NoWithVetoVotes) / totalBondedStake) >= quorum(1/3)`

For more information about the governance process and how it works, please check
out the [Governance module specification](dev-spec-governance.md).

### Create a Governance Proposal

In order to create a governance proposal, you must submit an initial deposit
along with a title and description. Various modules outside of governance may
implement their own proposal types and handlers (eg. parameter changes), where
the governance module itself supports `Text` proposals. Any module
outside of governance has it's command mounted on top of `submit-proposal`.

To submit a `Text` proposal:

```bash
terracli tx gov submit-proposal \
  --title=<title> \
  --description=<description> \
  --type="Text" \
  --deposit="1000000uluna" \
  --from=<name> \
  --chain-id=<chain_id>
```

You may also provide the proposal directly through the `--proposal` flag which
points to a JSON file containing the proposal.

To submit a parameter change proposal, you must provide a proposal file as its
contents are less friendly to CLI input:

```bash
terracli tx gov submit-proposal param-change <path/to/proposal.json> \
  --from=<name> \
  --chain-id=<chain_id>
```

Where `proposal.json` contains the following:

```json
{
  "title": "Param Change",
  "description": "Update max validators",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": 105
    }
  ],
  "deposit": [
    {
      "denom": "stake",
      "amount": "10000000"
    }
  ]
}
```

> Currently parameter changes are _evaluated_ but not _validated_, so it is very important
> that any `value` change is valid (ie. correct type and within bounds) for its
> respective parameter, eg. `MaxValidators` should be an integer and not a decimal.
>
> Proper vetting of a parameter change proposal should prevent this from happening
> (no deposits should occur during the governance process), but it should be noted
> regardless. 
{warning}

To submit a community pool spend proposal, you must provide a proposal file as its
contents are less friendly to CLI input:

```bash
terracli tx gov submit-proposal community-pool-spend <path/to/proposal.json> \
  --from=<name> \
  --chain-id=<chain_id>
```

Where `proposal.json` contains the following:

```json
{
  "title": "Community Pool Spend",
  "description": "Pay me some Lunas!",
  "recipient": "terra1s5afhd6gxevu37mkqcvvsj8qeylhn0rzn7cdaq",
  "amount": [
    {
      "denom": "uluna",
      "amount": "10000"
    }
  ],
  "deposit": [
    {
      "denom": "uluna",
      "amount": "10000"
    }
  ]
}
```

To submit a tax rate update proposal, you must provide a proposal file as its
contents are less friendly to CLI input:

```bash
terracli tx gov submit-proposal tax-rate-update <path/to/proposal.json> \
  --from=<name> \
  --chain-id=<chain_id>
```

Where `proposal.json` contains the following:

```json
{
  "title": "Update Tax-Rate",
  "description": "Let's update the tax-rate to 1.5%",
  "tax_rate": "0.015",
  "deposit": [
    {
      "denom": "uluna",
      "amount": "10000"
    }
  ]
}
```

To submit a reward weight update proposal, you must provide a proposal file as its
contents are less friendly to CLI input:

```bash
terracli tx gov submit-proposal reward-weight-update <path/to/proposal.json> \
  --from=<name> \
  --chain-id=<chain_id>
```

Where `proposal.json` contains the following:

```json
{
  "title": "Update Reward Weight",
  "description": "Let's update reward weight to 1.5%",
  "reward_weight": "0.015",
  "deposit": [
    {
      "denom": "uluna",
      "amount": "10000"
    }
  ]
}
```

> The `SoftwareUpgrade` is currently not supported as it's not implemented and currently does not differ from the semantics of a `Text` proposal.
{important}