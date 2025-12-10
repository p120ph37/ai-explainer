# How Does Text Generation Actually Happen? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**What happens in the milliseconds after you press send?**

Your prompt is tokenized, breaking text into numeric IDs. These IDs become embeddings: vectors of numbers representing each token. The embeddings flow through the neural network, layer by layer. At the end, the model outputs probabilities for every possible next token.

One token is selected from those probabilities. It's appended to the sequence. The whole process repeats with this slightly longer sequence. Token by token, the response emerges.

This is **inference**: running the model to produce output. Training taught the model what to predict. Inference is prediction happening in real-time.

**The autoregressive loop**

LLMs generate text **autoregressively**: each token depends on all previous tokens.

1. Tokenize the input (your prompt becomes token IDs)
2. Run a forward pass through the network
3. Get probabilities for the next token
4. Sample one token based on temperature settings
5. Append it to the context and repeat

Each step requires a full forward pass through the network. A 500-token response requires 500 forward passes. This is why generation takes noticeable time, even on powerful hardware.

**Why is inference expensive?**

Each forward pass involves massive matrix multiplications across billions of parameters. For a 70-billion parameter model, each token requires roughly 70 billion multiply-add operations.

Multiply by sequence length. A 1000-token response means 70 trillion operations. This is why inference requires specialized hardware: GPUs or TPUs that can perform trillions of operations per second.

The cost adds up. Running inference at scale requires substantial infrastructure. A single high-end GPU costs around $30,000 and can serve maybe tens of queries per second for a large model. Serving millions of users requires thousands of GPUs.

**The KV cache optimization**

Here's a key insight: in autoregressive generation, most computation is repeated. When generating token 501, you recompute attention for tokens 1-500, even though nothing about them changed since token 500.

The **KV cache** stores the key and value vectors from previous tokens. On each new step, you only compute the new token and look up cached values for previous tokens. This dramatically speeds generation.

The tradeoff: the cache consumes memory. Long contexts with large caches can exhaust GPU memory. This is one reason context windows have practical limits.

**Latency vs throughput**

**Latency**: How long you wait for a response. Time from pressing send to seeing the complete answer.

**Throughput**: How many tokens the system can generate per second across all users. Total capacity.

These often trade off. Batching multiple requests together improves throughput (the GPU stays busy) but may increase latency (your request waits for others).

Providers tune this balance. Interactive applications prioritize latency. Batch processing prioritizes throughput.

**What determines inference speed?**

Several factors:

**Model size**: More parameters means more computation per token. A 7B model generates much faster than a 70B model.

**Context length**: Longer contexts mean more attention computation. Even with KV caching, generation slows as context grows.

**Hardware**: GPU memory, compute speed, and interconnect bandwidth all matter.

**Optimization**: Quantization reduces precision but speeds computation. Better batching improves utilization.

**Sampling complexity**: Simple greedy decoding is faster than complex sampling strategies.

**Inference vs training**

Training is much more expensive than inference because:

- Training computes gradients (backward pass) in addition to predictions (forward pass)
- Training processes the entire dataset many times (epochs)
- Training updates parameters, requiring memory for optimizer states

A single inference query costs a tiny fraction of what training cost. But inference scales with users: millions of queries add up. Inference cost is the ongoing expense; training cost is the upfront investment.

**Streaming and the autoregressive reality**

When you see responses stream in word by word, you're watching the autoregressive loop in action. Each word appears after a forward pass completes. The model doesn't know what it will say next until it says it.

This has consequences. The model can't easily go back and revise earlier tokens. If it starts down a problematic path, subsequent tokens are conditioned on that path. Generation is sequential and largely one-directional. The model commits to each token as it's produced.

Understanding inference helps you understand why generation takes time, why longer responses cost more, and why the model sometimes paints itself into corners it can't escape.
