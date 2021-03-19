---
layout: post
title:  "TensorFlow"
date:   2018-11-20 14:00:00
description: "A bottom-up guide to computational graphs and tensors"
categories: machine-learning
---

*Note: TensorFlow has changed quite a lot since this post was originally written in 2018. The fundamental concepts in this post still mostly transfer to TF2. The APIs, such as placeholders or sessions, do not. For the code below to work in TF2, you would have to import the `tf.compat.v1` module.*

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
Similarly to how we can go from scalars to vectors and from vectors to matrices, we can create differently structured data by adding more dimensions.
This, for example, allows us to represent RGB images.
If there are three channels (red, green, blue) and the image has a width of `w` and a height of `h`, then we want to store the image as a `w × h × 3` tensor.
This is similar to a `w × h` matrix, except that each pixel has three values associated with it.

Conceptually, tensors are nearly equivalent to NumPy's `np.array` function.
This is really just a helper function for creating `np.ndarray`s, which are *n*-dimensional arrays.
Even though the term tensor is not used as much in NumPy docs, NumPy users will already be familiar with the idea of tensors.

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

The core TensorFlow library has implemented most low-level functions one might want to use.
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

```python
import tensorflow as tf

a = tf.constant(2)
b = tf.constant(3)
```

We can then use these nodes for arbitrary operations:

```python
c = a + b
d = a * 3
```

In the last line, TensorFlow implicitly creates a constant node, holding the value `3`.

#### Placeholders

*Placeholders* are similar to constants in the sense that they always have a constant value during the execution of a graph.
However, the value is only determined just before the graph is executed.
It does not have to be known when the graph is constructed.
If we think of our graph as one huge function that we are computing, then placeholders represent the inputs to that function, while constants are just values encapsulated inside the function.

In ML, we typically represent our training data, e.g. a feature tensor `X` and a label vector `y`, using placeholders.
Values for them are only passed in when the training starts, i.e. when the graph is executed.

To create a placeholder, we use `tf.placeholder` and declare the type of data that it will hold.
Optionally, the shape of the data can be fixed as well.

```python
X = tf.placeholder(tf.float32)
y = tf.placeholder(tf.float32, shape=[128, 10])
```

#### Variables

Finally, *variables* represent values that can change during the execution of the graph.
This is typically because we want to optimize them.
Thus, all weights are generally represented using variables.

This in contrast to our input data.
We typically do not want to optimize the inputs to the model, so they are just represented using placeholders.
If placeholders are the input to our function, or model, then variables are parameters of the function that we want to select as well as possible.

To create a new variable, we use `tf.Variable` and pass in a default value.
This could be any NumPy array, but in this case we directly create a random tensor of shape `[128, 50]`:

```python
W = tf.Variable(tf.random_uniform([128, 50], -1, 1))
```

It is worth noting that variables maintain state during separate executions of the graph.
We describe the graph in a declarative style but it contains state, in the form of variables.
This makes sense for ML: We iteratively want to improve our weights, variables here, step by step.

### Sessions

Once the graph is fully constructed, we want to execute it.
This is where TensorFlow's other major abstraction, a *session*, comes into play.
A session represents an execution environment in which we can evaluate nodes of computational graphs.
This might be a cluster of GPUs or just our local development environment.

This abstraction is crucial to TensorFlow:
By describing what we want to compute using a declarative style, in the form of a computational graph, TensorFlow is able to do the work of figuring out how to perform the computation in an efficient way in various environments.
For example, in the case of matrix multiplication, it can make use of special instructions on GPUs or at least use efficiently implemented system libraries for CPUs.

Sessions are created using the `tf.Session` constructor.
We can then evaluate individual nodes:

```python
a = tf.constant(3)
b = a * 2

sess = tf.Session()
sess.run(b) # => 6
```

TensorFlow evaluates the graph in a lazy way.
If we add additional nodes to the computational graph above, calling `sess.run(b)` would only evaluate the nodes that are required the compute the value of `b`.
To do this, TensorFlow searches through the graph backwards from `b` on and finds all required nodes.

If our graph contains placeholders, we need to pass in their values using the `feed_dict` argument of `sess.run`.
We can also fetch the value of several nodes using a single graph evaluation:

```python
x = tf.placeholder(tf.float32)
g = x * 5
h = x * 6

sess = tf.Session()
sess.run([g, h], feed_dict={ x: 2. }) # => [10., 12.]
```

When using variables, we need to initialize them before they are first used.
A simple way of doing this is using the `tf.global_variables_initializer`:

```python
x = tf.Variable(3.)
loss = tf.abs(2 + x)

sess = tf.Session()
sess.run(tf.global_variables_initializer())
sess.run(loss) # => 5.
```

### Optimization

