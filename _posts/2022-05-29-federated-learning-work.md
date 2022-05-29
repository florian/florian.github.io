---
layout: post
title:  "Working on Federated Learning"
date:   2022-5-29 02:21:01
description: "Why working on federated learning is interesting, meaningful and fun"
categories: federated-learning
---

Much has been written about how [federated learning]({{ site.baseurl }}{% link _posts/2018-05-09-federated-learning.md %}) (FL) can enable training much better models and help build more intelligent systems.
This essay instead discusses a more personal aspect: Why working on FL as an individual is interesting, meaningful and fun.

You can either take this as an advertisement for why one should work one FL, or as a personal reflection on why I am still passionate about it after working in the space for a few years.

### Fast and strong feedback loops

One thing that initially drew me to coding was the tight feedback loop:
After coding something up, you can immediately try it out and see whether it behaves as you wanted.
If it does not compile or work as expected, you get back to the code and iterate on it.
At least that is how it works for the kind of stuff people code after getting started with programming.

Compared to other fields where it is fairly difficult or time-consuming to check whether you are on the right path – think of math proofs or physical experiments – this made coding a ton more fun to me.
Fast iteration makes it easier to get into a state of flow, and allows you to try things out much more quickly.

Machine learning in the traditional way has no such feedback loop.
It is not uncommon for people to spend many weeks or months on a model before it ever gets tested out on real users.
Possibly much of that work was not fruitful after all, and, considering the quality of offline evaluation sets, you often have no good way of knowing beforehand.

FL enables fast iteration in a very natural way:
Training happens on-device, so it is trivial to also evaluate on-device at the same time.
During all of that, training also matches the inference distribution much more closely.

All of this means that you can directly understand much better whether the thing you are training is useful.
Instead of doing work for months and hoping that the model does not break in a later live experiment, you can see live during training how well the model is really doing on actual users.

The only caveat here is that FL has a larger upfront cost.
One has to build up the federated learning system before training can begin.
But in my opinion this is well worth the later advantage of having a powerful feedback loop.

### Interesting technical challenges

FL has a ton of interesting technical challenges:
You are trying to train something intelligent in a distributed system of millions of devices, where much of the code is run on end devices that you exercise little control over.

This leads to all sorts of interesting challenges and a huge variety of work one can do.
From pure machine learning work to distributed systems aspects, cryptography to writing on-device code (e.g. Android), there are a ton of interesting challenges to tackle.
The breadth of FL papers being published also shows this.

### Understanding user behavior, not tweaking data

People sometimes mock that machine learning work mostly comes down to playing with data.
That is certainly the case for much of traditional machine learning.
For example, for server-side training of models that eventually run on-device, one often only has access to unrepresentative proxy data.
Tweaking this proxy data to make it more similar to inference data is incredibly common.
This is necessary to make sure the model will work well during inference.

This often happens without a fast feedback loop, making it slow to check whether the tweaks one performed really helped.
This is thus not only rather frustrating work, but also hard to get right.

In FL, this is not really the case.
You are already training on user interactions that closely align with inference, so there is no need to do manual data tweaking work.

That does not mean that there is no work related to the data at all.
There is work in accessing the right kind of signals, removing noisy data and inferring the right kind of labels.
However, all of this is a much more natural way of approaching the problem.
It all comes down to understanding what happens on-device, not to tweaking data based on some high-level intuition.

### Privacy

Privacy is a major motivation for FL and why many people are drawn to it.
The whole concept of FL is geared towards data minimization and keeping users' data private.
It feels good to work on such a thing, in a world where privacy has been an afterthought for way too long.

Looking at the work that people are currently doing in FL, there is also a ton of interesting privacy-related work.
This ranges from advances in differential privacy to cryptographic aggregation algorithms or model auditing techniques.
All of these are super interesting to learn about, while really advancing privacy.

Furthermore, any work that makes it easier to use FL further advances the state of privacy, even if it is not directly privacy-related.
This is purely because it gets us closer to a world where FL can be a default option over traditional data collection.

### It is futuristic

One of my initial reactions after hearing about FL was that it sounds futuristic.
A network of millions of devices is jointly training something intelligent.
This also opens up the potential of training large and distributed models.

Nearly 5 years later, I still feel the same way.
It is incredible that something like this exists, already works so well, and is something I get to play with.

### It is the right time

There is a quote I really like to consider when picking what to work on:

> "The thing that differentiates scientists is purely an artistic ability to discern what is a good idea, what is a beautiful idea, what is worth spending time on, and most importantly, what is a problem that is sufficiently interesting, yet sufficiently difficult, that it hasn't yet been solved, but the time for solving it has come now."
>
> – Savas Dimopoulos

FL as a field seems to fit this perfectly.
Its time has only come recently, because of advances in machine learning and distributed systems, because phones have become powerful enough, and because internet connections have massively improved in many parts of the world.
All of these together have allowed FL to become possible.

In the past few years, FL as a field has now become established and many aspects of it have been explored, leading to it working better and better.
However, there are still a ton of challenges left to solve and many places where people are just starting to make use of FL.

This makes me incredibly excited about FL and its future.

---

### Acknowledgements

I would like to thank Karan Singhal, Sean Augenstein and Kuba Weimann for reading drafts of this post and providing lots of great feedback.
