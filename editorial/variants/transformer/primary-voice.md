# What is a Transformer? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**What architecture actually powers GPT, Claude, and other LLMs?**

The **Transformer**. Introduced in a 2017 paper titled "Attention Is All You Need," it became the foundation for virtually every large language model that followed.

The name is almost anticlimactic for something so consequential. But the architecture genuinely transformed the field, making possible models that previous approaches couldn't scale.

**What made it different?**

Before Transformers, the dominant architectures for language were recurrent neural networks (RNNs). These processed text sequentially, word by word, maintaining a hidden state that accumulated information.

RNNs had problems:

- **Sequential processing**: Each word waits for the previous word. Can't parallelize.
- **Long-range dependencies**: Information from early words fades as it passes through many steps.
- **Training difficulty**: Gradients vanish or explode over long sequences.

The Transformer solved all three by replacing recurrence with attention. No sequential dependencies. Direct connections between any positions. Perfectly parallelizable.

**The basic structure**

A Transformer stacks identical layers, each containing:

1. **Self-attention**: Every position attends to every other position
2. **Feed-forward network**: A simple neural network applied to each position independently
3. **Layer normalization**: Stabilizes training
4. **Residual connections**: Adds the input back to the output, helping gradients flow

Stack 12, 24, 96, or more of these layers. Each layer refines the representations, building more abstract understanding.

**Encoder and decoder**

The original Transformer had two parts:

- **Encoder**: Processes input, building rich representations. Attention looks at all positions (bidirectional).
- **Decoder**: Generates output token by token. Attention is masked so each position only sees earlier positions (unidirectional).

Different models use different configurations:
- **Encoder-only** (BERT): Good for understanding text, classification
- **Decoder-only** (GPT, Claude): Good for generating text
- **Encoder-decoder** (T5, original Transformer): Good for translation, transformation

Modern LLMs like GPT-4 and Claude are decoder-only. They generate text one token at a time using masked self-attention.

**Why does it scale so well?**

The Transformer has properties that match modern hardware:

- **Parallelism**: All positions can be processed simultaneously. GPUs thrive on parallel operations.
- **Regular structure**: Same operations repeated many times. Easy to optimize.
- **Dense computation**: Matrix multiplications dominate. GPUs are designed for exactly this.

RNNs require sequential steps that GPUs can't parallelize. Transformers turn language modeling into massive parallel matrix operations. Training that once took months now takes weeks.

The architecture also shows clean scaling behavior. Double the parameters and you get predictable improvements. This reliability let researchers confidently invest in larger models.

**The Transformer's legacy**

Nearly every significant language model since 2018 is a Transformer or close variant. The architecture proved remarkably robust: scale it up, train it on more data, and it keeps improving.

This wasn't inevitable. Researchers tried many architectures. Most hit walls. The Transformer scaled gracefully, and that made all the difference.

Today, "LLM" almost implies "Transformer-based." Understanding Transformers is understanding how modern AI works.
