# What are Tokens? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking. The imagery carries the explanation.*

---

Imagine you have a box of LEGO pieces, but not the regular kind. Some pieces are large, pre-assembled: recognizable shapes like wheels or windows or minifig heads. Others are the smallest studs, individual bumps that can combine into anything.

This is a token vocabulary. When text arrives at an LLM, a tokenizer reaches into this box and finds the largest pieces that fit. "Hello" might be one chunky block. "Cryptocurrency" might need several smaller pieces snapped together. "The" is a single familiar shape, used so often it has its own optimized mold.

The model thinks in these pieces. It never sees individual letters the way you do. Asking it to count letters is like asking someone to count the bumps on a LEGO structure when they can only perceive assembled blocks. The information is there, in some sense, but it's not accessible at the resolution they're working at.

**The compression language**

Think of tokenization as a compression algorithm for meaning. Common patterns get short codes. Rare patterns get built from smaller codes. It's like how efficient writing systems work: frequent words in Chinese have simpler characters, while rare concepts combine simpler elements.

The model speaks this compression language natively. When you type "hello," it doesn't laboriously decode h-e-l-l-o. It sees "hello" as a single symbol, instantly associated with greeting-patterns learned from millions of hellos in training.

But type something rare — an unusual name, a technical term, a word in a language the tokenizer wasn't optimized for — and the compression fails. The word shatters into fragments. Each fragment carries its own associations, learned in contexts that may have nothing to do with your intended meaning. The model must reconstruct coherence from shards.

**The cutting room**

Before any thinking happens, your text passes through a cutting room. The tokenizer is an editor with a specific set of scissors. It knows where to cut English text efficiently — years of training have taught it where the natural seams are.

But give it text in an unfamiliar language, and the scissors hesitate. The cuts fall in strange places. A single Korean word might become a dozen fragments. Each fragment small, each carrying little meaning on its own, each requiring work to integrate.

This is why LLMs often perform better in English than other languages. The cutting room was optimized for English seams. Other languages get cut awkwardly, fragments where there should be wholes, waste where there should be efficiency.

**The vocabulary boundary**

The token vocabulary is a border. Inside the border: efficient, recognized territory. Outside: wilderness that must be traversed piece by piece.

When "ChatGPT" was a new word, no tokenizer had it as a single piece. The word had to be assembled: "Chat" + "G" + "PT". Three pieces instead of one. Three separate associations to integrate instead of one learned meaning.

Over time, as words become common enough, they might earn their own tokens in newer models. The border shifts. Yesterday's wilderness becomes today's recognized territory. But the border always exists somewhere, and beyond it, the model works harder.

**The hidden structure**

Something important hides in the gap between your view and the model's view.

You see: "strawberry" — a word, nine letters, three r's.

The model sees: ["straw", "berry"] — two tokens, neither containing explicit letter information.

When you ask "how many r's in strawberry?" you're asking about structure that was erased in tokenization. The model might guess based on patterns (words with "berry" often have certain letters?) but it's not counting. It can't count what it can't see.

This isn't a bug to be fixed. It's a consequence of the compression that makes the system possible at all. You can't process trillions of words at character level — the context window would overflow with letters. Tokens are the compromise: lose letter-level granularity, gain the ability to process meaningful chunks of language at scale.

**The token tax**

Every token costs. Computation, memory, money. APIs charge per token. Context windows measure in tokens. Generation speed depends on tokens produced.

When your prompt is verbose, you're paying the token tax on every unnecessary word. When the model rambles, it's spending your token budget on filler. Efficiency in language becomes efficiency in resources.

The tokenizer sits at the border, counting what crosses. Understanding it means understanding the true cost of what you say and what you ask for.
