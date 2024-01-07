---
layout: post
title:  "Secure Multi-Party Computation"
date:   2022-04-01 00:00:01
description: "Evaluating a function without learning its inputs"
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

Secure multi-party computation (*MPC*) is one of these things that sounds a bit magical the first time you hear about it.
Given \\(n\\) data points \\(x_1, \dots, x_n\\) that are distributed among \\(n\\) users, or compute nodes, we want to evaluate a function \\(f(x_1, \dots, x_n)\\) in a distributed or federated manner.
The catch is that this should be done in a way that does not reveal the input values to anyone new.
In other word, the value \\(x_i\\) of user \\(i\\) may not be shared with users \\(1, \dots, i -1, i + 1, \dots, n\\) or anyone else outside the network.

### Motivation

I will follow up with applications from a distributed machine learning perspective later – because that happens to be what people talk about in 2020 – but what I like about MPC is that is also very easy to find simple, motivating use cases.

Here's a set of those:

- A group of people wants to compute the average salary, without any individual revealing their own salary (\\(f = \operatorname{avg}\\))
- A set of companies is bidding for a contract and do not want to reveal their offer unless it is the best offer (\\(f = \min\\) or \\(f = \max\\))

### Challenges

MPC is a subarea of cryptography and usually cryptography is concerned with adversaries that are not participating in the encryption scheme.
For example, given two users that want to communicate, an adversary might try to intercept the messages and aim to understand them.
In MPC person-in-the-middle attacks are relevant, but we also want to protect against attacks from any of the \\(n\\) users participating in the evaluation of the function.

These users can act on different levels:

- Honest: They only want to learn values that they are given when executing the protocol as expected
- Semi-honest: They execute the protocol faithfully but try to do this in a way that allows them to learn as much as possible, for example by communicating in certain ways or by sharing certain values
- Malicious: They do not need to follow the protocol but expect other users to do so

This problem can be made more challenging by several users collaborating in an attack.
In the worst case, \\(n - 1\\) users are complicit and act in malicious ways to identify the information of the \\(n\\)-th user.

### MPC: Sum

### General-purpose MPC

### Applications

### Conclusion