At this point we are able to perform arbitrary computations using TensorFlow, and can automatically distribute them on clusters.
The missing component for ML is optimization: To be able to do any sort of training, we need to optimize for our weights.
This is where the automatic differentiation and the `tf.train` library come in.

Optimization is just another operation in a computational graph, albeit a fairly complex one.
It is parameterized by the node whose value we want to optimize.
When the resulting optimization operation is called, it automatically computes required gradients and uses them to update all variables.

A simple example is the vanilla `tf.train.GradientDescentOptimizer`.
We need to provide the learning rate using the first argument and define what we want to optimize for:

```python
x = tf.Variable(3.)
loss = tf.abs(2 + x)

opt = tf.train.GradientDescentOptimizer(0.5).minimize(loss)

sess = tf.Session()
sess.run(tf.global_variables_initializer())
sess.run([loss, opt, x]) # => [5., None, 2.5]
```

In the above example, we called the `opt` operation to optimize our variable `x`.
While this operation has no return value, it changed the value of the variable as a side effect.
This effectively corresponds to one step of gradient descent.
To fully minimize the loss, we need to take more than one step:

```python
x = tf.Variable(3.)
loss = tf.abs(2 + x)

opt = tf.train.GradientDescentOptimizer(1.).minimize(loss)

sess = tf.Session()
sess.run(tf.global_variables_initializer())

for _ in range(7):
  print(sess.run([loss, opt, x]))
```

This is a standard pattern in TensorFlow code: We iteratively optimize our weights by calling `sess.run` several times.
The resulting output shows that we reached the optimal value for `x` after five iterations:

```python
[5.0, None, 2.0]
[4.0, None, 1.0]
[3.0, None, 0.0]
[2.0, None, -1.0]
[1.0, None, -2.0]
[0.0, None, -2.0]
[0.0, None, -2.0]
```

The `tf.train` library contains many [other popular optimization algorithms](https://www.tensorflow.org/api_docs/python/tf/compat/v1/train).

### Example: Matrix Factorization

The code above is the minimal example for optimization in TensorFlow.
Another easy, but a bit more interesting one, is matrix factorization.
Given a matrix `C`, we want to find two matrices `A` and `B` with `A * B = C`.
The common dimension of `A` and `B` is a hyperparameter, called `dims` below.

One way of finding an approximate solution for the factorization task is gradient descent.
TensorFlow makes this fairly easy:

```python
def factorize(C_val, dims):
  # Two variables with a common dimension `dim`. When these are
  # multiplied, they produce a matrix of C's shape.
  A = tf.Variable(tf.random_uniform([C_val.shape[0], dims], -1, 1))
  B = tf.Variable(tf.random_uniform([dims, C_val.shape[1]], -1, 1))

  C = tf.constant(C_val)
  C_hat = tf.matmul(A, B)

  loss = tf.losses.mean_squared_error(C, C_hat)
  opt = tf.train.GradientDescentOptimizer(5.).minimize(loss)

  sess = tf.Session()
  sess.run(tf.global_variables_initializer())

  A_val, B_val = None, None

  for _ in range(100):
    A_val, B_val, loss_val, _ = sess.run([A, B, loss, opt])

  return A_val, B_val

factorize(np.random.uniform(size=(10, 10)), dims=5)
```

The result is pretty cool.
We can now factorize arbitrary matrices.
When checking the loss, we can see that it works fairly well for most random matrices.

### Conclusion

To develop in TensorFlow, you describe graphs of computations in a declarative manner.
TensorFlow can then automatically compute gradients for these graphs, allowing you to easily optimize any given variable.
It can also execute and distribute your computations on many different platforms.
All of these things enable ML development at scale.

### Further Resources

The TensorFlow team published two [papers](https://www.tensorflow.org/about/bib), both of which are very readable.
There's some overlap between these but I found both to be worth reading:
- The first paper {% include ref.html i=1 %} has more details about TensorFlow's programming model
- The second one {% include ref.html i=2 %} gives some historical context and describes more advanced features

I also wrote [reading notes](https://github.com/florian/reading-notes/#papers) for both papers.

{% capture refs %}
	{% include cite.html i=1 acm="Abadi, Martín, et al. \"TensorFlow: Large-scale machine learning on heterogeneous distributed systems.\" Preliminary White Paper 2015" pdf="https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/45166.pdf" notes="papers/007_TensorFlow_Large-Scale_Machine_Learning_on_Heterogeneous_Distributed_Systems.md" %}
	{% include cite.html i=2 acm="Abadi, Martín, et al. \"TensorFlow: a system for large-scale machine learning.\" OSDI. Vol. 16. 2016." pdf="https://www.usenix.org/system/files/conference/osdi16/osdi16-abadi.pdf" notes="papers/006_TensorFlow_A_system_for_large-scale_machine_learning.md" %}
{% endcapture refs %}
{% include references-list.html content=refs %}
