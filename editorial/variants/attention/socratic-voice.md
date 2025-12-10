# How Does Attention Work? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

When the model processes a long sentence, how does it connect distant parts? How does "it" at the end of a paragraph link back to the noun it refers to?

Through a mechanism called **attention**. But to understand why it's revolutionary, first consider what came before.

What came before?

Recurrent neural networks. They processed text one token at a time, maintaining a hidden state that accumulated information. To connect word 100 to word 1, information had to flow through 99 intermediate steps.

What's wrong with that?

Information degrades. Like a game of telephone, each step can distort or lose what came before. By the time you reach word 100, the signal from word 1 is faint.

Also, it's slow. You can't process word 50 until you've processed words 1-49. No parallelism. Training takes forever.

So attention solves both problems?

Yes. Attention creates direct connections between any two positions, regardless of distance. Word 100 can attend directly to word 1. No degradation, no intermediate steps.

And it parallelizes. All positions can compute their attention simultaneously. Training became dramatically faster.

How does attention actually work?

Each position computes three things from its input: a **query**, a **key**, and a **value**.

What are those?

Think of query as a question: "What information am I looking for?" 

Think of key as an advertisement: "Here's what I contain."

Think of value as the actual content: "If you choose me, here's what you get."

How do they interact?

Every position's query gets compared to every other position's key. High similarity means "this position has what I'm looking for." Low similarity means "not relevant."

These similarities become weights. Each position gathers a weighted combination of all other positions' values. High-weight positions contribute a lot; low-weight positions contribute little.

So the output at each position is... what?

A blend of information from across the entire context, weighted by relevance. The position that was originally just "it" now carries information about what "it" refers to, because attention weighted the referent highly.

Where do queries, keys, and values come from?

Learned transformations. The model has parameters that convert the input at each position into its query, key, and value vectors. These parameters are learned during training.

So nobody programs "attend to the subject when you're at the verb"?

Exactly. The model learns that certain query-key patterns help predict text. If tracking subjects helps predict verbs, the model will learn to attend that way. The patterns emerge from training.

What is multi-head attention?

Running multiple attention mechanisms in parallel, each with different learned parameters.

Why would you want that?

One head might learn to track syntax. Another might track semantics. Another might track position. Language has many simultaneous structures. Multiple heads can capture different patterns without interference.

The outputs of all heads get combined, giving the model multiple perspectives on the context.

Why is attention computation quadratic?

Because every position attends to every other position. If you have n positions, you compute n² attention scores.

Double the sequence length, quadruple the computation. This is why context windows have limits — attention becomes prohibitively expensive for very long sequences.

Are there ways around this?

Active research area. Sparse attention only attends to selected positions. Linear attention approximates full attention with linear cost. The tradeoffs vary: you might lose some representational power but gain efficiency.

For now, the quadratic cost is a fundamental constraint on how LLMs process long contexts.

What should someone take away from understanding attention?

That attention is the mechanism connecting information across distance. When an LLM understands that a pronoun refers to something earlier, or follows a chain of reasoning, or tracks a character through a story — attention is doing that work.

The patterns of attention are learned, not programmed. The model taught itself which connections help prediction. Understanding attention means understanding the core of how LLMs process context.
