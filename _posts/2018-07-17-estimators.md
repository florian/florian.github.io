---
layout: post
title:  "Estimation Theory and Machine Learning"
date:   2018-07-17
description: "Formalizing what it means to compute good estimates"
categories: machine-learning, optimization
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

Often it is not possible or simply impractical to compute certain values exactly.
This might be because it is too expensive computationally or because not enough information is available.
Instead, these values can be estimated.
The quality of estimates varies.
In statistics, this concept is formalized in estimation theory {% include ref.html i=1 %} {% include ref.html i=2 %}.

The first part of this blog post introduces the fundamentals behind estimators.
In the second part, it is shown how they can be applied to machine learning in two different ways.
One of these applications is quantifying the quality of models.
Since models can generally not be perfect for complex problems, it is useful to try to describe how well they work.

Additionally, estimation theory is useful to understand different versions of gradient descent.
Typically, the gradient is only estimated using methods like mini-batch or stochastic gradient descent.
Here, estimation theory can be used to explain the ideas behind these techniques.

### Estimators and their properties

An *estimator* is a function that estimates a value based on other observations.
This process can involve randomness.
For example, because the function itself is random or because there is random noise in the observations it uses.

#### Bias

One measure for the quality of an estimator \\(\tilde{X}\\) is its *bias* or how far off its estimate is on average from the true value \\(X\\):

$$
	\operatorname{bias}({\tilde{X}}) = \mathbb{E}[\tilde{X}] - X
$$

where the expected value is over the randomness involved in \\(\tilde{X}\\).

If the bias of an estimator is \\(0\\), it is called an *unbiased estimator*.
This is generally a desirable property to have {% include ref.html i=3 %} because it means that the estimator is correct on average.
If one samples for long enough from the estimator, the average converges to the true value \\(X\\).
This is due to the [law of large numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers).

**Theorem**: If \\(k\\) estimators all produce unbiased estimates \\(\tilde{X}\_1, \dots, \tilde{X}\_k\\) of \\(X\\), then any weighted average of them is also an unbiased estimator.
The full estimate is given by

$$
\tilde{X} = w_1 * \tilde{X}_1 + \ldots + w_k * \tilde{X}_k
$$

where the sum of weights \\(\sum_{i = 1}^k w_i = 1\\) needs to be normalized.

