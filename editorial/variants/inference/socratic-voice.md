# How Does Text Generation Actually Happen? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

You press send. A second later, words start appearing. Then more, and more, until a complete response exists. What happened in those moments?

Let's trace the path. First question: what does the model actually receive?

Not your text directly. Your text gets tokenized — broken into chunks, converted to numeric IDs. These IDs are what enter the neural network.

What happens to those IDs?

They become embeddings: vectors of numbers representing each token's position in meaning-space. These embeddings flow through the network's layers.

How many layers?

Dozens, typically. GPT-3 has 96 layers. Each layer includes attention (connecting information across positions) and feed-forward transformations (processing information at each position).

What comes out the other end?

A probability distribution over the vocabulary. "Given everything so far, what's the probability that the next token is 'the'? 'cat'? 'quantum'?"

Then what?

One token is sampled from that distribution. Maybe it's the most likely token, maybe not — temperature settings control this. That sampled token gets appended to the context.

And then?

The whole process repeats. The now-longer context goes through the network again. Another probability distribution. Another sample. Another token.

This is autoregressive generation?

Right. Each token depends on all previous tokens. "Auto" means self. "Regressive" means feeding back. The output becomes input for the next step.

How many times does this loop run?

Once per token in the response. A 500-token response requires 500 forward passes through the entire network. This is why generation takes time.

Is there a way to speed this up?

The KV cache is the main optimization. During attention, each position computes keys and values. For positions that haven't changed (everything except the newest token), these don't need recomputing.

So the cache stores intermediate computations?

Exactly. Instead of reprocessing your entire prompt plus all generated tokens each time, the model processes just the newest token and looks up cached values for everything else.

Does that have downsides?

Memory. The cache grows with context length. Long conversations require storing enormous key-value tensors. Eventually, you run out of GPU memory.

What about serving many users simultaneously?

That's where batching comes in. Instead of running one query at a time, the system batches multiple queries together. The GPU processes them in parallel, improving throughput.

Throughput versus latency?

Throughput is total tokens generated per second across all users. Latency is time for your specific query to complete. Batching helps throughput but can hurt latency — your query might wait for the batch to fill or finish.

Why does inference cost so much?

Each forward pass requires matrix multiplications across billions of parameters. A 70B model does roughly 70 billion operations per token. Hardware costs are substantial, and electricity costs add up at scale.

Is inference more expensive than training?

Per query, no — inference is a tiny fraction of training cost. But training happens once; inference happens for every user query. At scale, inference cost often dominates.

What should someone take away?

That generation is sequential and committed. Each token triggers a full forward pass. The model discovers its response as it goes, one token at a time, with no ability to revise earlier choices.

Understanding this explains why generation takes time, why it costs what it costs, and why the model sometimes can't recover from early missteps. The autoregressive loop is the heartbeat of generation.
