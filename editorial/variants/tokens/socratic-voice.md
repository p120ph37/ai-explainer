# What are Tokens? — Socratic Voice

*Narrative that progresses through questions, with each answer opening new questions.*

---

When you type a message to an LLM, what does the model actually receive? Your text as you typed it? A stream of characters?

Neither, exactly. The model receives **tokens** — and understanding what tokens are changes how you understand the model's capabilities and limitations.

So what is a token?

A token is a chunk of text. It might be a whole word like "hello" or a word fragment like "tion" or a single character like "!". The model's tokenizer breaks your input into these chunks before anything else happens.

But here's the puzzle: why chunks instead of characters? Wouldn't character-by-character processing be simpler and more precise?

Consider the math. A long conversation might contain 100,000 characters. If each character were a separate unit, the model would need to track relationships between 100,000 elements. But LLMs already struggle with context length. A context window of 100,000 characters would be cripplingly small in practice.

Tokens compress the representation. The same conversation might be 25,000 tokens. Now the model can fit four times as much meaningful content in the same window. The compression isn't just nice to have — it's essential for the system to work at all.

But wait — doesn't compression lose information? If "strawberry" becomes "straw" + "berry", where did the letter-level structure go?

It didn't go anywhere reachable. The model sees two tokens. Neither token explicitly encodes its constituent letters. If you ask the model to count letters in "strawberry," it must infer rather than count. And inference from compressed representations often fails.

Is this why LLMs are bad at word games and letter-counting?

Exactly. The tasks that seem simple to you (how many r's in "strawberry"?) are hard for the model because they require information that was abstracted away in tokenization. You see letters; the model sees semantic chunks.

How does the tokenizer decide where to split?

Through a process called byte-pair encoding. Start with every character as its own token. Scan a massive corpus. Find the two adjacent tokens that appear together most often. Merge them into a new token. Repeat until you reach a target vocabulary size.

Over millions of merges, patterns emerge. "th" appears constantly, so it becomes one token. Then "the" becomes one token. Common words crystallize into single tokens. Rare words remain fragmented.

So the vocabulary reflects the training data?

Yes. And this has consequences. English text dominated most tokenizer training. "Hello" is one token. But a common Korean word might be five tokens, because the tokenizer never saw enough Korean text to learn efficient Korean chunks.

Does this mean LLMs work better in English?

Generally, yes. Not because the model architecture favors English, but because the tokenization is more efficient. More meaning per token in English. More fragmentation, more work, more errors in languages the tokenizer wasn't optimized for.

Could you build better tokenizers for other languages?

You could, and some models do. But there's a tradeoff. A vocabulary optimized for Korean might fragment English. A vocabulary optimized for code might fragment natural language. The 50,000-100,000 token vocabularies used by most models are compromises, trying to handle everything reasonably rather than anything perfectly.

What happens when the model encounters a word that's not in the vocabulary at all?

It can always fall back to character-level or byte-level tokens. "ChatGPT" (when new) might become "Chat" + "G" + "PT". The model can represent anything, but rare or novel strings cost more tokens and require more reconstruction effort.

So tokens are a form of perception? The model perceives text in chunks the way we might perceive familiar words as gestalts rather than letter sequences?

That's a useful analogy. When you read fluently, you don't consciously process individual letters. You recognize word shapes. The model does something similar, but harder and more absolute: it literally cannot access sub-token structure without inference.

This is why some prompting tricks work. Spelling out a word letter by letter forces the model to receive it as separate tokens, making letter-level reasoning possible. The tokenizer boundary can sometimes be bypassed, but it requires deliberate effort.

What should someone take away from understanding tokenization?

That the model's view of your text is not your view. That some tasks are hard not because the model is stupid but because the information was discarded in preprocessing. That efficiency and capability trade off in ways that shape what LLMs can and cannot do.

When the model fails at something that seems simple, ask: what does this look like in token-space? The answer often explains the failure.
