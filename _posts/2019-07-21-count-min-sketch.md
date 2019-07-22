---
layout: post
title:  "Count-Min Sketch"
date:   2019-07-21 05:36:20
description: "A probabilistic data structure for data stream summaries"
categories: probabilistic-data-structures
---

{% comment %} https://jsbin.com/nisocenenu/1/edit?html,css,js,output {% endcomment %}

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

<style>
.matrix-left-aligned {
  position: relative;
}

@media(min-width: 675px) {
  .matrix-left-aligned {
    left: -32px;
  }
}

@media(min-width: 800px) {
  .matrix-left-aligned {
    left: -72px;
  }
}
</style>

Let's say we want to count the number of times elements appear in a stream of data.
A simple solution is to maintain a hash table that maps elements to their frequencies.

This approach does not scale: Imagine having a stream with billions of elements, most of which are unique.
Even if we are only interested in the most important ones, this method has huge space requirements.
Since we do not know for which items to store counts, our hash table will grow to contain billions of elements.

The *Count-Min Sketch*, or *CMS* for short, is a data structure that solves this problem in an approximate way.
Similarly to [Bloom Filters]({{ site.baseurl }}{% link _posts/2017-09-03-bloom-filters.md %}), we save a lot of space by using probabilistic techniques.
In fact, a CMS works a bit like a [Counting Bloom Filter]({{ site.baseurl }}{% link _posts/2017-09-03-bloom-filters.md %}#removing-values), though they do have different use cases.

### Approximate Counts with Hashing

Given that we only have limited space availability, it would help if we could get away with not storing elements themselves but just their counts.
To this end, let's try to use only an array, with \\( w \\) memory cells, for storing counts.

{% include img.html url="array.png" width="470" %}

With the help of a hash function *h*, we can implement a counting mechanism based on this array.
To increment the count for element \\( a \\), we hash it to get an index into the array.
The cell at the respective index \\( h(a) \\) is then incremented by \\( 1 \\).

Concretely, this data structure has the following operations:

- Initialization: \\( \forall i \in \\{1, \dots, w\\}: \operatorname{count}[i] = 0 \\)
- Increment count (of element \\( a \\)): \\(\operatorname{count}[h(a)] \mathrel{+}= 1 \\)
- Retrieve count (of element \\( a \\)): \\(\operatorname{count}[h(a)]\\)

This approach has the obvious drawback of hash conflicts.
We would need a lot of space to make collisions unlikely enough to get good results.
However, we at least do not need to explicitly store keys anymore.

### More Hash Functions

Instead of just using one hash function, we could use \\( d \\) different ones.
These hash functions should be pairwise independent.
To update a count, we then hash item \\( a \\) with all \\( d \\) hash functions, and subsequently increment all indices we got this way.
In case two hash functions map to the same index, we only increment its cell once.

Unless we increase the available space, of course all this does for now is to just increase the number of hash conflicts.
We will deal with that in the next section.
For now let's continue with this thought for a moment.

If we now want to retrieve a count, there are up to \\( d \\) different cells to look at.
The natural solution is to take the minimum value of all of these.
This is going to be the cell which had the fewest hash conflicts with other cells.

$$
\min_{i=1}^d \operatorname{count}[h_i(a)]
$$

While we are not fully there yet, this is the fundamental idea of the Count-Min Sketch.
Its name stems from the process of retrieving counts by taking the minimum value.

### Fewer Hash Conflicts

We added more hash functions but it is not evident whether this helps in any way.
If we use the same amount of space, we definitely increase hash conflicts.
In fact, this implies an undesirable property of our solution: Adding more hash functions increases potential errors in the counts.

Instead of trying to reason about how these hash functions influence each other, we can design our data structure in a better way.
To this end, we use a matrix of size \\(w \times d\\).
Rather than working on an array of length \\( w \\), we add another dimension based on the number of hash functions.

{% include img.html url="matrix.png" width="613" class="matrix-left-aligned" %}

Next, we change our update logic so that each function operates on its on row.
This way, hash functions cannot conflict with another anymore.
To increment the count of element \\( a \\), we now hash it with a different function once for each row.
The count is then incremented in exactly one cell per row.


- Initialization: \\( \forall i \in \\{1, \dots, d\\}, j \in \\{1, \dots, w\\}, : \operatorname{count}[i, j] = 0 \\)
- Increment count (of element \\( a \\)): \\( \forall i \in \\{1, \dots, d\\}: \operatorname{count}[i, h_i(a)] \mathrel{+}= 1 \\)
- Retrieve count (of element \\( a \\)): \\(min_{i=1}^d \operatorname{count}[i, h_i(a)]\\)

This is the full CMS data structure.
We call the underlying matrix a *sketch*.

<div id="cms"></div>

### Guarantees

The counts we retrieve from a CMS data structure are approximate by nature.
However, there are some theoretical guarantees on error bounds.
The parameters \\( w \\) and \\( d \\) can be configured so that errors are of reasonable magnitude for the application at hand.

We can start off by stating that CMS can only overestimate counts, i.e. the frequencies it returns are upper bounds.
Errors are only introduced when cell values are incremented too much because of hash conflicts.
Thus, it is not possible that the returned count is too low.

To describe the bounds on how much CMS overestimates, we can use two variables, \\( \epsilon \\) and \\( \delta \\).
Additionally, let \\( \|\|\operatorname{count}\|\|_1 \\) be the sum of all counts stored in the data structure, i.e. the sum of values in one row of the sketch.
The central guarantee CMS provides is then the following:

**Theorem**: With a probability of \\( 1 - \delta \\), the error is at most \\( \epsilon * \|\|\operatorname{count}\|\|_1 \\).
Concrete values for these error bounds \\( \epsilon \\) and \\( \delta \\) can be freely chosen by setting \\( w = \lceil e / \epsilon \rceil \\) and \\( d = \lceil \ln(1 / \delta)\rceil \\).

The full proof of this result is given in original CMS paper {% include ref.html i=1 %}.
Adding another hash function quickly reduces the probability of bad errors which are outside the bound.
This is because hash conflicts would now also need to appear in the new row, additionally to all the previous rows.
Since the hash functions are pairwise independent, this has an exponential effect.
Increasing the width helps spread up the counts, so it reduces the error a bit further, but only has a linear effect.

Typically the sketch is much wider than it is deep.
Using many hash functions quickly becomes expensive.
It is also not necessary to add a large number of hash functions since \\( \delta \\) rapidly shrinks as we add more rows.

### Applications

Generally, CMS is useful whenever we only care about approximate counts of the most important elements.
A property that allows for many applications is that it is possible to first fill the data structure, and then later query it with valid keys.
In other words, we initially do not need to know the keys we are actually interested in.

#### Database Query Planning

Database engines plan how they execute queries.
How quickly a query is performed can heavily depend on the execution strategy, so it is a crucial area of optimization.
For example, this is especially important when determining the order in which several joins are performed, a task known as *join order optimization*.

Part of finding good execution strategies is estimating the table sizes yielded by certain subqueries.
For example, given a join, such as the one below, we want to find out how many rows the result will have.

```sql
SELECT *
FROM a, b
WHERE a.x = b.x
```

This information can then be used to allocate a sufficient amount of space.
More importantly, in a bigger query where the result is joined with a table `c`, it could be used to determine which tables to join first.

To estimate the size of the join, we can create two CM sketches.
One holds the frequencies of elements `x` in  `a`, the other holds frequencies of elements `x` in `b`.
We can then query these sketches to estimate how many rows the result will have.

Building up full hash tables for this task would require a huge amount of space.
Using a sketch data structure is much more feasible, especially since the SQL tables in the join could potentially be very big.
Furthermore, an approximate result is generally good enough for planning.

#### Finding Heavy Hitters

A common task in many analytics application is finding *heavy hitters*, elements that appear a lot of times.
For example, given a huge log of website visits, we might want to determine the most popular pages and how often they were visited.
Again, building up a full hash table could scale badly if there is a [long tail](https://en.wikipedia.org/wiki/Long_tail) of unpopular pages that have few visits.

To solve the problem with CMS, we simply iterate through the log once and build up the sketch {% include ref.html i=2 %}.
To query the sketch, we need to come up with candidate keys to check for.
If we do not have an existing candidate set, we can simple go through the log again and look up each page in the CMS, remembering the most important ones.

### Beyond Point Queries

The type of queries discussed in this blog points are *point queries*, i.e. estimates of the counts of individual items.
However, CMS also allows for more advanced queries.
These include range queries and inner product queries, which could be used to compute even better estimates of join sizes.

### Summary

To summarize, the Count-Min Sketch is a probabilistic data structure for computing approximate counts.
It is useful whenever space requirements could be problematic and exact results are not needed.
The data structure is designed in a way that allows freely trading off accuracy and space requirements.

{% capture refs %}
	{% include cite.html i=1 acm="Graham Cormode and S. Muthukrishnan. 2005. An improved data stream summary: the count-min sketch and its applications. Journal of Algorithms 55, 1 (2005), 58–75" pdf="https://www.cse.unsw.edu.au/~cs9314/07s1/lectures/Lin_CS9314_References/cm-latin.pdf" notes="papers/015_An_Improved_Data_Stream_Summary_The_Count-Min_Sketch_and_its_Applications.md" %}
	{% include cite.html i=2 acm="Cormode, G. (2017). What is Data Sketching, and Why Should I Care?. Communications of the ACM (CACM), 60(9), 48-55." pdf="https://pdfs.semanticscholar.org/548a/1a53896474c314ea33b9c1f96ecec8ed3b10.pdf" notes="papers/016_What_is_Data_Sketching_and_Why_Should_I_Care.md" %}
{% endcapture refs %}
{% include references-list.html content=refs %}

<script src="https://fb.me/react-15.1.0.js"></script>
<script src="https://fb.me/react-dom-15.1.0.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/core-min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/hmac-md5.js"></script>

<style>
.cms {
  width: 650px;
  overflow: hidden;
  margin-bottom: 15px;
}

.cms i {
  text-decoration: none;
  font-style: none;
  font-family: monospace;
  font-size: 18px;
}

.cms table {
  border-collapse: collapse;
}

.cms tr {
  line-height: 0;
}

.cms td {
  border: 1px solid;
  border-bottom: 0;
  border-right: 0;
  display: inline-block;
  padding: 7px 0px;
  font-family: monospace;
  font-size: 15px;
  color: #222;
  width: 39px;
  text-align: center;
  overflow: hidden;
  line-height: 22px;
}

.cms tr:last-child td {
  border-bottom: 1px solid;
}

.cms td:last-child {
  border-right: 1px solid;
}

.cms form {
  padding-bottom: 10px;
  margin-top: 10px;
}

.cms input {
  display: inline-block;
  position: relative;
  vertical-align: top;
}

.cms input[type="text"] {
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

.cms input[type="submit"], .cms input[type="button"] {
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

.cms input[type="submit"]:active, .bloom-filter input[type="button"]:active {
  background-color: #ffffff;
  background-image: -moz-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#e6e6e6), to(#ffffff));
  background-image: -webkit-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -o-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: linear-gradient(to top, #ffffff, #e6e6e6);
  background-repeat: repeat-x;
}

.cms input:last-child {
  border-radius: 0 4px 4px 0;
}
  width: 650px;
  overflow: hidden;
}

.cms i {
  text-decoration: none;
  font-style: none;
  font-family: monospace;
  font-size: 15px;
}

.cms table {
  border-collapse: collapse;
  margin: 15px 0 !important;
  margin-top: 12px !important;
}

.cms table tbody td {
  border: 1px solid;
  border-bottom: 0;
  border-right: 0;
  display: inline-block;
  padding: 6px 0px;
  font-family: monospace;
  font-size: 15px;
  color: #222;
  width: 39px;
  text-align: center;
  overflow: hidden;
}

.cms tr:last-child td {
  border-bottom: 1px solid;
}

.cms td:last-child {
  border-right: 1px solid;
}

.cms form {
  padding-bottom: 10px;
  margin-top: 10px;
}

.cms input {
  display: inline-block;
  position: relative;
  vertical-align: top;
}

.cms input[type="text"] {
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

.cms input[type="submit"], .cms input[type="button"] {
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

.cms input[type="submit"]:active, .bloom-filter input[type="button"]:active {
  background-color: #ffffff;
  background-image: -moz-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#e6e6e6), to(#ffffff));
  background-image: -webkit-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: -o-linear-gradient(bottom, #ffffff, #e6e6e6);
  background-image: linear-gradient(to top, #ffffff, #e6e6e6);
  background-repeat: repeat-x;
}

.cms input:last-child {
  border-radius: 0 4px 4px 0;
}
</style>

<script>
function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var CMSVisualization =
/*#__PURE__*/
function (_React$Component) {
  _inherits(CMSVisualization, _React$Component);

  function CMSVisualization(props) {
    var _this;

    _classCallCheck(this, CMSVisualization);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CMSVisualization).call(this, props));
    var matrix = [];

    for (var i = 0; i < props.d; i++) {
      matrix[i] = [];

      for (var j = 0; j < props.w; j++) {
        matrix[i].push(0);
      }
    }

    _this.state = {
      matrix: matrix,
      lastKey: null,
      lastCount: null
    };
    return _this;
  }

  _createClass(CMSVisualization, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: "cms"
      }, React.createElement("h3", null, "Live Demo: Count-Min Sketch (w = ", this.props.w, ", d = ", this.props.d, ")"), React.createElement("table", null, React.createElement("tbody", null, this.state.matrix.map(this.renderRow.bind(this)))), this.renderForm(), this.renderResult());
    }
  }, {
    key: "renderRow",
    value: function renderRow(row, i) {
      return React.createElement("tr", {
        key: "row" + i
      }, row.map(this.renderCell.bind(this)));
    }
  }, {
    key: "renderCell",
    value: function renderCell(cell, i) {
      var style = {};

      if (cell >= 1000) {
        style = {
          fontSize: "13px",
        };
      }

      if (cell >= 10000) {
        style = {
          fontSize: "12px",
        };
      }

      return React.createElement("td", {
        key: "cell" + i,
        style: style
      }, cell);
    }
  }, {
    key: "renderForm",
    value: function renderForm() {
      return React.createElement("form", {
        onSubmit: this.increment.bind(this)
      }, React.createElement("input", {
        type: "text",
        placeholder: "key",
        ref: "value"
      }), React.createElement("input", {
        type: "submit",
        value: "Increment",
        onClick: this.increment.bind(this)
      }), React.createElement("input", {
        type: "button",
        value: "Retrieve count",
        onClick: this.retrieve.bind(this)
      }));
    }
  }, {
    key: "renderResult",
    value: function renderResult() {
      if (!this.state.lastKey) {
        return React.createElement("div", null);
      } else {
        return React.createElement("div", null, "The retrieved count for key \"", React.createElement("i", null, this.state.lastKey), "\" was ", React.createElement("i", null, this.state.lastCount), ".");
      }
    }
  }, {
    key: "hash",
    value: function hash(value) {
      var seed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return Math.abs(CryptoJS.MD5(value + seed).words.reduce(function (a, b) {
        return a + b;
      }), 0) % this.props.w;
    }
  }, {
    key: "increment",
    value: function increment(e) {
      e.preventDefault();
      var input = this.refs.value;
      var value = input.value;
      input.select();
      if (value.trim() == "") return false;

      for (var i = 0; i < this.props.d; i++) {
        var j = this.hash(value, i);
        var matrix = this.state.matrix;
        matrix[i][j] += 1;
      }

      this.setState({
        matrix: matrix
      });
    }
  }, {
    key: "retrieve",
    value: function retrieve(e) {
      e.preventDefault();
      var input = this.refs.value;
      var value = input.value;
      input.select();
      if (value.trim() == "") return false;
      var cells = [];

      for (var i = 0; i < this.props.d; i++) {
        var j = this.hash(value, i);
        cells.push(this.state.matrix[i][j]);
      }

      this.setState({
        lastKey: value,
        lastCount: Math.min.apply(null, cells)
      });
    }
  }]);

  return CMSVisualization;
}(React.Component);

ReactDOM.render(React.createElement(CMSVisualization, {
  w: 16,
  d: 4
}), document.getElementById("cms"));
</script>
