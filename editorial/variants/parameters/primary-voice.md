# What are Parameters? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**When people say GPT-4 has "over a trillion parameters," what does that mean?**

Parameters are the numbers that define a neural network. Every weight connecting neurons, every bias shifting activations — these are parameters. When a model "learns," it's adjusting these numbers.

A model with 175 billion parameters has 175 billion individual numbers that were tuned during training. Each one contributes, in some small way, to every prediction the model makes.

**What do parameters actually store?**

This is subtle. Parameters don't store facts like a database stores records. You can't point to a parameter and say "this one knows that Paris is the capital of France."

Instead, knowledge is distributed across parameters. Patterns about language, facts about the world, reasoning heuristics — all encoded as statistical relationships between millions of numbers. The parameter values collectively create a function that maps inputs to outputs in useful ways.

**Why do we need so many?**

More parameters means more capacity to store patterns. A small network with thousands of parameters can learn simple rules. A network with billions can learn subtle distinctions.

Consider what language requires:
- Grammar rules and exceptions to those rules
- Word meanings and how context shifts them
- Facts about the world
- Reasoning patterns
- Style, tone, register
- Multiple languages

Encoding all of this requires enormous parameter counts. Each additional parameter is another degree of freedom the model can use to capture nuance.

**Is bigger always better?**

Not automatically. A larger model has more capacity to learn, but:

- It needs more training data to fill that capacity
- It costs more to train and run
- Without enough data, it may memorize rather than generalize

Research on "scaling laws" found that you need to balance model size with data quantity. The Chinchilla paper showed that many large models were undertrained: they would have performed better if made smaller but trained on more data.

Size matters, but it's not the only thing.

**How much space do parameters take?**

Each parameter is stored as a floating-point number:

- **32-bit (FP32)**: 4 bytes per parameter, full precision
- **16-bit (FP16/BF16)**: 2 bytes per parameter, common for training
- **8-bit (INT8)**: 1 byte per parameter, for efficient inference
- **4-bit**: 0.5 bytes per parameter, aggressive compression

GPT-3's 175 billion parameters at 16-bit precision: about 350 gigabytes just for the weights. Running large models requires specialized hardware with substantial memory.

**Quantization: making models smaller**

**Quantization** reduces parameter precision to save memory and speed computation. Instead of 16-bit numbers, use 8-bit or 4-bit.

Surprisingly, this often works. The network has redundancy. Small precision losses at individual parameters average out across billions of parameters.

A 70B model at 4-bit quantization fits in about 35 gigabytes — runnable on high-end consumer hardware. The same model at full precision needs 280 gigabytes.

**What happens during training?**

Before training, parameters are initialized randomly. The model outputs nonsense.

Training iteratively adjusts parameters to reduce prediction error:

1. Process a batch of examples
2. Compare outputs to targets, compute loss
3. Calculate how each parameter affects loss (gradients)
4. Nudge each parameter slightly to reduce loss
5. Repeat billions of times

By the end, random values have been sculpted into something that captures patterns in language.

**The parameter mystery**

We can count parameters. We can measure what models do. What we can't easily do is understand how specific parameters contribute to specific behaviors.

This is the interpretability challenge. Billions of numbers, all contributing fractionally to every output. Which parameters encode grammar? Which encode facts? The question may not be well-formed: knowledge is so distributed that no parameter "knows" anything individually.

Understanding this high-dimensional encoding is one of the open frontiers in AI research.
