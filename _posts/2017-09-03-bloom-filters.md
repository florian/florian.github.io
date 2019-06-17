---
layout: post
title:  "Bloom Filters"
date:   2017-09-03 19:36:20
description: "A probabilistic data structure for sets"
categories: probabilistic-data-structures
---

{% comment %} http://jsbin.com/bocovofixo/edit?html,css,js,output {% endcomment %}


Probabilistic data structures are great. They allow us to be more efficient in
terms of time or space at the cost of only returning an approximate result.
Bloom filters are a popular such data structure. When I recently learned more
about their use cases, I found Bloom filters to be quite fascinating, so they
seem like a good topic to write a blog post about.

In a nutshell, Bloom filters allow testing for set membership in a highly
efficient way. The trade-off is that they only return an approximate result.
Bloom filters either tell us that a value is definitely not in the set or that
it is *probably* in the set.
If we consider being in the set as a positive result, this means they allow for
false positives but not for false negatives.

The remainder of this blog post gives a more thorough introduction to Bloom filters and their
applications. Generally, the only prerequisites for being able to follow this
introduction are having a basic understanding of hashing and knowing what a set
is. To illustrate the ideas on a more intuitive level, I also coded up some live
demos and embedded them here.

### General structure

The underlying data structure for a Bloom filter is a bit array. Individual bits
in this bit array can either be set or not set. These possible states correspond
to values of 1 and 0. To efficiently change the values of bits, bitwise
operations can be used. As these are quite straight-forward, we will not go into
more detail here and just assume that we have operations for reading and writing
individual bits available.

To get started with Bloom filters, let's first consider a simple version of
them. To insert a value into the set, we use a hash function to map the value to
a valid index for the bit array. Then we change the bit corresponding to that
index to 1.

To test if a value is part of our set, we hash the value and read
the corresponding bit. If it is 0, the value is definitely not in the set,
otherwise that bit would've been changed to 1. If the bit is 1, this
tells us that the value is *probably* in the set. Probably, because there is a
chance that another element with the same hash value was inserted. In other
words, hash collisions are possible.

### Evaluating the simple solution

Below, you can find a live demo that can be used to test how well this works. As
you will notice, if the bit array is large and we insert relatively few
elements, then the probability of a hash collision is quite low. Of course, we
are assuming that the hash function is approximately uniformly distributed. As
we insert more values, hash collisions get more common and, at some point, we will
get too many false positives. Note that the Bloom filter below has only 32 bits
for visualization purposes.
This is an extraordinarily small Bloom filter, so we can't add many elements
while still maintaining an acceptable false positive rate.

<div id="bloom-simple"></div>

This already highlights one important property of Bloom filters: We should have
some estimate for how many values we want to insert. This estimate should then
be used to choose an appropriate size for the bit array. By choosing a large
enough size, we can ensure that the expected number of false positives is quite
low.

Let's take a moment to reflect on this solution. Under the assumption that we
choose the array size to be large enough and that some false positives are
acceptable, we have a very fast way of testing for set membership.
Conceptually, this solution is also pretty simple. We can think of it as a
HashSet that ignores the possibility of collisions. Because we only store a bit
array, Bloom filters are also quite space-efficient, especially when compared to
methods that store the original values, like HashSets.

### Using multiple hash functions

In terms of efficiency, the data structure given above is pretty much perfect.
The two important operations, inserting and testing membership, are both
performed in constant time. What we primarily want to improve now is the
probability of false positives.

This is where Bloom filters start to get interesting. Instead of just using a
single hash function, we use *k* hash functions. So for each value we insert, we
get *k* indices where we set the bits to 1. For testing membership, we check
the bits corresponding to *k* indices.

<div id="bloom-normal"></div>

This significantly decreases the chance of getting false positives. Given a
large Bloom filter without many entries, it's unlikely to get one hash
collision. But getting *k* collisions at the same time is even more unlikely if
most bits are not set.

### Deciding on the number of hash functions

More hash functions only help until a certain point. As an extreme example,
using as many hash functions as bits would make a Bloom filter totally
useless. On a similar note, when only having 32 bits available, using 3 hash
functions fills up the bit array too quickly, as you might have noticed in the
live demo above. It turns out that the optimal number of hash functions depends
on the bit array size and on how many elements we expect to be added.

For *n* added elements and a bit array size of *m*, the optimal number of hash
functions *k* is:

$$
k = \frac{m}{n} * \ln(2)
$$

