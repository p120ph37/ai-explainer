# What is a Transformer? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

What's the actual architecture behind GPT, Claude, and modern LLMs?

The Transformer. A specific neural network architecture introduced in 2017.

What came before it?

Recurrent neural networks (RNNs) were the dominant approach. They processed text sequentially, word by word, maintaining a hidden state that accumulated information.

What was wrong with that?

Several things. Sequential processing meant you couldn't parallelize: word 50 had to wait for words 1-49. Information from early words degraded as it passed through many steps. Training was slow and unstable.

How did Transformers fix these problems?

By using attention instead of recurrence. Instead of passing information word by word, every position can attend directly to every other position.

What does that mean practically?

Word 100 can directly access word 1. No intermediary steps, no degradation. And all positions can be processed simultaneously — perfect parallelism.

Why does parallelism matter?

GPUs are designed for parallel operations. RNNs couldn't fully use GPU power because of sequential dependencies. Transformers turn language modeling into massive matrix operations that GPUs excel at. Training became dramatically faster.

What's inside a Transformer layer?

Two main components: self-attention and a feed-forward network.

Self-attention computes which positions are relevant to each other and combines their information. The feed-forward network processes each position independently after attention has mixed in context.

Then there's layer normalization (for training stability) and residual connections (so information can flow through without getting lost).

How do these layers stack?

Many identical layers on top of each other. GPT-3 has 96 layers. Each layer refines the representations, building more abstract understanding.

What's the difference between encoder and decoder?

The original Transformer had both. The encoder processes input with full bidirectional attention (every position sees every other). The decoder generates output with masked attention (each position only sees earlier positions).

Modern LLMs like GPT and Claude are decoder-only. They generate text autoregressively, one token at a time.

Why did decoder-only become dominant?

Simplicity and effectiveness for generation tasks. You don't need an encoder if your goal is just to continue text. The decoder-only approach turned out to scale very well.

Why did Transformers succeed where other architectures didn't?

Clean scaling behavior. Double the parameters and you get predictable improvements. This reliability let researchers invest confidently in scale.

Other architectures were tried. Some worked at small scale but hit walls. Transformers kept improving as they got bigger.

Is everything a Transformer now?

Nearly. Language models, vision models, audio models, multimodal models — most use Transformer architecture or close variants. It's become the default.

What should someone understand about Transformers?

That attention replaced recurrence, enabling parallelism and direct long-range connections. That the architecture scales remarkably well. That nearly all modern AI capabilities run on this foundation.

Understanding Transformers means understanding the engine behind modern AI.
