# What are Tokens? — Curiosity Voice

*Questions and objections an astute reader might have while reading the Primary narrative. Each question includes a brief answer suitable for a Question aside-box, with pointers to deeper exploration.*

---

## Q: Why tokens instead of letters? Wouldn't letter-by-letter be simpler and handle any word?

**Short answer:** Letters are too granular. A 500-word essay becomes ~2,500 individual letters—each needing separate processing. Tokens strike a balance: common words are efficient single units, while rare words decompose into reusable pieces. This dramatically reduces computation while maintaining flexibility. The tradeoff is that letter-level tasks (like counting letters) become harder because letters aren't the native unit.

*→ Explore further: [How Does Attention Work?]* (attention cost scales with token count)

---

## Q: If tokenization shapes "cognition," does that mean non-English speakers get worse AI?

**Short answer:** Often, yes. Tokenizers trained primarily on English fragment other languages heavily. A Japanese sentence might require 3-5x more tokens than the same meaning in English. This means faster context exhaustion, higher costs, and more reconstruction errors. Multilingual models are improving, but tokenization equity remains an active research problem.

*→ Explore further: [The Context Window]*

---

## Q: You said "strawberry" might tokenize as "straw" + "berry"—but those have their own meanings. Does the model get confused?

**Short answer:** Not usually. Context disambiguates. When "straw" appears next to "berry," the model has learned this combination means the fruit, not hay plus fruit. But you've spotted a real edge case: the model processes tokens, not morphemes or meanings. Unusual splits can cause subtle issues, especially for rare words where the model hasn't seen enough disambiguating context.

*→ Explore further: [How Do Tokens Become Numbers?]* (embeddings capture contextual meaning)

---

## Q: If new words like "ChatGPT" didn't exist during training, how does the model know what they mean?

**Short answer:** It doesn't, initially. The word gets split into pieces ("Chat" + "G" + "PT" or similar), and the model infers meaning from context. If someone explains ChatGPT in the prompt, the model uses that explanation. If not, it pattern-matches on the pieces—"Chat" suggests conversation, etc. This is why very new concepts may be misunderstood until the model is retrained or given explicit context.

*→ Explore further: [The Context Window]*

---

## Q: Why 50,000-100,000 tokens? Who decided that number?

**Short answer:** It's a tuned tradeoff. Larger vocabulary = more single-token words = more efficient encoding, but also more parameters in the embedding layer and more memory usage. Research suggests 50K-100K balances these factors well for most use cases. Models optimized for specific domains (code, non-English) might use different sizes. There's no magic number—just empirical tuning.

*→ Explore further: [What are Parameters?]*

---

## Q: How do I know what tokens my prompt becomes? Can I see them?

**Short answer:** Yes! Most model providers offer tokenizer tools. OpenAI has a web-based tokenizer; libraries like tiktoken let you tokenize text programmatically. Try it with an unusual word or foreign language text—you'll see exactly how it splits. This is useful for understanding why certain prompts cost more or hit context limits faster.

*→ Explore further: [Communicating Effectively with LLMs]*

---

## Q: If tokens affect cost, is there a way to write cheaper prompts?

**Short answer:** Yes—be concise. Avoid unnecessary filler, repetition, and verbose instructions. Use standard words when possible (they tokenize more efficiently than jargon or invented terms). But don't sacrifice clarity for token economy—an unclear prompt that requires follow-ups costs more than a clear long one. The real savings come from structuring conversations efficiently.

*→ Explore further: [Communicating Effectively with LLMs]*

---

## Q: You mentioned code tokenizes differently. Why does language matter for code?

**Short answer:** Tokenizers learn from their training data. If the tokenizer saw more Python than Haskell, Python syntax becomes recognized patterns (efficient tokens) while Haskell fragments more. Whitespace handling matters too—Python's significant indentation, JSON's brackets. Code tokenizers also handle special characters and common patterns (function names, imports) that natural language tokenizers might split awkwardly.

*→ Explore further: [How are LLMs Trained?]*

---

## Q: Does punctuation count as tokens? What about spaces?

**Short answer:** Usually, yes. Common punctuation (periods, commas) are typically their own tokens. Spaces are often attached to the following word ("▁Hello" might be a single token, where ▁ represents the leading space). This is why you might see models occasionally produce odd spacing—they're predicting space-attached tokens, not separate space characters.

---

## Q: Building on earlier—if tokenization is so important, could you design a better tokenizer and improve the model without retraining?

**Short answer:** Not without retraining. The model's embeddings are learned *for that specific tokenizer*. Each token ID maps to a learned vector. Change the tokenizer and all those mappings become meaningless—the model would need to relearn them. This is why tokenizer design happens early and stays fixed. Better tokenizers require training new models from scratch.

*→ Explore further: [How Do Tokens Become Numbers?]*
