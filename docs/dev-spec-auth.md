---
id: dev-spec-auth
title: Auth
---

> Terra's Auth module inherits from Cosmos SDK's [`auth`](https://github.com/cosmos/cosmos-sdk/tree/v0.37.4/docs/spec/auth) module.
{note}

The Auth module is responsible for specifying the base transaction and account types. It contains the ante handler, where all basic transaction validity checks (signatures, nonces, auxiliary fields) are performed, and the Terra stability layer fee is applied.

## Fees

The Auth module reads the current effective `TaxRate` and `TaxCap` parameters from the [`Treasury`](dev-spec-treasury.md) module to enforce a stability layer fee.

### Gas fees

As with any other transaction, `MsgSend` and `MsgMultiSend` has to pay a gas fee the size of which depends on validator's preferences \(each validator sets his own min-gas-fees\) and the complexity of the transaction. [Notes on gas and fees](node-users.md#a-note-on-gas-and-fees) has a more detailed explanation of how gas is computed. Important detail to note here is that gas fees are specified by the sender when the transaction is outbound.

### Stability fees

Further to the gas fee, the pay module charges a stability fee that is a percentage of the transaction's value. It reads the `tax-rate` and `tax-cap` parameters from the treasury module to compute the amount of stability tax that needs to be charged.

* `tax-rate`: an sdk.Dec object specifying what % of send transactions must be paid in stability fees
* `tax-cap`: a cap unique to each currency specifying the absolute cap that can be charged in stability fees from a given transaction. 

For an example `MsgSend` transaction of 1000 usdr tokens,

```text
stability fee = min(1000 * tax_rate, tax_cap(usdr))
```

For a `MsgMultiSend` transaction, a stability fee is charged from every outbound transaction.

Unlike with the gas fee which needs to be specified by the sender, the stability fee is automatically deducted from the sender's `Account`.