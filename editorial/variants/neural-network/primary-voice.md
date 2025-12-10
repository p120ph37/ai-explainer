# What is a Neural Network? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**What's actually inside an AI model?**

At its core, a neural network is a mathematical function built from simple, repeated building blocks. Each block takes some numbers in, does basic math, and passes numbers out. Stack thousands of these blocks in careful arrangements, and something remarkable happens: the system can learn.

The "neural" part comes from a loose analogy to brain neurons. But don't take it too literally. These are mathematical operations, not biological cells.

**The simplest case: the perceptron**

To understand neural networks, start with the simplest one: a single unit called a **perceptron**.

A perceptron takes multiple inputs (numbers), multiplies each by a **weight** (another number), adds them up, and outputs a result. That's it. Multiply, add, output.

```
inputs:  [x₁, x₂, x₃]
weights: [w₁, w₂, w₃]
output:  w₁·x₁ + w₂·x₂ + w₃·x₃ + bias
```

The magic is in the weights. By adjusting them, the perceptron can learn to make different decisions. High weight on an input means "pay attention to this." Low or negative weight means "ignore or invert this."

**From one to many: layers**

A single perceptron can only learn simple patterns. But stack them into **layers**, where outputs of one layer become inputs to the next, and the network can learn complex patterns.

- **Input layer**: Your raw data (pixels, tokens, numbers)
- **Hidden layers**: Middle layers that transform and combine features
- **Output layer**: The final answer

Each layer extracts more abstract features. In an image network, early layers might detect edges, middle layers might detect shapes, later layers might detect faces. Nobody programs these features; they emerge from training.

**What makes them learn?**

A neural network starts with random weights. Its predictions are terrible. Then training begins:

1. Show the network an example
2. Compare its output to the correct answer
3. Calculate how wrong it was (the "loss")
4. Adjust the weights slightly to be less wrong
5. Repeat millions of times

This process is called **gradient descent**. "Gradient" refers to the mathematical slope that tells you which direction to adjust each weight. "Descent" because you're descending toward lower error.

**Backpropagation: tracing the blame**

With millions of weights, how do you know which ones to adjust?

**Backpropagation** solves this. It efficiently calculates how much each weight contributed to the error. Starting from the output, it propagates blame backward through the network, computing how to adjust each layer.

The math involves calculus (chain rule), but the intuition is simple: trace the blame backward. If the output was wrong, which weights made it wrong? And which weights before that?

**How big are these networks?**

Size varies enormously:

- A perceptron: 10-100 weights
- A simple classifier: millions of weights
- GPT-3: 175 billion weights
- Frontier models: 1-2+ trillion weights

Each weight is a number, typically stored as 16 or 32 bits. GPT-3's weights alone take about 350 gigabytes. Running the network requires loading these weights and performing matrix multiplications across them.

**Why does this work at all?**

Neural networks exploit a mathematical property: sufficiently large networks can approximate any function. This is the "universal approximation theorem." Give a network enough capacity and it can, in principle, learn any input-output mapping.

But "can in principle" doesn't mean "will in practice." The genius is in architectures (how you arrange the layers), training procedures (how you adjust weights), and data (what examples you show). These determine whether a network actually learns something useful.

Neural networks are not magic. They're math. But math that, stacked deep enough and trained on enough data, produces capabilities that continually surprise us.
