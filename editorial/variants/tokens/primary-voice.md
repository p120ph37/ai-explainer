# What are Tokens? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations. No asides or expandables.*

---

**When you type "Hello, how are you?" what does the model actually see?**

Not letters. Not exactly words. The model sees **tokens**: chunks of text that might be whole words, parts of words, or individual characters.

Before your message reaches the neural network, a tokenizer chops it up. "Hello" might become one token. "Tokenization" might become "Token" + "ization". An unusual word like "cryptographic" might split into "crypt" + "ographic" or even smaller pieces.

This chunking matters because neural networks work with numbers, not text. Each token maps to a numeric ID in a vocabulary. Token 9906 might be "Hello". Token 30 might be "?". These numbers are what the model actually processes.

**Why not just use words?**

Words seem like the obvious choice, but they create problems. English alone has hundreds of thousands of words. Add names, technical terms, foreign words, typos, and internet slang, and you'd need millions of vocabulary entries.

Worse: any word not in your vocabulary becomes impossible to process. The model would choke on "ChatGPT" if it was trained before that word existed.

Tokens solve this elegantly. A typical vocabulary has 50,000-100,000 tokens. Common words like "the" and "and" get their own tokens. Rare or new words get assembled from pieces. "ChatGPT" might become "Chat" + "G" + "PT". The model never encounters a word it can't represent.

**How does the tokenizer know where to split?**

The most common approach is **byte-pair encoding** (BPE). The algorithm starts with individual characters as tokens. Then it repeatedly scans the training text and merges the most frequent adjacent pairs.

Starting with individual letters, it might first merge "t" and "h" into "th" (because they appear together constantly). Then "th" and "e" into "the". Over many iterations across massive text, common patterns become single tokens while rare combinations stay split.

The result is a vocabulary that efficiently compresses common language while remaining flexible enough to handle anything. Frequent words become single tokens. Rare words decompose into pieces. Nothing is unrepresentable.

**Why does this affect what the model can easily perceive?**

Tokenization shapes cognition. Common English words are single tokens. The model has learned rich associations for these single tokens during training. But split a word into pieces and the model must reconstruct its meaning from fragments, each of which might have been learned in very different contexts.

This explains some quirks you may have noticed. LLMs struggle with tasks involving individual letters. Ask one to count the r's in "strawberry" and it often fails. Why? Because it doesn't see "s-t-r-a-w-b-e-r-r-y." It might see "straw" + "berry" as two tokens. The letter-level structure is hidden.

Similarly, non-English languages often work less well. They may be heavily fragmented, each word split into many pieces, because the tokenizer was trained primarily on English text. More fragments mean more work to reconstruct meaning and more chances for errors.

**How many tokens is my conversation?**

A rough rule: one token averages about 4 characters in English, or roughly three-quarters of a word. A 100-word paragraph is typically 70-80 tokens. A 1,000-word essay might be 750-800 tokens.

This matters because LLMs have a context window: a maximum number of tokens they can consider at once. Every token in your prompt and the model's response counts against this limit. Token efficiency directly affects how much context the model can use.

It also affects cost. API-based LLMs typically charge per token. A verbose prompt costs more than a concise one. Understanding tokenization helps you understand why certain phrasings are more expensive than others.

**What should you take away?**

The model doesn't see your text the way you do. It sees chunks. Common words are chunky and familiar. Rare words are fragmented and reconstructed. Tasks that require letter-level awareness are hard because letters aren't the model's native unit of perception.

When the model behaves unexpectedly with unusual words, names, or non-English text, tokenization is often the underlying cause. The model isn't being stupid; it's working with a different view of your input than you have.
