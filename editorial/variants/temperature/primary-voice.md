# What is Temperature in AI? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**Why does the same prompt sometimes give different answers?**

When a model generates text, it doesn't simply pick the most likely next token. It samples from a probability distribution. This controlled randomness produces variety.

**Temperature** is the dial that controls this randomness. Low temperature makes the distribution sharper, concentrating probability on the most likely tokens. High temperature flattens the distribution, giving less likely tokens more chance.

**How temperature works**

The model outputs raw scores (called logits) for each possible next token. These scores are divided by the temperature value, then converted to probabilities through a softmax function.

- **Temperature = 0**: Always pick the highest probability token. Completely deterministic.
- **Temperature = 0.5**: Moderate sharpening. Top tokens become even more likely.
- **Temperature = 1.0**: Standard. Probabilities used as computed.
- **Temperature = 2.0**: Flattening. Less likely tokens get more chance.

Lower temperature means safer, more predictable text. Higher temperature means riskier, more surprising text.

**Why would you want randomness?**

For most language, there isn't one correct continuation. Ask someone "How was your weekend?" and there are thousands of valid responses. The model faces this situation at every token.

Without randomness, the model would always pick the highest-probability word. This causes problems:

**Repetition loops**: The same phrases keep being the most likely continuation of themselves. Without randomness to break out, the model circles.

**Mechanical tone**: Text becomes stilted and predictable. Variety disappears.

**Missing valid options**: A slightly less likely response might be perfectly good or even better for your purpose, but deterministic decoding never explores it.

Controlled randomness lets the model explore the space of reasonable responses, producing output that feels more natural and varied.

**When to use different temperatures**

**Low temperature (0-0.3)** — Use for tasks with "right" answers:
- Factual questions
- Code generation
- Data extraction
- Structured output

**Medium temperature (0.5-0.8)** — Use for general purposes:
- Conversation
- Explanations
- Problem-solving
- Most everyday tasks

**High temperature (1.0+)** — Use for creative exploration:
- Creative writing
- Brainstorming
- Generating alternatives
- When you want surprises

**What about other sampling parameters?**

Temperature isn't the only control. Two others appear frequently:

**Top-k sampling**: Only consider the k most likely tokens. If k=50, tokens ranked 51st and below are eliminated before sampling, no matter how reasonable they might be.

**Top-p sampling (nucleus sampling)**: Only consider tokens whose cumulative probability reaches p. If p=0.9, add tokens by probability until their sum reaches 90%, then sample from just those.

These parameters can combine. A common configuration: temperature=0.7, top_p=0.9. This provides variety while preventing very unlikely tokens from appearing.

**Is temperature=0 truly deterministic?**

Mostly, but not guaranteed. Sources of variation even at temperature=0:

- GPU floating-point operations can vary slightly between runs
- Batch composition might affect results
- API providers may use internal sampling even when you specify 0
- Model updates change behavior

If you need reproducibility, some APIs offer seed parameters. Even then, exact reproduction isn't guaranteed across hardware or model versions.

**How do you choose the right temperature?**

Experiment. There's no universally optimal setting. The right temperature depends on your task, your preferences, and what you're trying to achieve.

Start with a moderate temperature (0.7 is common) and adjust based on results. If output is too random or incoherent, lower it. If output is too repetitive or predictable, raise it.

**Temperature reveals something about LLMs**

The need for temperature settings shows that LLMs don't compute "the answer." They compute probability distributions over possible answers. Sampling from that distribution is where specific text emerges.

This is fundamentally different from calculators or search engines, which return definite results. The LLM sees multiple possibilities simultaneously. Temperature determines how it navigates them.
