---
layout: post
title:  "TensorFlow"
date:   2018-09-01 14:00:00
description: "A bottom-up guide to computational graphs and tensors"
categories: machine-learning
---

After I started working at Google this year, I had to learn how to use TensorFlow.
This turned out to be a lot of fun and I ended up liking it much more than I had anticipated.
While there are already a lot of TensorFlow tutorials on the web, I decided to write my own version since explaining things generally helps me to understand them more clearly.

It is worth noting that this blog post introduces TensorFlow in a bottom-up manner.
I first go through the fundamental concepts, such as tensors and computational graphs, and only afterwards shows how everything can be connected in code.

### Motivation

There are several problems with writing machine learning (ML) algorithms from scratch.
Since most of ML is based on gradient descent, knowing the gradients is required to make the optimization process work.
Computing derivatives from hand and then hardcoding them is error-prone and costs a lot of time.
This slows down research and makes it difficult to experiment with new ideas.

A second problem stems from the fact that ML is used in a lot of different environments.
Since ML is extremely computationally expensive, the computing power of clusters is required when training large models on a lot of data.
Still, for development and prototyping, we would like to work on our personal machines.
Finally, when deploying the model for inference, it needs to be used in an even different environment, e.g. on a mobile phone.
We would really like to easily re-use code for all these environments, without, for example, losing out on the computational power of the cluster.

Libraries like Tensorflow aim to solve all these problems.
By first constructing a *computational graph* that symbolically describes what we want to compute, gradients can be computed automatically.
This graph can then be executed in different environments.
TensorFlow takes care of properly distributing the computation among compute nodes on a cluster.
It also makes inference on mobile phones or in a web browser more efficient, by properly using possible GPU accelerations and other available hardware advantages.

### Tensors

Tensors are *n*-dimensional arrays that represent all data in TensorFlow.
Similarly to how we can go from scalars to vectors, and from vectors to matrices, we can create differently structured data by adding more dimensions.
This, for example, allows us to represent RGB images.
If there are three channels (red, green, blue) and the image has a width of `w` and a height of `h`, then we want to store the image as a `w × h × 3` tensor.
It is similar to a `w × h` matrix, except that each pixel has three values associated with it.

Conceptually, tensors are nearly equivalent to NumPy's `np.array` function.
This is really just a helper function for creating `np.ndarray`s, which are *n*-dimensional arrays.
Even though the term tensor is not as used much in NumPy documents, NumPy users will already be familiar with the idea of tensors.

To understand the terminology used around tensors in ML, it is useful to know the following two terms:
- The *shape* of a tensor is an array detailing the number of values in each dimension. In the case of the image described above, the shape would be `[w, h, 3]`
- The *rank* of a tensor is the number of dimensions it has. RGB images are typically encoded as rank-3 tensors

