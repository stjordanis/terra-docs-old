---
id: node-terracli
title: terracli Reference
---

For more information on the command usage, refer to its help screen: `terracli config --help`.

Here is a list of useful `terracli` commands, including usage examples.

## Keys

### Key Representations

Every Terra account is associated with different key representations, which can be deterministically generated from the account's private key.

* **Address**: `terra`
  * This is the address you give to others in order to receive funds.
  * View this value (and its public key) with `terracli keys show <account_name>`
  * e.g. `terra15h6vd5f0wqps26zjlwrc6chah08ryu4hzzdwhc`

* **Validator Operator Address**: `terravaloper`
  * This is the address that identifies a validator's operator (the holder of the Terra account) and is used to invoke staking commands.
  * View this value (and its public key) with `terracli keys show <account_name> --bech=val`
  * e.g. `terravaloper1carzvgq3e6y3z5kz5y6gxp3wpy3qdrv928vyah`

There are also keys that belong to the node, used to identify the node itself rather than the operator that runs the node.

* **Validator Node Public Key** `terravalconspub`
  * Generated when the node is created with `terrad init`, and is the Tendermint signing key.
  * View this value with `terrad tendermint show-validator`
  * e.g. `terravalconspub1zcjduepq0ms2738680y72v44tfyqm3c9ppduku8fs6sr73fx7m666sjztznqzp2emf`

### Generate Keys

You'll need an account private and public key pair \(a.k.a. `sk, pk` respectively\) to be able to receive funds, send txs, bond tx, etc.

To generate a new _secp256k1_ key:

```bash
terracli keys add <account_name>
```

Next, you will have to create a passphrase to protect the key on disk. The output of the above command will contain a _seed phrase_. It is recommended to save the _seed phrase_ in a safe place so that in case you forget the password, you could eventually regenerate the key from the seed phrase with the following command:

```bash
terracli keys add --recover
```

If you check your private keys, you'll now see `<account_name>`:

```bash
terracli keys show <account_name>
```

View the validator operator's address via:

```text
terracli keys show <account_name> --bech=val
```

You can see all your available keys by typing:

```bash
terracli keys list
```

View the validator pubkey for your node by typing:

```bash
terrad tendermint show-validator
```

Note that this is the Tendermint signing key, _not_ the operator key you will use in delegation transactions.

> We strongly recommend **NOT** using the same passphrase for multiple keys.
> The Terra team will not be responsible for the loss of funds.
{warning}

### Generate Multisig Public Keys

You can generate and print a multisig public key by typing:

```bash
terracli keys add --multisig=name1,name2,name3[...] --multisig-threshold=K new_key_name
```

`K` is the minimum number of private keys that must have signed the transactions that carry the public key's address as signer.

The `--multisig` flag must contain the name of public keys that will be combined into a public key that will be generated and stored as `new_key_name` in the local database. All names supplied through `--multisig` must already exist in the local database. Unless the flag `--nosort` is set, the order in which the keys are supplied on the command line does not matter, i.e. the following commands generate two identical keys:

```bash
terracli keys add --multisig=foo,bar,baz --multisig-threshold=2 multisig_address
terracli keys add --multisig=baz,foo,bar --multisig-threshold=2 multisig_address
```

Multisig addresses can also be generated on-the-fly and printed through the which command:

```bash
terracli keys show --multisig-threshold=K name1 name2 name3 [...]
```

