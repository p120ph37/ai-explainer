# What is Temperature in AI? — Curiosity Voice

*Questions and objections an astute reader might have while reading the Primary narrative. Each question includes a brief answer suitable for a Question aside-box, with pointers to deeper exploration.*

---

## Q: If temperature=0 always picks the most likely token, why not use that for everything?

**Short answer:** Most likely isn't always best. At temperature=0, the model can get stuck in repetitive patterns—the same phrase keeps being the most probable continuation of itself. Output becomes mechanical and predictable. Some tasks need exploration of alternatives. Additionally, when multiple good options exist, always picking one ignores equally valid paths. Temperature adds necessary variety.

*→ Explore further: [Why Do LLMs Make Things Up?]* (on variety vs. accuracy tradeoffs)

---

## Q: "Controlled randomness"—but I want accurate answers. Doesn't randomness hurt accuracy?

**Short answer:** At low temperatures, not significantly. The model strongly favors high-probability tokens, which correlate with quality. At higher temperatures, yes—you trade accuracy for creativity. For factual tasks, use low temperature. For brainstorming, higher temperature. The control is precise: you're adjusting how much the model explores vs. exploits its best guess.

*→ Explore further: [Communicating Effectively with LLMs]*

---

## Q: What's the intuition behind dividing by temperature before softmax?

**Short answer:** Division sharpens or flattens the differences. If you divide large numbers by a small value, they become even more different (sharpening). Softmax converts these to probabilities. After sharpening, the highest value dominates even more. Dividing by a large value (high temperature) compresses differences, making probabilities more uniform. It's elegant math that provides a clean control dial.

---

## Q: Top-k and top-p seem to do similar things. Which should I use?

**Short answer:** They address different scenarios. Top-k limits options to a fixed count, regardless of probability distribution. Top-p adapts—in situations with one clear best choice, it might select only a few options; when many are plausible, it includes more. Top-p is generally more adaptive. Many practitioners use both: top-p with temperature provides a good balance of controlled diversity.

---

## Q: You say temperature=0 isn't truly deterministic. Why not?

**Short answer:** Hardware and software variations. GPU floating-point operations can have slight non-determinism. Batch composition affects calculations. Model versions change. Even with temperature=0, the "most likely" token can vary by tiny margins that hardware inconsistencies tip differently. Seed parameters help but don't guarantee exact reproduction across systems. True determinism requires careful engineering.

---

## Q: If high temperature makes output "creative," does that mean creativity is just randomness?

**Short answer:** Not exactly. High temperature gives lower-probability options more chance—options the model considers plausible but not most likely. These might be unusual word choices, unexpected angles, surprising combinations. "Creative" in this sense means exploring less-trodden paths. Whether this constitutes real creativity or just random variation is a deeper question.

*→ Explore further: [Do LLMs Really Understand?]*

---

## Q: At temperature=2.0, would the model start producing gibberish?

**Short answer:** Yes, often. Very high temperatures flatten probability distributions so much that improbable tokens become too likely. You get grammatically broken text, nonsense words, bizarre tangents. Most practitioners stay in 0.5-1.0 range for usable output. Temperature above 1.5 is experimental. The model still works; it just wanders too far from coherent language.

---

## Q: Why do different providers default to different temperatures?

**Short answer:** Use case assumptions and tuning. A customer service chatbot should be consistent (low temperature). A creative writing tool should be varied (higher temperature). Providers choose defaults based on expected use. OpenAI's default is 1.0 (neutral). Other providers may tune differently. Always check the default and adjust for your needs.

---

## Q: Can I change temperature mid-conversation?

**Short answer:** Usually, yes. Each API call specifies temperature. You can use low temperature for factual questions, then high temperature for creative tasks, within the same session. The model doesn't have memory of temperature between calls—it just affects that specific generation. Dynamic temperature based on task type is a valid strategy.

*→ Explore further: [How Does Text Generation Actually Happen?]*

---

## Q: Building on the probability discussion—does the model output its probability distributions, or just the final tokens?

**Short answer:** Usually just tokens, but some APIs expose probabilities. OpenAI's API has a "logprobs" option that returns probability data for generated tokens. This is useful for research, confidence estimation, and analysis. But most users see only the sampled text, not the underlying distribution. The probabilities are computed but typically discarded after sampling.

*→ Explore further: [Why Do LLMs Make Things Up?]* (on confidence calibration)
