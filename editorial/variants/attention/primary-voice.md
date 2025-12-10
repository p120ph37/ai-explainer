# How Does Attention Work? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**How does the model know which words matter for predicting the next one?**

When you read "The cat sat on the ___," you know "mat" is likely because of "cat" and "sat." Not every word matters equally. Your brain focuses on the relevant parts.

Neural networks needed a similar ability. Enter **attention**: a mechanism that lets the model dynamically focus on different parts of the input depending on what it's trying to do.

Before attention, models processed text in fixed ways. With attention, the model learns *where to look* for each decision.

**The core idea: weighted combinations**

Attention computes which parts of the input are relevant to each position. For every position in the sequence, it produces weights over all other positions. High weight means "pay attention here." Low weight means "ignore this."

These weights let the model combine information flexibly. When predicting a word that refers back to something earlier, attention can put high weight on that earlier word, effectively connecting them despite the distance.

**Self-attention: every position attends to every other**

In **self-attention**, each position in a sequence computes attention weights over all positions, including itself. This happens in parallel for every position.

The result: a new representation where each position has gathered information from wherever it was relevant. A pronoun's representation now includes information about what it refers to. A verb's representation includes information about its subject.

This is why LLMs can handle long-range dependencies. Attention creates direct pathways between any two positions, regardless of distance in the text.

**How does it decide what's relevant?**

Through learned computations called **queries**, **keys**, and **values**.

Each position produces:
- A **query**: "What am I looking for?"
- A **key**: "What do I contain?"  
- A **value**: "What information should I contribute?"

Attention scores come from comparing queries to keys. If a query matches a key well (high dot product), that position gets high attention weight. The output is a weighted sum of values, where weights come from query-key similarity.

All of this is learned. The model discovers what queries, keys, and values to produce through training. Nobody programs "attend to the subject when you're at the verb." The model figures this out because it helps predict text.

**Multi-head attention: looking at many things at once**

A single attention mechanism can only focus on one pattern at a time. But language has many simultaneous relationships: syntax, semantics, coreference, style.

**Multi-head attention** runs several attention mechanisms in parallel, each with different learned parameters. One head might track grammatical agreement. Another might track semantic relatedness. Another might track position.

The outputs of all heads are combined, giving the model a rich, multi-faceted view of relationships in the text.

**Why was attention revolutionary?**

Before the Transformer (2017), sequence models processed text step-by-step. To connect the first word to the hundredth, information had to flow through 99 intermediate steps. Information got diluted or lost.

Attention creates direct connections. The hundredth word can attend directly to the first. No intermediate steps, no dilution. This is why Transformers handle long contexts much better than their predecessors.

Attention also parallelizes perfectly. All computations for all positions happen simultaneously. Previous architectures had to process sequentially. This made Transformers dramatically faster to train.

**Attention has costs**

Computing attention between every pair of positions means cost grows quadratically with sequence length. Double the context, roughly quadruple the computation.

This is why context windows have limits. A million-token context requires computing attention between every pair of a million positions. Researchers work on efficient attention variants (sparse attention, linear attention) to reduce this cost, but it remains a fundamental constraint.

**What should you understand?**

Attention is how the model connects information across distances. It's the mechanism that allows "it" to find its referent, allows verbs to find their subjects, allows conclusions to connect to premises.

When people say LLMs "understand context," attention is doing most of that work. It's not magic — it's learned patterns of which positions to weight heavily when computing each part of the output.
