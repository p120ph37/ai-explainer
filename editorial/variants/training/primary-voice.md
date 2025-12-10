# How are LLMs Trained? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**How do you teach a neural network language?**

You show it text. An enormous amount of text. And you ask it, over and over: what word comes next?

The model starts with random parameters — billions of numbers that mean nothing. Its predictions are gibberish. But each wrong prediction provides feedback. The parameters adjust slightly. Over billions of examples, the adjustments accumulate into something that understands language.

This is **pre-training**: the massive first phase where an LLM learns the patterns of language itself.

**The training loop**

Training follows a simple cycle:

1. **Sample a batch**: Get a chunk of text from the training data
2. **Forward pass**: Run the text through the model, generating predictions for each position
3. **Compute loss**: Measure how wrong the predictions were
4. **Backward pass**: Calculate how each parameter contributed to the error
5. **Update parameters**: Adjust each parameter slightly to reduce the error
6. **Repeat**: Billions of times

Each iteration improves the model imperceptibly. But imperceptible improvements compound. After processing trillions of tokens, the model has learned patterns no human could articulate.

**What data do they train on?**

Scale requires enormous datasets:

- **Web crawls**: Common Crawl provides billions of web pages
- **Books**: Digital libraries and published text
- **Code**: GitHub repositories and documentation
- **Conversations**: Reddit, forums, dialogue datasets
- **Academic papers**: Scientific literature across domains
- **Wikipedia**: Encyclopedic knowledge

A typical large model trains on trillions of tokens from diverse sources. The diversity matters: it's why LLMs can discuss Shakespeare and Python, cooking and quantum physics. The model sees the full breadth of what humans write about.

**What is "loss" and why minimize it?**

**Loss** measures how wrong the model's predictions are. For LLMs, this is typically **cross-entropy loss**: roughly, how surprised was the model by the actual next token?

If the model predicted "mat" with 90% probability and the actual word was "mat," loss is low. If it predicted "mat" with 1% probability, loss is high.

Training minimizes average loss across all predictions. Lower loss means the model assigns higher probability to what actually came next. It's becoming a better predictor.

This single objective — get good at predicting next tokens — turns out to teach grammar, facts, reasoning, and more. The objective is simple; the emergent capabilities are not.

**The compute required**

Training large models requires staggering resources:

- **GPT-3** (175B parameters): Thousands of GPU-years of computation
- **Frontier models**: Tens to hundreds of millions of dollars in compute
- **Training time**: Weeks to months on thousands of specialized chips
- **Power consumption**: Equivalent to small towns

This is why only a few organizations train frontier models. The capital requirements are prohibitive. Most practitioners use pre-trained models rather than training from scratch.

**How is training distributed?**

No single machine can train a large model. The solution: distributed training across hundreds or thousands of machines.

**Data parallelism**: Each machine processes different batches, computes gradients, and they're averaged together.

**Model parallelism**: The model itself is split across machines. Different layers live on different chips.

**Pipeline parallelism**: Different stages of forward and backward passes run simultaneously on different machines.

Coordinating this is complex engineering. Communication between machines is a bottleneck. Training code is as much about distributed systems as machine learning.

**Stages of training**

Modern LLMs typically go through multiple phases:

**Pre-training**: Massive text prediction on diverse data. Builds general language understanding and factual knowledge.

**Supervised fine-tuning (SFT)**: Training on curated instruction-response pairs. Teaches the model to follow instructions and produce helpful responses.

**Reinforcement learning from human feedback (RLHF)**: Training on human preferences about response quality. Aligns the model with what users actually want.

Each stage builds on the previous. Pre-training provides the foundation. Fine-tuning shapes the interface. RLHF polishes the behavior.

**Why does this work?**

This is the deep mystery. Predicting next tokens sounds too simple to produce intelligence. Yet it works.

To predict text well across all human writing, you must model the processes that generate text. Humans reason, know facts, feel emotions, follow logic. Text reflects this. To predict such text, the model must develop something like reasoning, factual knowledge, emotional understanding, logical structure.

The prediction task is simple. Achieving excellent prediction across the full diversity of human expression is not simple. It requires modeling the complexity of human thought.

Whether this is "real" understanding remains debated. What's undeniable: the process produces capabilities that continually surprise us.
