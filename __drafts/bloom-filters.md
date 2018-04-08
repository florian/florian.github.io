---
layout: post
title:  "Advanced Bloom Filters"
categories: probabilistic-data-structures
---

<!-- http://jsbin.com/bocovofixo/edit?html,css,js,output -->

### Optimizing cache access

- Bits we look at might be in totally different positions, which means several
  cache misses are possible
- More optimal: Create Bloom filter that can be partitioned across several cache
  lines. Then, make sure that each value only sets/reads bits in one cache line
- At most one cache miss per query, which improves performance
- Trade-off is that it is hard to properly balance values into the partitions.
  If this is not done well, it will increase the false positive rate

### Notes: Other stuff that'd be interesting

- Maybe: Plot or table for number of hash functions
- Exact probability for false positives and how many bits to use to achieve
  certain false positive rates
- Maybe: Derive false positive probability
- How to choose hash functions (one hash function with different seeds is enough
  if it's still uniform across neighbouring strings, NOT Java hashCode, speed,
    iid uniform)
- Live Demo for counting Bloom filter
- Maybe: More detail on bitwise operations
- Mention space compactness
- Mention number of added elements for optimality of live demos

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
