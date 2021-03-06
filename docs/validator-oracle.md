---
id: validator-oracle
title: Exchange Rate Oracle
---

This document is a basic guide for validators on how to set up an automatic system to periodically vote for the exchange rate of Luna, an important responsibility for validators.

## Introduction

With the Columbus-3 release, every active validator must participate in the Exchange Rate Oracle, voting periodically for the active Exchange Rate of Luna, and not participating in the Oracle process is now a [slashing condition](dev-spec-oracle.md#slashing).

## Exchange Rate Feeder Software

The Terra Core team has provided a reference implementation of a program that pulls the exchange rate of Luna from exchanges and periodically submits it in prevotes and votes following the [Voting Procedure](dev-spec-oracle.md#voting-procedure). In addition, several validators have also created alternate feeder implementations.

| Software | Developer | Runtime | Notes |
| :-- | :-- | :-- | :-- |
| [`oracle-feeder`](https://github.com/terra-project/oracle-feeder/tree/columbus-3) | **Terra** | Node.js, Python | Official reference implementation |
| [`terra_oracle_voter`](https://github.com/b-harvest/terra_oracle_voter) | [B-Harvest](https://bharvest.io/) | Python | |
| [`oracle-voter`](https://github.com/stakewithus/oracle-voter) | [StakeWith.Us](https://stakewith.us) | Python | |
| [`terra-oracle`](https://github.com/node-a-team/terra-oracle) | [Node A-Team](https://nodeateam.com/) | Go | |

### Guidelines for writing your own feeder

Here are some important things to remember when writing your own Luna exchange rate feeder implementation:

- It may be tempting to design a new pricing model other than getting exchange data direct. Keep in mind that you will be penalized for not voting within the Reward Band of your peer validators, consensus is key!