---
id: dev-spec-auth
title: Auth
---

> Terra's Auth module inherits from Cosmos SDK's [`auth`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/auth) module.
{note}

Terra's Auth module extends the functionality from Cosmos SDK's `auth` module with a modified ante handler which applies the stability layer fee alongside the all basic transaction validity checks (signatures, nonces, auxiliary fields). In addition, a special vesting account type is defined, which handles the logic for tokin vesting from the Luna presale.

## Fees

The Auth module reads the current effective `TaxRate` and `TaxCap` parameters from the [`Treasury`](dev-spec-treasury.md) module to enforce a stability layer fee.

### Gas Fee

As with any other transaction, [`MsgSend`](dev-spec-bank.md#msgsend) and [`MsgMultiSend`](dev-spec-bank.md#msgmultisend) pay a gas fee the size of which depends on validator's preferences (each validator sets his own min-gas-fees) and the complexity of the transaction. [Notes on gas and fees](node-users.md#a-note-on-gas-and-fees) has a more detailed explanation of how gas is computed. Important detail to note here is that gas fees are specified by the sender when the transaction is outbound.

### Stability Fee

In addition to the gas fee, the pay module charges a stability fee that is a percentage of the transaction's value. It reads the Tax Rate and Tax Cap parameters from the [`Treasury`](dev-spec-treasury.md) module to compute the amount of stability tax that needs to be charged.

The __Tax Rate__ is a parameter agreed upon by the network that specifies the percentage of payment transactions that will be collected as Tax Proceeds in the block reward, which will be distributed among the validators. The distribution model is a bit complicated and explained in detail [here](validator-faq.md#incentives). The taxes collected per transaction cannot exceed the specific __Tax Cap__ defined for that transaction's denomination. Every epoch, the Tax Rate and Tax Caps are recalibrated automatically by the network; see [here](dev-spec-treasury.md#monetary-policy-levers) for more details.

For an example `MsgSend` transaction of µSDR tokens,

```text
stability fee = min(1000 * tax_rate, tax_cap(usdr))
```

For a `MsgMultiSend` transaction, a stability fee is charged from every outbound transaction.

Unlike with the gas fee which needs to be specified by the sender, the stability fee is automatically deducted from the sender's `Account`.