---
layout: post
title:  "Decision Trees – ID3"
description: "A simple decision tree algorithm"
categories: machine-learning
---

Decision trees are a popular method in supervised Machine Learning. For this project phase, we decided to explore them in more detail and to apply them to some interesting datasets. Primarily, our motivation behind this was that decision trees are very interpretable. Part of the project is analyzing datasets, and we concluded that choosing an interpretable method would be quite helpful for doing that.

Before diving into the dataset analysis, this section introduces the foundational ideas behind decision trees. Section 2 quickly deals with our decision tree visualizations. After having under- stood how to use decision trees, the more important question of how to build them is discussed in the next section, by looking at two popular algorithms. Section 4 deals with a popular heuristic for choosing the features that are used to make decisions. The section afterwards explains how ensemble methods can be used to combat overfitting. Finally, two datasets are analyzed using decision trees.
A toy decision tree using weather features can be found in Figure 1. Decision trees consist of two types of nodes: First of all, internal nodes (i.e. nodes that are not leafs) make decisions based on features. Depending on the outcome of the decision, a different child node is visited next. At the bottom of the tree, there are leafs: They make very simple predictions, e.g. by just constantly predicting the same answer, or by using a linear classifier. In the visualization, internal nodes are displayed using ellipses, leafs using rectangles. To make a prediction, a path down the decision tree is traversed until a leaf is reached. The leaf node is then asked to make the final prediction.

In the example in Figure 1, different weather conditions are evaluated in the internal nodes, until, finally, a decision is made in the leaf on whether to go outside or stay inside.

Another way to think about this is that decision trees repeatedly split the input space, until the individual partitions allow for simple predictions. In computer science, this is known as a divide and conquer strategy. By making several subsequent decisions based on each other, nonlinear decision boundaries can easily be created.

There are many other useful traits of decision trees. For example, users have to perform very little data preprocessing. Feature values do not need to be normalized at all, and some decision
tree algorithms can even deal with missing values by themselves. Decision trees can also handle multi-class datasets without any changes.

As mentioned earlier, decision trees allow for easy interpretation. In contrast to other Machine Learning methods like neural networks, it is very clear why a prediction was made. For many applications, for example in the medical world, this interpretability is very important and a great advantage of decision trees.

By now it should be obvious that decision trees describe their training data very clearly. How- ever, this also leads to the great disadvantage that decision trees overfit easily. In many cases, they learn to describe the training data exactly, and their predictions do not generalize well to unseen data. Several sections of this report deal with methods that aim to reduce this problem.
Finally, it is worth noting that we focus on classification in this report. Nevertheless, decision trees can also be used for regression, e.g. by using linear regression models in the leafs.

### ID3

ID3 (Iterative Dichotomiser 3) [1, 2] is a straight-forward approach to building decision trees. We decided to start with this algorithm because it allows for a gentle introduction to the fundamental ideas behind building decision trees. The fact that it is quite simple also means that it has some serious drawbacks, and generally should not be used in production. We will explain these shortcomings and address the most important ones in later sections of the report.
Generally, ID3 uses the ideas introduced in the previous section. As described there, we distin- guish between two types of nodes. Internal nodes make the decision which child node to visit next, and leafs perform constant predictions. To build a decision tree using ID3, a recursive strategy is followed: The training data is repeatedly split until a new node gets training data that is suitable for making a constant prediction.
In the following, both types of nodes are discussed in more detail, starting with internal nodes.

### Internal nodes: Making decisions
In ID3, the input data is always split based on a single feature. For each possible value of that feature a new child node is created. In other words, if a split is made on a feature that allows k different values, then the node will have exactly k child nodes. The child nodes then build their own subtrees using the subset of training data from the parent node that has the respective value in the selected feature.

Here the first serious drawback of ID3 becomes apparent: Splitting on all possible values only works well for features with a handful of different values. For a continuous variable like age this approach would work terribly. In our opinion, this is also the major shortcoming of ID3. In Section 3.2, we will see an algorithm that deals with continuous features in a smarter way.

### Leafs: Stopping the recursion
At some point, the recursion has to end, which means a node does not grow its own subtree but is turned into a leaf. The leaf then constantly predicts the same answer. Which answer to predict is based on the training data it received.

There are various reasons why a node might be turned into a leaf. The simplest one is that all data points it received have the same label. In this case, there is no reason to split the data further, and the node can be turned into a leaf which predicts this label. A similar case is that the training data does not allow for any further splits, e.g. because all data points are equal to each other but have different labels. In this case, the most common label is predicted.

Another case is that there is just no training data available. We always create a new node for each possible value of a feature. If we are deep in the tree and split on a feature that can have many different values, there might be no more training data for some values. If this happens, the most common label of the parent node is predicted.
There are other cases where we might want to stop the recursion. We will come back to these in Section 3.1.4.

### Selecting the feature to split on
Of course, now the major remaining question is how find the best feature to split on. ID3 follows a greedy strategy for this. For each feature, it evaluates how well the classes would be divided in the next step if a split based on this feature would be performed. Then, the feature where this worked best is chosen. Of course, this greedy strategy could mean that a very good combination of subsequent splits is missed, because we were too greedy in the beginning.

To find the feature which produces the best division in the next step, different heuristics can be used. The easiest one is misclassification: We just assume that the next node will predict the most common label, and calculate how accurate it would be by doing this. Then, the feature with the lowest misclassification rate is chosen.

A more popular heuristic, that is also used in ID3, is entropy with information gain. In a nutshell, entropy measures uncertainty, i.e. it wants nodes to receive data points that mostly have the same label so that a prediction can be made with a lot of certainty. Because entropy and information gain are not only used in ID3, but also in C4.5, a more thorough description of them is given in Section 4.

Another important idea to mention is that in ID3, each feature should only be used once for splitting. Because we split based on all possible values, the data of each child only has one distinct value for each feature that was already split on. Hence, it does not make sense to split on these features again.

### Limiting the tree depth
Overfitting is a huge problem when using decision trees. It can happen very easily that the training data is described perfectly. However, this description might contain so much random noise that predictions do not generalize well to previously unseen data points.
In most Machine Learning algorithms, a very common way to combat overfitting is regulariza- tion: By adding additional constraints, the model is forced to be simpler. A simpler model means there is less capacity for remembering information from the training data, which has the effect that only the most important information is represented in the model.

For decision trees, the primary way of adding regularization is to limit the depth of the tree. Because we split on each feature exactly once, limiting the tree depth in ID3 is equivalent to limiting the maximum number of features that should be used for one prediction. If only a small tree depth is allowed, it means that only the most important features are considered. When the maximum depth is reached, leafs are created that predict the most common label of the data they got.

Of course, the optimal tree depth highly depends on the dataset being used. Because of this, tree depth is a hyperparameter that needs be optimized using a method like grid search.
Another way to limit the tree depth is to only perform a split if it helps to divide the classes much better. The intuition behind this is that other splits tend to introduce more model complexity without directly improving the predictive power of the model.

However, these other splits are sometimes necessary to get a good division in the next split afterwards. One extreme example for this, which we found when testing our implementation, is the xor dataset, see Table 1. We have two features, a and b, that take the values of 0 and 1. The label is computed using the xor function. Ideally, our decision tree should look like the one in Figure 3.
By looking at this decision tree, it becomes apparent that the first split does not directly help to separate the classes. The root node had an equal number of data points from both classes, as do its children. By only looking at these three nodes, one might think that the split should not have been performed. However, by doing this split we can perfectly divide the classes in the next step, reaching an accuracy of 100%, instead of just 50%. To conclude, because of the greedy strategy, we cannot directly know whether a split should be performed or not.
