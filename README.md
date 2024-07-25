# Galton Board Simulator

This project simulates a [Galton Board](https://en.wikipedia.org/wiki/Galton_board "Galton Board"). It is meant for educational purposes.

## Description Of The Simulator

The simulator shows the falling of balls inside a Galton board. You can change the number $n$ of peg-rows inside the board between 1 and 10. You may also change the number of balls falling down and the simulation speed.

A ball hitting a peg can either fall to the right or the left hand side. For an ordinary Galton Board the probability $p$ for falling to the right or left is 50%. If you tilt the board to one or the other side this probability changes. Within the simulator this probability can be set.

## The Math Behind It

The falling of a ball can be described as a [**Bernoulli process**](https://en.wikipedia.org/wiki/Bernoulli_process "Bernoulli process") (or: Bernoulli chain). A Bernoulli process is a series of $n\in\mathbb N$ [**Bernoulli trials**](https://en.wikipedia.org/wiki/Bernoulli_trial "Bernoulli trial") where the corresponding Bernoulli random variables $X_i$ are independently and identically distributed with parameter $p\in[0,1]$. In the context of the Galton board $X_i$ describes if the ball in the $i$-th row falls left or right, where one may encode left as 0 and right as 1. The sum of the $X_i$'s is a new random variable $X=\sum_{i=1}^n X_i$ which describes how often one ball fell to right side. $X$ has binomial distribution and the probability mass function is given by \[\mathbb P(X=k)=\binom nk \cdot p^k\cdot(1-p)^{n-k}\cdot\mathbbm1_{\{0,1,\ldots,n\}(k)}.\]