On a first look, this formula seems a bit cryptic. The logarithm is due to the
fact that we're estimating the probability of false positives using [Azuma's
inequality](https://en.wikipedia.org/wiki/Azuma%27s_inequality), which uses the
exponential function. By transforming that inequality, we end up with the natural
logarithm. Other than that, the formula is easy to interpret. As the
bit array size increases in comparison to the expected number of added elements,
the optimal number of hash functions increases linearly.

Deciding on the bit array size is also pretty straight-forward. A larger bit
array size always decreases the false positive rate. The downside is that more
space is needed. Generally, this is a trade-off where we choose the exact value
depending on the use case.

### Applications

After having only talked about the technical parts so far, let's take a step
back and look at some applications.
Generally, Bloom filters are useful when a few false positives are acceptable to
be more space and time efficient, but false negatives are not.
In the next two subsections, we'll go into more detail for two prime examples for Bloom filters.

#### Spelling correction

To implement spelling correction, we need some way to decide whether a word is
misspelled. The Oxford English Dictionary contains more than 200,000 words.
Having all these words stored in memory all the time is a bad idea.

Instead, we can insert all words from the dictionary into a Bloom filter to be
much more space efficient. The fact that false positives are possible means that
there will be a few misspelled words that will not be detected. However, no
correctly written words would be marked as incorrect. This is good because it
would only annoy users.

#### Databases

Querying a database can be expensive, especially when it requires IO operations.
[Cassandra](http://cassandra.apache.org) uses Bloom filters to make [reading data](http://docs.datastax.com/en/cassandra/3.0/cassandra/dml/dmlAboutReads.html)
more efficient. It's a first filter that checks if it's possible that a key is
contained in some table. This allows Cassandra to prevent many expensive memory
calls.

A few false positives are not a problem here. They just lead to performing the
normal expensive call that would be performed anyways if the Bloom filter would
not be used at all.

### Other set operations

So far we only discussed two operations, adding elements and testing for
membership. Depending on the application, other operations are also interesting.
In the following, we will focus on the classical set operations, union and
intersection. Afterwards, we'll also look at removing elements.

In the next two subsections, we assume that all Bloom filters use the same hash
functions and have the same number of bits.

#### Union

Union is straight-forward to implement for Bloom filters. We simply
create a Bloom filter where a bit is set when it's also set in any input Bloom
filter. This resulting Bloom filter behaves exactly as when we directly query
all original Bloom filters and only returning true if at least one individual Bloom
filters returned true.

#### Intersection

For implementing an intersection operation, we can try to follow the same idea:
Construct a Bloom filter where a bit is set when all one input Bloom filter
had the bit set. It turns out that this is not a perfect solution because it
will lead to more false positives compared to directly querying the individual
Bloom filters.

To understand why, it helps to think of a Bloom filter with two hash functions.
A value is part of this Bloom filter if its respective two bits are set. In the
Bloom filter resulting from the intersection it is possible that these bits were
set because of several different values that are not in the intersection themselves.
This would not happen if we build a new Bloom filter directly from the set
intersection.

### Removing values

Removing values from standard Bloom filters is difficult. By just setting the
corresponding bits to 0, we could accidentally introduce false negatives. This is
due to the fact that a bit maybe also needs to be set for a different added
element. We generally want to avoid false negatives with Bloom filters, so this
is not an acceptable solution.

One possible solution is introducing a second Bloom filter that keeps track of
the removed values. This only works if values cannot be re-added. Still, this is
not a satisfying solution since false positives in this second Bloom filter
become false negatives in the first Bloom filter.

*Counting Bloom Filters* are a more sophisticated alternative. Instead of just
using bits as Boolean indicators, enough bits to keep a count at each index are
used. Then, instead of setting a bit, the count at the respective position is
increased by 1. For removing an element, the counter is decreased by 1. This
works well as long as an element is not added more than once before removing it.

<div id="bloom-counting"></div>

### Summary

Bloom Filters are a probabilistic data structure that allow for testing set
membership in an extremely efficient way. Since they are based on bitwise operations,
they also require very little space. The trade-off is that there is a small
probability of false positives.
These false positives can be reduced by using enough bits and multiple hash functions.
There are many interesting use-cases for Bloom Filters, for example to make
caching in databases more efficient.

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
<script src="https://fb.me/react-15.1.0.js"></script>
<script src="https://fb.me/react-dom-15.1.0.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/core-min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/hmac-md5.js"></script>

<style>
.bloom-filter {
  width: 581px;
  position: relative;
  margin-left: 30px;
  margin-bottom: 15px;
}

.bloom-filter h2 {
  font-size: 17px;
  display: inline-block;
  margin: 0;
}

.bloom-filter ul {
  list-style-type: none;
  margin: 10px auto;
  padding: 0;
}

.bloom-filter li {
  display: inline-block;
  width: 17px;
  height: 17px;
  padding: 0;
  text-indent: 0;
  border: 1px solid #565656;
  border-right: none;
  text-align: center;
  font-size: 13px;
  vertical-align:top
}

.bloom-filter li:before {
  content: '';
  padding: 0;
}


.bloom-filter ul :last-child {
  border-right: 1px solid;
}

.bloom-filter .set {
  background: grey;
  transition: background .5s ease-in;
}

.bloom-filter form {
  padding-bottom: 10px;
}

.bloom-filter input {
  display: inline-block;
  position: relative;
  vertical-align: top;
}

.bloom-filter input[type="text"] {
  width: 150px;
  height: 15px;
  padding: 4px 6px;
  font-size: 14px;
  float: none;
  margin-left: 0;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  outline: none;
  line-height: 20px;
  color: #555555;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  border-radius: 4px 0 0 4px;
}

.bloom-filter input[type="submit"], .bloom-filter input[type="button"] {
  min-width: 100px;
  height: 25px;
  line-height: 15px;
  margin-left: -3px;
  padding: 4px 12px;
  font-size: 14px;
  color: #333333;
  text-align: center;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);
  cursor: pointer;
  background-color: #e6e6e6;
  background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));
  background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);
  background-repeat: repeat-x;
  border: 1px solid #cccccc;*
  border: 0;
  border-color: #e6e6e6 #e6e6e6 #bfbfbf;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  border-bottom-color: #b3b3b3;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.bloom-filter input[type="submit"]:active, .bloom-filter input[type="button"]:active {
  background-color: #ffffff;
  background-image: -moz-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#e6e6e6), to(#ffffff));
  background-image: -webkit-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -o-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: linear-gradient(to top, #ffffff, #e6e6e6);
  background-repeat: repeat-x;
}

