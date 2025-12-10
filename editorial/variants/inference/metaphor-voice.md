# How Does Text Generation Actually Happen? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking.*

---

Generation is a river carving its own path.

Each token is a drop of water. Once placed, it shapes where the next drop can go. The model doesn't plan the entire river course in advance. It places each drop based on the terrain so far, and the terrain is always changing because of the drops already placed.

You watch the river emerge. Token by token, the response materializes. The model had no idea what the third paragraph would say when it wrote the first sentence. It discovered the destination by traveling there.

**The cascade**

Your prompt enters the system like water hitting the top of a tiered fountain.

First tier: tokenization. Your words become numbers, chunks that the model can process.

Second tier: embedding. Numbers become vectors, positions in high-dimensional space where meaning lives.

Third tier: the network itself. Layer after layer, attention and transformation. Information flows, combines, refines. By the bottom, the input has become a probability distribution over possible next tokens.

One token falls from the fountain's final tier. It lands, becomes part of the context, and the cascade runs again. Each token triggers a complete journey through all the tiers.

**The thinking river**

Generation can go wrong and can't easily recover. A misleading early token shapes all subsequent tokens. The river carved a path, and water doesn't flow uphill.

If the model commits to "The answer is 42" in an early sentence, the rest of the response will likely justify 42, even if a different answer would be better. The river doesn't reconsider its headwaters.

This is why "chain of thought" prompting helps. By generating reasoning steps first, the model carves a river through reasoning territory before committing to conclusions. The path through reasoning terrain leads to better destinations than the path through assertion terrain.

**The cache as memory**

Imagine the model has a notepad. As it processes your prompt, it jots notes: "key information about token 47," "value associated with token 103."

These notes are the KV cache. Instead of re-reading the entire conversation from scratch for each new token, the model consults its notes. "I already figured out what's important about the first 500 tokens. Let me just add notes about token 501."

The notepad has limited pages. Long conversations fill it. Eventually, adding new notes means discarding old ones, or slowing down dramatically.

**The assembly line**

In a production setting, inference is an assembly line with many products moving through simultaneously.

Your query enters the line. It doesn't proceed alone — it's batched with other queries arriving around the same time. They move through the factory together: tokenization, forward pass, sampling, output.

Batching is efficient. The machinery (the GPU) works better when processing many items at once. But your query must wait until the batch is ready, and you might be held up by slower queries in your batch.

Provider engineering optimizes this assembly line. Continuous batching, speculative decoding, strategic routing — all techniques to move more products through faster without any individual query waiting too long.

**The cost of steps**

Each token is expensive. Not abstractly expensive — actually expensive. Every forward pass burns compute cycles, consumes electricity, wears silicon.

A model with 70 billion parameters does roughly 70 billion calculations per token. A thousand-token response means 70 trillion calculations. This is why API pricing is per-token: the cost is real and proportional.

Verbose prompts cost money. Rambling responses cost money. The token counter runs whether the tokens are useful or not. Understanding the economics of generation is understanding where the cost lives.

**The commitment**

Generation commits. Each token is a bet placed and not withdrawn.

The model can't see the future. It samples the next token based on what exists so far. Sometimes that sample leads somewhere wonderful. Sometimes it leads somewhere wrong. Either way, the model proceeds forward, building on what it has committed to.

This is why the model sometimes doubles down on mistakes, why it can write itself into corners, why it occasionally produces nonsense that a moment's revision would catch. There is no revision. There is only the next token, conditioned on everything before, for better or worse.

The river flows one direction. You watch where it goes.