**Proof**: The unbiasedness is due to the [linearity of expectation](https://en.wikipedia.org/wiki/Expected_value#Linearity):

$$
\begin{align*}
	\mathbb{E}[\tilde{X}] & = \mathbb{E}[w_1 * \tilde{X}_1 + \ldots + w_k * \tilde{X}_k] \\
	              & = w_1 * \mathbb{E}[\tilde{X}_1] + \ldots + w_k * \mathbb{E}[\tilde{X}_k] \\
	              & = w_1 * X + \ldots + w_k * X \\
	              & = X
\end{align*}
$$

This theorem about unbiased estimators is going to prove to be useful later on.

#### Variance

However, even if we have an unbiased estimator, its individual estimates can still be far off from the true value.
To quantify how consistently an estimator is close to the true value, another statistic is required.
Commonly, the *variance* of the estimator is considered here:

$$
	\operatorname{Var}[\tilde{X}] = \mathbb{E}[(\tilde{X} - X)^2]
$$

It is defined as the mean squared distance between the estimate and the value to be estimated.

### Bias-variance tradeoff

Many different things can be analyzed using estimators.
For example, statistical models can be seen as estimators.
They use observations, or data, to make predictions.
These predictions are generally not perfect because randomness is involved and only a limited amount of information is available.
Thus, it makes sense to analyze statistical models in terms of bias and variance.

A central problem when building models is balancing underfitting and overfitting.
If the training data is just memorized, the model does not generalize well to new data.
This is a case of overfitting.
The opposite issue, only barely matching the pattern in the training data, is called underfitting.

This problem is also known as the [*bias-variance tradeoff*](https://en.wikipedia.org/wiki/Bias–variance_tradeoff) {% include ref.html i=4 %} {% include ref.html i=5 %}.
If the model has a high bias, its predictions are off, which corresponds to underfitting.
If overfitting occurred, i.e. the data is matched too well, the estimates have a high variance.
By resampling the data that the model was built on, totally different estimates are generated.
This is because the model is now based on different random noise.

Generally, it is not possible to perfectly optimize both, bias and variance, so they need to be balanced here.
In other words, we accept a certain bias of the model to keep its variance low.
A good tradeoff between the two needs to be achieved.

### Gradient descent

In supervised machine learning, we compare our model's predictions to the true labels.
This is done using a loss function.
If a set of data points \\(x_1, \dots, x_n\\) and labels \\(y_1, \dots\, y_n\\) is given, then the full loss is defined by

$$
L = \frac{1}{n} \sum\limits_{i = 1}^n \operatorname{loss}(f(x_i), y_i)
$$

where \\(\operatorname{loss}\\) is a function that compares a prediction \\(p\\) to the correct answer \\(y\\).
One choice for the loss function might be the quadratic error:

$$
\operatorname{loss}(p, y) = (p - y)^2
$$

[Gradient descent](https://en.wikipedia.org/wiki/Gradient_descent) optimizes the parameters used in \\(f\\) by computing the gradient of the loss with respect to these parameters.
This gradient is then used to continually improve the parameters step by step.

#### Full-batch gradient descent

To compute the gradient \\(\nabla L\\) of the loss, we can make use of the [linearity of the gradient operator](https://en.wikipedia.org/wiki/Gradient#Linearity):

$$
\begin{align*}
	\nabla L & = \nabla \frac1n \sum\limits_{i = 1}^n \operatorname{loss}(f(x_i), y_i) \\
	         & = \frac1n \sum\limits_{i = 1}^n \nabla \operatorname{loss}(f(x_i), y_i)
\end{align*}
$$

The method that uses the gradient given above is sometimes referred to as *full-batch gradient descent* because it fully uses the available training data in each iteration.
In many cases, \\(n\\) is a very large value and computing the full update \\(\nabla L\\) is expensive.
Since computing the gradient is by far the most expensive part of gradient descent, it makes sense to try to make this more efficient.

Computing the gradient as shown above is especially inefficient if there is duplicated training data.
If the training set consists of 10 copies of a different dataset, then the evaluation of the formula above is unnecessarily expensive.
Every required calculation is repeated 10 times.
While this is an extreme example, it does happen in practice that much of the training data is similar.
To save time, it often makes sense to only use a part of the data to estimate the gradient.

#### Stochastic gradient descent

In *stochastic gradient descent* (*SGD*), a single data point \\(x\\) and label \\(y\\) are sampled uniformly from the training set.
The true gradient \\(\nabla L\\) is then estimated using only this data point and label:

$$
	\nabla \tilde{L} = \nabla \operatorname{loss}(f(x), y)
$$

It is easy to see that \\(\nabla \tilde{L}\\) is an unbiased estimator of \\(\nabla L\\):

$$
\begin{align*}
	\mathbb{E}[\nabla \tilde{L}] & = \sum\limits_{i = 1}^n \frac{1}{n} \nabla \operatorname{loss}(f(x_i), y_i)  \\
	                     & = \frac1n \nabla \sum\limits_{i = 1}^n \operatorname{loss}(f(x_i), y_i) \\
	                     & = \nabla L
\end{align*}
$$

The computations for SGD can be performed very quickly but still give us an unbiased estimate of the true gradient.
This property is the reason why optima can be found using this algorithm.
While individual estimates are off, the randomness averages out over iterations and the parameters still move in a sensible direction overall.
Since iterations are much cheaper, many more of them can be performed and this is a major improvement to computing the full gradient.

#### Mini-batch gradient descent

These individual SGD estimates can have a large variance however, leading to noisy and jumpy updates.
A further improvement over this method is *mini-batch gradient descent*.
Instead of just sampling one data point, we sample a small batch of \\(k\\) examples.
The estimated gradient is an average of all \\(k\\) single estimates.

Each of these individual estimators is unbiased since SGD itself is unbiased.
As shown in the theorem earlier, a weighted combination of them still remains an unbiased estimator.
Thus, mini-batch gradient descent is also an unbiased way of computing gradient estimates.

Mini-batch gradient descent does have much less variance, however, because more data is used to compute the estimate.
This makes the optimization process more stable compared to using SGD.

Most gradient computations can be formulated using linear algebra operations.
These calculations can be parallelized very well on GPUs {% include ref.html i=6 %}.
So with appropriate hardware there is no significant performance penalty for using \\(1 < k \ll n\\) data points to compute the estimate.
Thus mini-batch gradient descent is typically not much slower than SGD but leads to a more stable optimization process.

### Conclusion

Estimators provide an elegant way of analyzing the quality of estimates.
In machine learning, estimates play an important role because data contains a lot of random noise and because it is often more practical to only estimate values.
The quality of statistical models can be described in terms of bias and variance.
Too much bias corresponds to underfitting, while too much variance is equivalent to overfitting.
The training process needs to find a tradeoff between these two.

To compute the gradient for the optimization process, it is expensive to use all data points.
By randomly sampling them, we can compute unbiased estimates in a much faster way.
If this is done using a large enough sample, the variance of these estimates does not have to be large.
By properly choosing the sample size, the optimization process can thus be speeded up significantly.

{% capture references %}
	{% include cite.html i=1 acm="Diez, D.M., Barr, C.D. and Cetinkaya-Rundel, M., 2012. OpenIntro statistics (Vol. 12). CreateSpace." %}
	{% include cite.html i=2 acm="Härdle, W. and Simar, L., 2007. Applied multivariate statistical analysis (Vol. 22007, pp. 1051-8215). Berlin: Springer. Vancouver" %}
	{% include cite.html i=3 acm="Voinov, V.G. and Nikulin, M.S., 2012. Unbiased Estimators and Their Applications: Volume 1: Univariate Case (Vol. 263). Springer Science & Business Media." %}
	{% include cite.html i=4 acm="Raul Rojas. The bias-variance dilemma. Freie University, Berlin, Tech. Rep, 2015." %}
	{% include cite.html i=5 acm="Friedman, J., Hastie, T. and Tibshirani, R., 2001. The elements of statistical learning (Vol. 1, No. 10). New York, NY, USA:: Springer series in statistics." %}
	{% include cite.html i=6 acm="Navarro, C.A., Hitschfeld-Kahler, N. and Mateu, L., 2014. A survey on parallel computing and its applications in data-parallel problems using GPU architectures. Communications in Computational Physics, 15(2), pp.285-329." %}
{% endcapture %}
{% include references-list.html content=references %}