.bloom-filter .last-input {
  border-radius: 0 4px 4px 0;
}

.bloom-filter .elements {
  display: inline-block;
}
</style>

<script>
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BloomFilter = function () {
  function BloomFilter(num_bits, num_hash_functions) {
    _classCallCheck(this, BloomFilter);

    this.num_bits = num_bits;
    this.num_hash_functions = num_hash_functions;
    this._init_storage();
  }

  _createClass(BloomFilter, [{
    key: "_init_storage",
    value: function _init_storage() {
      this.storage = Array(this.num_bits);
      for (var i = 0; i < this.num_bits; i++) {
        this.storage[i] = false;
      }
    }
  }, {
    key: "hash",
    value: function hash(value) {
      var seed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return Math.abs(CryptoJS.MD5(value + seed).words.reduce(function (a, b) {
        return a + b;
      }), 0) % this.num_bits;
    }
  }, {
    key: "add",
    value: function add(value) {
      for (var i = 0; i < this.num_hash_functions; i++) {
        var hashed = this.hash(value, i);
        this.storage[hashed] = true;
      }
    }
  }, {
    key: "contains",
    value: function contains(value) {
      for (var i = 0; i < this.num_hash_functions; i++) {
        var hashed = this.hash(value, i);
        if (!this.storage[hashed]) return false;
      }

      return true;
    }
  }, {
    key: "print",
    value: function print() {
      return this.storage.reduce(function (result, bit) {
        if (bit) {
          return result + "x";
        } else {
          return result + "_";
        }
      }, "");
    }
  }]);

  return BloomFilter;
}();

var CountingBloomFilter = function (_BloomFilter) {
  _inherits(CountingBloomFilter, _BloomFilter);

  function CountingBloomFilter() {
    _classCallCheck(this, CountingBloomFilter);

    return _possibleConstructorReturn(this, (CountingBloomFilter.__proto__ || Object.getPrototypeOf(CountingBloomFilter)).apply(this, arguments));
  }

  _createClass(CountingBloomFilter, [{
    key: "_init_storage",
    value: function _init_storage() {
      this.storage = Array(this.num_bits);
      for (var i = 0; i < this.num_bits; i++) {
        this.storage[i] = 0;
      }
    }
  }, {
    key: "add",
    value: function add(value) {
      for (var i = 0; i < this.num_hash_functions; i++) {
        var hashed = this.hash(value, i);
        this.storage[hashed] += 1;
      }
    }
  }, {
    key: "print",
    value: function print() {
      return this.storage.reduce(function (result, bit) {
        if (bit) {
          return result + String(bit);
        } else {
          return result + "_";
        }
      }, "");
    }
  }, {
    key: "remove",
    value: function remove(value) {
      for (var i = 0; i < this.num_hash_functions; i++) {
        var hashed = this.hash(value, i);
        this.storage[hashed] -= 1;
      }
    }
  }]);

  return CountingBloomFilter;
}(BloomFilter);

function plural(base, extension, n) {
  return n + " " + base + (n == 1 ? "" : extension);
}