Finally, it is worth noting that there is a whole subfield of [linear algebra around tensors](https://en.wikipedia.org/wiki/Tensor).
When friends from fields like physics ask me about tensors, they usually wonder if ML is based on some of these ideas.
However, ML uses virtually none of that theory.
We mostly just borrow the term tensor to describe *n*-dimensional arrays.

### Computational Graphs

All computations in TensorFlow are represented using graphs.
Nodes in those graphs correspond to elementary functions, referred to as *operations*.
Data in the form of tensors flows along the edges, thus giving birth to the name *TensorFlow*.

Using TensorFlow is generally a two-step process:
1. Construct a graph that represents a function we want to compute
2. Execute the graph in a given environment

The TensorFlow library has implemented most low-level functions one might want to use.
This naturally includes common linear algebra functions, like matrix multiplication.
Python operators like `+` or `*` are overloaded to use internal TensorFlow operations if necessary.
This means if you have two tensors `a` and `b`, calling `a + b` or `a * 3` will automatically use the appropriate TensorFlow operations `tf.add` and `tf.multiply`.
The TensorFlow library is usually imported as `tf` in Python.

Operations can have zero or more inputs and zero or more outputs.
Beside standard operations, such as the ones mentioned above, there are three special kinds of nodes that are described in the following.
They all hold data, take zero inputs and just output the data they currently contain.

#### Constants

*Constants* are trivial operations that take no inputs and always output the same value.
This value has to be known during graph construction time and is hardcoded into the graph.
After importing TensorFlow as `tf`, we can create new constants using `tf.constant` by passing in the value the node should hold.

```
import tensorflow as tf

a = tf.constant(2)
b = tf.constant(3)
```

We can then use these nodes for arbitrary operations:

```
c = a + b
d = a * 3
```

In the last line, TensorFlow implicitly creates a constant node, holding the value `3`.

#### Placeholders

*Placeholders* are similar to constants in the sense that they always have a constant value during the execution of a graph.
However, the value is only determined before the graph is executed.
It does not have to be known when the graph is constructed.
If we think of our graph as one huge function that we are computing, then placeholders represent the inputs to that function, while constants are just values used inside of it.

In ML, we typically represent our feature tensor `X` and the label vector `y` as placeholders in the graph.
Values for them are only passed in when the training starts, i.e. the graph is executed.

To create a placeholder, we use `tf.placeholder` and pass in the type of data that it will hold.
Optionally, the shape of the data can be fixed as well.

```
X = tf.placeholder(tf.float32)
y = tf.placeholder(tf.float32, shape=[128, 10])
```

#### Variables

Finally, *variables* represent values that can change during the execution of the graph.
This is typically because we want to optimize them.
Thus, all weights are typically represented using variables.

This in contrast to our input data.
We typically do not want to optimize the inputs to the model, so they are just represented using placeholders.
If placeholders are the input to our function, or model, then variables are parameters of the function that we want to choose as well as possible.

To create a new variable, we use `tf.Variable` and pass in a default value.
This could be any NumPy array, but in this case we directly create a random tensor of shape `[128, 50]`:

```
W = tf.Variable(tf.random_uniform([128, 50], -1, 1))
```

It is worth noting that variables maintain state during separate executions of the graph.
We describe the graph in a declarative style but it actually is stateful.
This makes sense for ML: We iteratively want to improve our weights, variables in this case, step by step.

### Executing a Graph

#### Sessions

- After having constructed the graph, we want to execute it
- TensorFlow's other major abstraction, a *session*, comes into play here
- A session represents an environment in which we can run computational graphs
- This might be a cluster of GPUs or just our local development environment
- By adding this abstraction, we do not have to worry about how it is executed
- Sessions are created using `tf.Session`. We can then run the graph and get the resulting values of the nodes we are interested in
- Placeholders values are passed in when the graph is executed, by passing a `feed_dict` argument to sess.run

#### Putting it all together

The following is a minimal example.
We create a computational graph representing the function f(x) = 3 * x + 5 and then evaluate f(4)

```
x = tf.placeholder(tf.float32)
a = tf.constant(3)
b = tf.constant(5)
output = a * x + b

sess = tf.Session()
sess.run(output, feed_dict={ x: 4 }) # f(4) = 3 * 4 + 5 = 17
```

### Optimization

#### Optimizers

#### Simple example

### Matrix Factorization

### Linear Regression

### Common Mistakes

#### Printing

#### Global Graph

### PyTorch

Even though a good number of concepts transfer well from PyTorch, which I had used before, there are some major differences.
Learning about this turned out to be a lot of fun and also made me understand some design decisions of PyTorch better.

### Further Resources

[Papers](https://www.tensorflow.org/about/bib)

{% include ref.html i=1 %} {% include ref.html i=2 %}

Reading notes

{% capture refs %}
	{% include cite.html i=1 acm="Abadi, Martín, et al. \"TensorFlow: Large-scale machine learning on heterogeneous distributed systems.\" Preliminary White Paper 2015" pdf="https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/45166.pdf" %}
	{% include cite.html i=2 acm="Abadi, Martín, et al. \"TensorFlow: a system for large-scale machine learning.\" OSDI. Vol. 16. 2016." pdf="https://www.usenix.org/system/files/conference/osdi16/osdi16-abadi.pdf" %}
{% endcapture refs %}
{% include references-list.html content=refs %}
