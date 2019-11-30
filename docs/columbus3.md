---
id: columbus3
title: Columbus-3 Mainnet
---

The latest iteration of the Terra protocol is the Columbus-3 Mainnet, released on __. It required a hard-fork from Columbus-2, and upgrades the network with several new features and breaking changes.

## Upgrading from Columbus-2



## What's New?

See the upgraded genesis parameters [here](https://github.com/terra-project/launch/tree/master/columbus-3).

### Increased Utility For Luna

Starting with Columbus-3, Luna will become a much more attractive asset to acquire and hold, with increased staking rewards, exemptions from transaction taxes, and on-chain governance rights over the Terra ecosystem.

#### Increased Luna Staking Rewards

From the very beginning we’ve been committed to making Luna responsive to the protocol’s on-chain monetary policy. The most important lever of that monetary policy is the tax rate incurred by Terra stablecoin transactions. We erred on the side of conservatism when first launching the mainnet, but have since then become more comfortable with a higher tax rate.

- **Tax Rate** for Terra transactions will increase from 0.11% to 0.5%. Subsequent increases in tax rates will no longer be recommended by Terraform Labs, but will either be set by the protocol, or via on-chain governance.

- **Seigniorage rewards will now be distributed in oracle rewards**. Since Columbus-2, a 2–10% swap spread fee was being paid out to validators that had faithfully submitted oracle votes as a success reward. From Columbus-3, the inverse is now true — a portion of seigniorage is now given out as oracle rewards, and the swap fees are now burned.


These changes will significantly increase rewards from staking Luna. On top of this, Project Santa will continue to operate on Columbus-3.

#### Governance Rights for Luna

We introduce on-chain governance with Columbus-3. Going forward, this effectively allows Luna holders to govern the blockchain. Luna holders can submit proposals and signal their approval or disapproval by voting on proposals submitted by others. A supermajority of supporting votes will ratify proposals; anything short will table them. The governance mechanism will support three types of proposals:

- **Parameter changes**: Any parameter on the Terra blockchain (as stored in the ParamKeeper) can be voted on and changed on runtime.

- **Monetary policy changes**: Luna voters vote on key macroeconomic levers, namely the tax-rate , which governs how much fees are levied on Terra transactions, and the reward-weight, which governs how much seigniorage is given out in oracle rewards as opposed to going into the community pool.

- **Community Pool spend**: A portion of seigniorage (1- reward-weight ) is delivered to a Community Pool.

- **General text proposals**: Used to recommend software upgrades, changes in community management, and for everything else.

Through the introduction of on-chain governance, Luna will start to play a crucial role for those who want to participate in growing Terra’s burgeoning ecosystem.

#### Tax-Exemption for Luna Transactions

Terra is the transaction-focused asset and Luna is not. Therefore, Luna transactions are now exempt from tax fees, making it a much easier asset for trading.


### Improved Network Security

While the network was still in its early stages, the slashing terms had been intentionally kept negligible to minimize penalties from coordination errors. With Columbus-3, penalties for misbehavior will increase, meaning the cost for attacking the network or negligence will become higher. To learn more about why slashing is necessary, read this.

#### Increased Slashing Penalties

Downtime slashing will be increased from 0.01% to 1%, and double sign slashing will be increased from 1% to 5%.

#### Slashing for Oracle Negligence

Providing a faithful price feed to the onchain oracle is one of the principle responsibilities of a Terra Validator. Validators that fail to submit over a threshold of valid oracle votes over a time window (oracle negligence) will be slashed 1% of their stake.

### Increased Robustnes of Oracles & Swaps

#### Tobin Tax for Terra/Terra Swaps

In Columbus-2, Terra <> Terra swaps were made available without a spread fee. That lead to front-running arbitrage attacks, exploiting the delays in the on-chain oracle. Read more about that here.

Terra <> Terra swaps now charge a tobin tax of 0.25% to prevent front-running arbitrage attacks.

#### Uniswap Revamp for Terra/Luna Swaps

Those of you that have been watching Agora will know that this has been the principle area of our research since network launch. We now move to a dynamic spread system inspired by Uniswap. Snippets of these discussions are found here and here. Big kudos to Nicholas Platias for leading this line of research & development.