var BloomFilterVisualization = function (_React$Component) {
  _inherits(BloomFilterVisualization, _React$Component);

  function BloomFilterVisualization(props) {
    _classCallCheck(this, BloomFilterVisualization);

    var _this2 = _possibleConstructorReturn(this, (BloomFilterVisualization.__proto__ || Object.getPrototypeOf(BloomFilterVisualization)).call(this, props));

    _this2.state = {
      bf: props.counting ? new CountingBloomFilter(props.bits, props.hash_functions) : new BloomFilter(props.bits, props.hash_functions),
      bits: props.bits,
      hash_functions: props.hash_functions,
      addedValues: [],
      simple: props.simple || false,
      lastCheck: "",
      counting: props.counting || false
    };
    return _this2;
  }

  _createClass(BloomFilterVisualization, [{
    key: "render",
    value: function render() {
      var data_structure = "Bloom Filter";
      if (this.state.counting) {
        data_structure = "Counting " + data_structure;
      }

      return React.createElement(
        "div",
        { className: "bloom-filter" },
        React.createElement(
          "h2",
          null,
          "Live Demo: ",
          data_structure,
          " with ",
          this.state.bits,
          " bits and ",
          plural("hash function", "s", this.state.hash_functions),
          " "
        ),
        React.createElement(
          "ul",
          null,
          this.state.bf.storage.map(this.renderBit.bind(this))
        ),
        this.renderForm(),
        React.createElement(
          "div",
          { className: "elements" },
          "Added so far: ",
          "{",
          " ",
          this.state.addedValues.join(", "),
          " ",
          "}"
        ),
        this.state.lastCheck != "" ? React.createElement(
          "div",
          null,
          this.state.lastCheck
        ) : ""
      );
    }
  }, {
    key: "renderBit",
    value: function renderBit(bit, i) {
      var className = "",
          content = "";

      if (this.state.counting) {
        content = bit == 0 ? "" : String(bit);
      } else {
        className = bit ? "set" : "not-set";
      }

      return React.createElement(
        "li",
        { className: className, key: i },
        content
      );
    }
  }, {
    key: "renderForm",
    value: function renderForm() {
      return React.createElement(
        "form",
        { onSubmit: this.add.bind(this) },
        React.createElement("input", { type: "text", ref: "value" }),
        this.state.simple ? React.createElement("input", { type: "submit", value: "Add", className: "last-input" }) : "",
        !this.state.simple ? React.createElement("input", { type: "submit", value: "Add" }) : "",
        this.state.counting ? React.createElement("input", { type: "button", value: "Remove", onClick: this.remove.bind(this) }) : "",
        !this.state.simple ? React.createElement("input", { type: "button", value: "Check for membership", className: "last-input", onClick: this.check.bind(this) }) : ""
      );
    }
  }, {
    key: "add",
    value: function add(e) {
      e.preventDefault();

      var input = this.refs.value;
      var value = input.value;
      input.select();

      if (value.trim() == "") return false;

      var addedValues = this.state.addedValues;
      var inSet = addedValues.indexOf(value) != -1;

      if (this.state.counting && inSet) {
        var confirmed = confirm("Adding an already added value will partly break the Counting Bloom filter. Do you still want to continue?");
        if (!confirmed) {
          return false;
        }
      }

      var bf = this.state.bf;
      bf.add(value);

      if (!inSet) addedValues.push(value);

      this.setState({
        bf: bf,
        addedValues: addedValues
      });
    }
  }, {
    key: "check",
    value: function check(e) {
      e.preventDefault();

      var input = this.refs.value;
      var value = input.value;
      input.select();

      if (value.trim() == "") return false;

      var bf = this.state.bf;
      var isContained = bf.contains(value);

      this.setState({
        lastCheck: value + " was " + (isContained ? "" : "not ") + "found"
      });
    }
  }, {
    key: "remove",
    value: function remove(e) {
      e.preventDefault();

      var input = this.refs.value;
      var value = input.value;
      input.select();

      if (value.trim() == "") return false;

      var addedValues = this.state.addedValues;
      var inSet = addedValues.indexOf(value) != -1;

      if (!inSet) {
        var confirmed = confirm("Removing a value that's not in the set will partly break the Counting Bloom filter. Do you still want to continue?");
        if (!confirmed) {
          return false;
        }
      }

      this.state.bf.remove(value);
      addedValues.splice(addedValues.indexOf(value), 1);

      this.setState({
        addedValues: addedValues
      });
    }
  }]);

  return BloomFilterVisualization;
}(React.Component);

ReactDOM.render(React.createElement(BloomFilterVisualization, { bits: 32, hash_functions: 1 }), document.getElementById("bloom-simple"));
ReactDOM.render(React.createElement(BloomFilterVisualization, { bits: 32, hash_functions: 3 }), document.getElementById("bloom-normal"));
ReactDOM.render(React.createElement(BloomFilterVisualization, { bits: 32, hash_functions: 3, counting: true }), document.getElementById("bloom-counting"));
</script>
