# What is a Neural Network? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

When people say "neural network," what are they actually describing? Is it software? Hardware? Something that thinks?

It's a mathematical function. A very particular kind of function with adjustable parameters. The "neural" part is a historical reference to inspiration from biology, but modern neural networks are pure math.

What makes this math special?

The parameters are learned, not programmed. Instead of a human specifying how to transform inputs into outputs, the network discovers transformations through training.

How does learning work?

Start with a simple building block: the perceptron. It takes several input numbers, multiplies each by a weight, adds them up, and outputs the result. That's all it does.

Multiply and add? That seems too simple to be useful.

On its own, yes. But stack many perceptrons in layers, and connect layers so outputs of one become inputs to the next. Now you have a network that can represent much more complex transformations.

Why does stacking help?

Each layer can detect different patterns. The first layer might detect simple features. The next layer combines those features. Deeper layers combine combinations. By the time you reach the output, you've built up from simple to complex.

How does the network know what patterns to detect?

It doesn't start knowing. It starts random. Then training begins.

What is training?

Showing examples and adjusting weights. You present an input, see what output the network produces, compare to the correct output, and compute how wrong it was. That wrongness is called loss.

Then what?

You figure out how to adjust each weight to reduce the loss slightly. This calculation is gradient descent: finding which direction to nudge each weight so the error decreases.

With millions of weights, how do you know how to adjust each one?

Backpropagation. It's an algorithm that efficiently computes how each weight contributed to the error. Starting from the output, it traces blame backward through the network, calculating the appropriate adjustment for every weight.

So training is just: show example, compute error, adjust weights, repeat?

Millions or billions of times, yes. Each adjustment is tiny. But tiny adjustments accumulate. Over enough examples, the random starting weights become configurations that solve the task.

Is this how LLMs work?

LLMs are neural networks, yes. Very large ones, with specific architecture choices (transformers, attention). But the fundamental process is the same: layers of parameters, learned through gradient descent on a training objective.

Why do neural networks need to be so large?

More parameters means more capacity to represent complex patterns. A small network might learn simple rules. A large network can learn subtle distinctions across the full complexity of language.

But bigger isn't automatically better?

Right. A larger network has more capacity, but it needs sufficient training data to fill that capacity. It costs more to train and run. Without enough data, it might memorize rather than generalize.

What should someone take away?

That neural networks are math that learns. They start random and become structured through training. The "intelligence" isn't programmed; it emerges from the process of adjusting parameters to reduce prediction error.

The building blocks are simple. The scale and training process produce complexity. Understanding neural networks means understanding this combination: simple operations, repeated at massive scale, becoming something that looks like understanding.
