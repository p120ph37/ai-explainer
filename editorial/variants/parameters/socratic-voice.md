# What are Parameters? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

When we say GPT-4 has "over a trillion parameters," what exactly are we counting?

Numbers. The model is built from mathematical operations, and those operations have adjustable numbers — weights that multiply inputs, biases that shift activations. Each adjustable number is a parameter.

So a model with 175 billion parameters has 175 billion... what, exactly?

175 billion numbers that were learned during training. Each one started random and was adjusted, tiny bit by tiny bit, to make the model's predictions better.

That's a lot of numbers. What do they represent?

That's the tricky part. They don't represent facts in any straightforward sense. You can't find a parameter that "knows" Paris is France's capital.

Then where is that knowledge stored?

Distributed across many parameters. The model produces correct answers about Paris because of the collective effect of millions of parameters, not because any individual parameter encodes the fact.

How can knowledge be distributed like that?

Think about how you recognize a face. You don't store "nose at position 47" and "eye color in slot 103." Recognition emerges from patterns across many neurons. Neural networks work similarly — information is encoded in relationships between parameters, not in parameters themselves.

Is this why we need so many parameters?

Partly. More parameters means more capacity for patterns. A small model might learn simple rules. A large model can learn subtle distinctions.

But there's another reason: language is complex. Grammar, meaning, facts, reasoning, style, multiple languages — encoding all this requires enormous capacity.

Is bigger always better?

Not automatically. More parameters means more capacity, but that capacity needs filling with training data. A huge model trained on little data may memorize rather than generalize.

Research found optimal ratios: you need roughly matching amounts of model capacity and training data. The Chinchilla paper showed that many large models were undertrained — they would have been better as smaller models trained on more data.

How much memory does 175 billion parameters take?

Each parameter is a number stored in some precision. At 16-bit precision (2 bytes per number), 175 billion parameters take about 350 gigabytes. Just for the weights — not counting anything needed during computation.

Is there a way to make models smaller?

Quantization. You reduce precision — instead of 16-bit numbers, use 8-bit or 4-bit. Each individual number becomes less precise.

Doesn't that hurt quality?

Surprisingly little. The model has redundancy. Billions of slightly imprecise numbers still combine into good outputs. A 70B model at 4-bit precision fits in ~35 gigabytes, runnable on consumer hardware with modest quality loss.

Can we understand what individual parameters do?

This is the interpretability challenge, and it's largely unsolved. Parameters contribute fractionally to every output. Their effects are entangled. Current tools can't reliably say "this parameter group handles grammar" or "these encode factual knowledge."

Is that a problem?

For understanding and safety, potentially. We have systems that work, but we don't fully understand why. We can measure behavior but not locate capability within the parameters.

Research is trying to change this. But for now, parameters remain somewhat mysterious — we can count them, but not interpret them.

What should someone take away?

That models are defined by billions of learned numbers. That knowledge in these models is distributed, not localized. That size matters but isn't everything. And that despite our ability to build these systems, understanding what's happening inside them remains an open problem.