For more information regarding how to generate, sign and broadcast transactions with a multi signature account see [Multisig Transactions](#multisig-transactions).

## Fees

###  Fees & Gas

Each transaction may either supply fees or gas prices, but not both. Most users will typically provide fees as this is the cost you will end up incurring for the transaction being included in the ledger.

Validator's have a minimum gas price \(multi-denom\) configuration and they use this value when determining if they should include the transaction in a block during `CheckTx`, where `gasPrices >= minGasPrices`. Note, your transaction must supply fees that are greater than or equal to **any** of the denominations the validator requires.

> With such a mechanism in place, validators may start to prioritize txs by `gasPrice` in the mempool, so providing higher fees or gas prices may yield higher tx priority.
{note}

e.g.

```bash
terracli tx send ... --fees=100usdr
```

or

```bash
terracli tx send ... --gas-prices=0.000001usdr
```

### Fees & Taxes (From Columbus-3)
The tax has been changed to be included in the fees rather than automatically charged from the sender account. Users can make transaction with existing method without fees flag but with gas prices flag. It will automatically calculate tax and return fees in addition to the existing gas fees.

Wallet providers can estimate fees and gas to be incurred by a transaction by querying the endpoint `/txs/estimate_fee` with `gas = "0"`.

e.g.

```bash
terracli tx send ... --gas-prices=0.000001usdr --gas=auto --gas-adjustment=1.4
```

or

```bash
terracli tx estimate-fee ... --gas-prices=0.000001usdr --gas-adjustment=1.4
```

## Account

### Get Tokens

The best way to get tokens is from the [Terra Testnet Faucet](https://faucet.terra.money).

### Query Account Balance

After receiving tokens to your address, you can view your account's balance by typing:

```bash
terracli query account <account_terra>
```

> When you query an account balance with zero tokens, you will get this error:
> 
> `No account with address <account_terra> was found in the state`.
> 
> This can also happen if you fund the account before your node has fully synced with the chain.
> Both cases are to be expected.
{important}

## Send Tokens

The following command could be used to send coins from one account to another:

```bash
terracli tx send \
  <from_key_or_address> \
  <to_address> \
  <coins> \
  --chain-id=<chain_id> \
```

where `to_address` is a key matching the format: `terra1dp0taj85ruc299rkdvzp4z5pfg6z6swaed74e6`

> The `<coins>` paramter is of the format `<value|coin_name>`.
> 
> The `<from_key_or_address>` accepts both the key name and the address as the value, but only accepts > addresses when the `--generate-only` flag is used.
{important}

> You may want to cap the maximum gas that can be consumed by the transaction via the `--gas` flag.
> 
> If you pass `--gas=auto`, the gas will be automatically estimated before executing the transaction.
> 
> Gas estimate might be inaccurate as state changes could occur in between the end of the simulation and the actual execution of a transaction, thus an adjustment is applied on top of the original estimate in order to ensure the transaction is broadcasted successfully.
> 
> The adjustment can be controlled via the `--gas-adjustment` flag, whose default value is 1.0.
{tip}

Now, view the updated balances of the origin and destination accounts:

```bash
terracli query account <account_terra>
terracli query account <destination_terra>
```

You can also check your balance at a given block by using the `--height` flag:

```bash
terracli query account <account_terra> --height=<block_height>
```

You can simulate a transaction without actually broadcasting it by appending the `--dry-run` flag to the command line:

```bash
terracli tx send \
  <from_key_or_address> \
  <to_address> \
  <coins> \
  --chain-id=<chain_id> \
  --dry-run
```

Furthermore, you can build a transaction and print its JSON format to STDOUT by appending `--generate-only` to the list of the command line arguments:

```bash
terracli tx send \
  <from_key_or_address> \
  <to_address> \
  <coins> \
  --chain-id=<chain_id> \
  --generate-only > unsignedSendTx.json
```

```bash
terracli tx sign \
  --chain-id=<chain_id> \
  --from=<key_name> \
  unsignedSendTx.json > signedSendTx.json
```

You can validate the transaction's signatures by typing the following:

```bash
terracli tx sign --validate-signatures signedSendTx.json
```

You can broadcast the signed transaction to a node by providing the JSON file to the following command:

```bash
terracli tx broadcast --node=<node> signedSendTx.json
```

## Query Transactions

### Matching a set of tags

You can use the transaction search command to query for transactions that match a specific set of `tags`, which are added on every transaction.

Each tag is conformed by a key-value pair in the form of `<tag>:<value>`. Tags can also be combined to query for a more specific result using the `&` symbol.

The command for querying transactions using a `tag` is the following:

```bash
terracli query txs --tags='<tag>:<value>'
```

And for using multiple `tags`:

```bash
terracli query txs --tags='<tag1>:<value1>&<tag2>:<value2>'
```

The pagination is supported as well via `page` and `limit`:

```bash
terracli query txs --tags='<tag>:<value>' --page=1 --limit=20
```

> The action tag always equals the message type returned by the `Type()` function of the relevant message.
> You can find a list of available `tags` on each module by looking at the /tags directory of each module.
{tip}

### Matching a transaction's hash

You can also query a single transaction by its hash using the following command:

```bash
terracli query tx [hash]
```

## Slashing

### Unjailing

To unjail your jailed validator

```bash
terracli tx slashing unjail --from=<validator-operator-addr>
```

### Signing Info

To retrieve a validator's signing info:

```bash
terracli query slashing signing-info <validator-pubkey>
```

### Query Parameters

You can get the current slashing parameters via:

```bash
terracli query slashing params
```

## Staking

### Set up a Validator

Please refer to the [Validator Setup](validator-getting-started.md) section for a more complete guide on how to set up a validator-candidate.

### Delegate to a Validator

On the upcoming mainnet, you can delegate LUNA to a validator. These [delegators](validator-faq.md) can receive part of the validator's fee revenue.

**Query Validators**

You can query the list of all validators of a specific chain:

```bash
terracli query staking validators
```

If you want to get the information of a single validator you can check it with:

```bash
terracli query staking validator <account_terraval>
```

### Bond Tokens

On the testnet, we delegate LUNA. Here's how you can bond tokens to a testnet validator \(_i.e._ delegate\):

```bash
terracli tx staking delegate \
  <validator address> \
  10000000uluna \
  --from=<key_name> \
  --chain-id=<chain_id>
```

`<validator>` is the operator address of the validator to which you intend to delegate. If you are running a local testnet, you can find this with:

```bash
terracli keys show <name> --bech val
```

where `<name>` is the name of the key you specified when you initialized `terrad`.

While tokens are bonded, they are pooled with all the other bonded tokens in the network. Validators and delegators obtain a percentage of shares that equal their stake in this pool.

> Don't use more LUNA than you have! You can always get more by using the [Faucet](https://faucet.terra.money/)!
{tip}

**Query Delegations**

Once submitted a delegation to a validator, you can see it's information by using the following command:

```bash
terracli query staking delegation <delegator_address> <validator_address>
```

Or if you want to check all your current delegations with disctinct validators:

```bash
terracli query staking delegations <delegator_address>
```

You can also get previous delegation\(s\) status by adding the `--height` flag.

### Unbond Tokens

If for any reason the validator misbehaves, or you just want to unbond a certain
amount of tokens, use this following command.

```bash
terracli tx staking unbond \
  <validator_address> \
  100uluna \
  --from=<key_name> \
  --chain-id=<chain_id>
```

The unbonding will be automatically completed when the unbonding period has passed.

**Query Unbonding-Delegations**

Once you begin an unbonding-delegation, you can see it's information by using the following command:

```bash
terracli query staking unbonding-delegation <delegator_address> <validator_address>
```

Or if you want to check all your current unbonding-delegations with disctinct validators:

```bash
terracli query staking unbonding-delegations <account_terra>
```

Additionally, as you can get all the unbonding-delegations from a particular validator:

```bash
terracli query staking unbonding-delegations-from <account_terraval>
```

To get previous unbonding-delegation\(s\) status on past blocks, try adding the `--height` flag.

### Redelegate Tokens

A redelegation is a type delegation that allows you to bond illiquid tokens from one validator to another:

```bash
terracli tx staking redelegate \
  <src validator address> \
  <dst validator address> \
  <amount> \
  --from=<key_name> \
  --chain-id=<chain_id>
```

The redelegation will be automatically completed when the unbonding period has passed.

**Query Redelegations**

Once you begin an redelegation, you can see it's information by using the following command:

```bash
terracli query staking redelegation <delegator_address> <src_val_addr> <dst_val_addr>
```

Or if you want to check all your current unbonding-delegations with disctinct validators:

```bash
terracli query staking redelegations <account_terra>
```

Additionally, as you can get all the outgoing redelegations from a particular validator:

```bash
  terracli query staking redelegations-from <account_terraval>
```

To get previous redelegation\(s\) status on past blocks, try adding the `--height` flag.

### Query Parameters

Parameters define high level settings for staking. You can get the current values by using:

```bash
terracli query staking params
```

With the above command you will get the values for:

* Unbonding time
* Maximum numbers of validators
* Coin denomination for staking

All these values will be subject to updates though a `governance` process by `ParameterChange` proposals.

### Query Pool

A staking `Pool` defines the dynamic parameters of the current state. You can query them with the following command:

```bash
terracli query staking pool
```

With the `pool` command you will get the values for:

* Not-bonded and bonded tokens
* Token supply
* Current annual inflation and the block in which the last inflation was processed
* Last recorded bonded shares

**Query Delegations To Validator**

You can also query all of the delegations to a particular validator:

```bash
  terracli query delegations-to <account_terraval>
```

## Governance

### Create a Proposal

In order to create a governance proposal, you must submit an initial deposit along with a title and description. You may also provide the proposal directly through the `--proposal` flag which points to a JSON file containing the proposal.

#### Text Proposals

```bash
terracli tx gov submit-proposal \
  --title=<title> \
  --description=<description> \
  --type="Text" \
  --deposit="1000000uluna" \
  --from=<name> \
  --chain-id=<chain_id>
```

#### Parameter Change Proposals

To submit a parameter change proposal, it is highly recommended to pass in the proposal as a JSON file as its
contents are less friendly to command-line input.

```bash
terracli tx gov submit-proposal param-change <path/to/proposal.json> \
  --from=<name> \
  --chain-id=<chain_id>
```

Where `proposal.json` is a file with the following schema:

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
      "denom": "uluna",
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

#### Community Pool Spend Proposal

To submit a community pool spend proposal, it is highly recommended to pass in the proposal as a JSON file as its
contents are less friendly to command-line input.

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

#### Tax-Rate and Reward-Weight Update Proposals

Tax Rate and Reward Weight are important monetary policy levers handled by the [`Treasury`](dev-spec-treasury.md) module to modulate miner incentives toward stable demand and steady growth. Usually, they are automatically calibrated once per epoch by the protocol. However, they can be changed at any moment if an update proposal gets passed with enough supporters.

To submit Tax Rate or Reward Weight update proposal, you must provide a proposal file as its contents are less friendly to CLI input:

For Tax Rate:

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

For Reward Weight:

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

Note that Tax Reward and Reward Weight updates through pased Governance proposals are subject to [Policy Constraints](dev-spec-treasury.md#policy-constraints).

#### Software Upgrade Proposals

The `SoftwareUpgrade` is **currently not supported** as it has not yet been implemented and currently does not differ from the semantics of a `Text` proposal.

### Query Proposals

Once created, you can now query information of the proposal:

```bash
terracli query gov proposal <proposal_id>
```

Or query all available proposals:

```bash
terracli query gov proposals
```

You can also query proposals filtered by `voter` or `depositor` by using the corresponding flags.

To query for the proposer of a given governance proposal:

```bash
terracli query gov proposer <proposal_id>
```

### Increase Deposit

In order for a proposal to be broadcasted to the network, the amount deposited must be above a `minDeposit` value (initial value: `512000000uluna`). If the proposal you previously created didn't meet this requirement, you can still increase the total amount deposited to activate it. Once the minimum deposit is reached, the proposal enters voting period:

```bash
terracli tx gov deposit <proposal_id> "10000000luluna" \
  --from=<name> \
  --chain-id=<chain_id>
```

> _NOTE_: Proposals that don't meet this requirement will be deleted after `MaxDepositPeriod` is reached.

### Query Deposits

Once a new proposal is created, you can query all the deposits submitted to it:

```bash
terracli query gov deposits <proposal_id>
```

You can also query a deposit submitted by a specific address:

```bash
terracli query gov deposit <proposal_id> <depositor_address>
```

### Vote on a Proposal

After a proposal's deposit reaches the `MinDeposit` value, the voting period opens. Bonded LUNA holders can then cast vote on it:

```bash
terracli tx gov vote <proposal_id> <Yes/No/NoWithVeto/Abstain> \
  --from=<name> \
  --chain-id=<chain_id>
```

### Query Votes

Check the vote with the option you just submitted:

```bash
terracli query gov vote <proposal_id> <voter_address>
```

You can also get all the previous votes submitted to the proposal with:

```bash
terracli query gov votes <proposal_id>
```

### Query Proposal Tally Results

To check the current tally of a given proposal you can use the `tally` command:

```bash
terracli query gov tally <proposal_id>
```

### Query Governance Parameters

To check the current governance parameters run:

```bash
terracli query gov params
```

To query subsets of the governance parameters run:

```bash
terracli query gov param voting
terracli query gov param tallying
terracli query gov param deposit
```

## Distribution

### Query Distribution Parameters

To check the current distribution parameters, run:

```bash
terracli query distribution params
```

### Query Community Pool Coins

To query all coins in the Community Pool, which is under Governance control:

```bash
terracli query distribution community-pool
```

### Query Outstanding Rewards

To check the current outstanding (un-withdrawn) rewards, run:

```bash
terracli query distribution outstanding-rewards
```

### Query Validator Commission

To check the current outstanding commission for a validator, run:

```bash
terracli query distribution commission <validator_address>
```

### Query Validator Slashes

To check historical slashes for a validator, run:

```bash
terracli query distribution slashes <validator_address> <start_height> <end_height>
```

### Query Delegator Rewards

To check current rewards for a delegator (if they were to be withdrawn), run:

```bash
terracli query distribution rewards <delegator_address> <validator_address>
```

### Query All Delegator Rewards

To check all current rewards for a delegator (if they were to be withdrawn), run:

```bash
terracli query distribution rewards <delegator_address>
```

## Multisig Transactions

Multisig transactions require signatures of multiple private keys. Thus, generating and signing a transaction from a multisig account involve cooperation among the parties involved. A multisig transaction can be initiated by any of the key holders, and at least one of them would need to import other parties' public keys into their Keybase and generate a multisig public key in order to finalize and broadcast the transaction.

For example, given a multisig key comprising the keys `p1`, `p2`, and `p3`, each of which is held by a distinct party, the user holding `p1` would require to import both `p2` and `p3` in order to generate the multisig account public key:

```text
terracli keys add \
  p2 \
  --pubkey=terrapub1addwnpepqtd28uwa0yxtwal5223qqr5aqf5y57tc7kk7z8qd4zplrdlk5ez5kdnlrj4

terracli keys add \
  p3 \
  --pubkey=terrapub1addwnpepqgj04jpm9wrdml5qnss9kjxkmxzywuklnkj0g3a3f8l5wx9z4ennz84ym5t

terracli keys add \
  p1p2p3 \
  --multisig-threshold=2 \
  --multisig=p1,p2,p3
```

A new multisig public key `p1p2p3` has been stored, and its address will be used as signer of multisig transactions:

```bash
terracli keys show --address p1p2p3
```

You may also view multisig threshold, pubkey constituents and respective weights by viewing the JSON output of the key or passing the `--show-multisig` flag:

```bash
terracli keys show p1p2p3 -o json

terracli keys show p1p2p3 --show-multisig
```

The first step to create a multisig transaction is to initiate it on behalf of the multisig address created above:

```bash
terracli tx send terra1570v2fq3twt0f0x02vhxpuzc9jc4yl30q2qned 10uluna \
  --from=<multisig_address> \
  --generate-only > unsignedTx.json
```

The file `unsignedTx.json` contains the unsigned transaction encoded in JSON. `p1` can now sign the transaction with its own private key:

```bash
terracli tx sign \
  unsignedTx.json \
  --multisig=<multisig_address> \
  --from=p1 \
  --output-document=p1signature.json \
  --chain-id=<chain_id>
```

Once the signature is generated, `p1` transmits both `unsignedTx.json` and `p1signature.json` to `p2` or `p3`, which in turn will generate their respective signature:

```bash
terracli tx sign \
  unsignedTx.json \
  --multisig=<multisig_address> \
  --from=p2 \
  --output-document=p2signature.json \
  --chain-id=<chain_id>
```

`p1p2p3` is a 2-of-3 multisig key, therefore one additional signature is sufficient. Any the key holders can now generate the multisig transaction by combining the required signature files:

```bash
terracli tx multisign \
  unsignedTx.json \
  p1p2p3 \
  p1signature.json p2signature.json \
  --output-document=signedTx.json \
  --chain-id=<chain_id>
```

The transaction can now be sent to the node:

```bash
terracli tx broadcast signedTx.json \
  --chain-id=<chain_id>
```

## Shell Auto-completion Scripts

Auto-completion scripts for popular UNIX shell interpreters such as `bash` and `zsh` can be generated through the `completion` command, which is available for both `terrad` and `terracli`. This allows for a more convenient way to interact with the Terra Core endpoints when using the command-line.

If you want to generate `bash` completion scripts run the following command:

```bash
terrad completion > terrad_completion
terracli completion > terracli_completion
```

If you want to generate `zsh` completion scripts run the following command:

```bash
terrad completion --zsh > terrad_completion
terracli completion --zsh > terracli_completion
```

> On most UNIX systems, such scripts may be loaded in `.bashrc` or `.bash_profile` to enable Bash autocompletion.
> 
>    ```bash
>    echo '. terrad_completion' >> ~/.bashrc
>    echo '. terracli_completion' >> ~/.bashrc
>    ```
>
> Refer to the user's manual of your interpreter provided by your operating system for information on how to enable shell autocompletion.
{note}

## Oracle

### Submit an Exchange Rate Vote

Validators must submit two exchange rate vote transactions to participate in the oracle; a `prevote` containing the hash of the actual vote in the first vote period, and a `vote` containing the salt of the hash submitted in the prevote phase to prove honestly. The hash is the leading 20 bytes of the SHA256 hexa string run over the string of the format `salt:price:denom:validator-address`.

To submit a prevote, run:

```bash
terracli tx oracle prevote \
  <salt> \ 
  <price> \
  <validator_address> \
  --from mykey
```

After `VotePeriod` has expired from the submission of the prevote, the voter must submit the actual exchange rate vote. To do so, run:

```bash
terracli tx oracle vote \
  <salt> \
  <price>  \
  <validator_address> \
  --from mykey \
  --validator <validator-address>
```
Where price is the form of Coin `8890.32ukrw`

Given that oracle votes have to be submitted in a feed over short time intervals (30 seconds), prevotes and votes will need to be submitted via some persistent server daemon, and not manually. For more information on how to do this, read the [Exchange Rate Oracle](validator-oracle.md) section of the Validator Handbook, and the [Oracle Module Specification](dev-spec-oracle.md).

### Delegate Exchange Rate Voting Rights

A voter may also elect to delegate exchange rate voting to another signing key.

```bash
terracli tx oracle set-feeder <feeder_address> --from=mykey
```

where `feeder_address` is the address you want to delegate your voting rights to. Note that the feeder will still need to submit votes on behalf of your validator in order for you to get credit.

## Market

### Swap Currencies

All currencies in the Terra ecosystem can be instantly swapped into another at the effective oracle exchange rate. To swap one currency for another, run:

```bash
terracli tx market swap \
  <offer_coin> \ 
  <ask_denom>  \
  --from mykey \
```

Where `offer_coin` is the coin looking to be traded and `ask_denom` the denomination of the coin to be swapped into.

For Terra<>Luna swaps, Constant-Product spread pricing model is enforced to limit consensus-related attack vectors. Terra<>Terra swaps have a constant Tobin Tax (0.3%).

### Query Swap Currencies

The Market module also allows you determine the result from a swap operation without actually executing the swap. To simulate a swap operation, run:

```bash
terracli query market swap <offer_coin> <ask_denom>
```

Where `offer_coin` is the coin looking to be traded and `ask_denom` the denomination of the coin to be swapped into.

## Treasury

### Query Tax Rate

Terra transactions charge a % fee on each outbound transaction from the sender's wallet. To get the effective stability fee rate, run:

```bash
terracli query treasury tax-rate
```

### Query Tax Cap

Stability fees are capped at some fixed amount of SDT to avoid penalizing large transactions. To get the current tax cap denominated in a given denomination (micro-units), run:

```bash
terracli query treasury tax-cap <denom>
```

### Query Tax Proceeds

To query the cumulative tax proceeds, run:

```bash
terracli query treasury tax-proceeds
```

### Query Reward Weight

The Reward Weight is the portion of seigniorage that is designated as ballot rewards for the winners of exchange rate oracle. To query the Reward Weight, run:

```bash
terracli query treasury reward-weight
```

### Query Seigniorage Proceeds

The treasury measures the amount of Terra seigniorage accumulated over epochs, denominated in units of `uluna`. To query the seigniorage proceeds, run:

```bash
terracli query treasury seigniorage-proceeds
```

### Query Parameters

Parameters define high-level settings for the Treasury, described [here](dev-spec-treasury.md#parameters). You can get the current values by using:

```bash
terracli query treasury params
```

With the above command you will get the values for:

* Tax Rate update policy 
* Reward Weight update policy
* Seigniorage Burden Target
* Mining Increment
* `WindowShort` \(update parameter\)
* `WindowLong` \(update parameter\)
* `WindowProbation` \(update parameter\)
