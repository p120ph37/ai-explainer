# What is Temperature in AI? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

Ask the same question to an LLM twice. Do you get the same answer?

Often not. Similar, usually. But not identical. Why?

Because generation involves sampling. At each token, the model computes probabilities for all possible next tokens. Then it samples from those probabilities. Sampling has randomness. Randomness produces variation.

But wait — why is there randomness at all? Shouldn't a computer give the same output for the same input?

It could. At temperature zero, it does. The model always picks the highest-probability token. Same input, same output, every time.

So why not always use temperature zero?

Try it. Ask the model to write a story at temperature zero. Then ask again. And again. What do you notice?

The outputs are identical. Exactly identical. The model is stuck in one path, the highest-probability path. Is that what you wanted from a story?

I suppose not. A story should have some surprise, some variation.

Exactly. And there's another problem. At temperature zero, models often fall into repetition loops. The same phrase becomes the most likely continuation of itself. Without randomness to break out, the model circles endlessly.

So randomness is necessary?

For many tasks, yes. But too much randomness is also bad. Crank the temperature high and the model starts making bizarre choices. A slightly unlikely word leads to a weirder context, which leads to even less likely continuations. The output becomes incoherent.

So temperature is a balance?

Right. Temperature controls how much randomness enters the sampling process.

How does it actually work?

The model outputs scores (logits) for every possible next token. These scores go through a formula that converts them to probabilities. Temperature divides the scores before that conversion.

What happens when you divide by a small number?

The differences between scores become larger. If one token had score 10 and another had score 8, dividing by 0.5 gives 20 and 16. After converting to probabilities, the higher score dominates even more than before.

And dividing by a large number?

The differences shrink. 10 and 8 divided by 2 become 5 and 4. Closer together. After probability conversion, the lower-scoring token has better odds than it would have otherwise.

So low temperature makes the model more confident in top choices, and high temperature spreads the probability around?

That's the key insight. Temperature reshapes the probability distribution without changing which tokens are more likely than which. It changes how much more likely.

Are there other ways to control sampling?

Yes. Top-k and top-p sampling cut off the tail of unlikely tokens entirely.

What does that mean?

Top-k says: only consider the k most likely tokens. Everything else gets zero probability, no matter the temperature.

Top-p says: only consider tokens until their cumulative probability reaches p. If the top 50 tokens together have 95% probability, and you set p=0.9, you might only sample from the top 30.

Why would you want that?

To prevent very unlikely tokens from ever being chosen. Even at moderate temperature, there's some chance of sampling a bizarre token. Top-k and top-p eliminate that tail risk.

Can you combine them?

Yes. A typical setup might be temperature=0.7, top_p=0.95, top_k=50. The distribution is moderately smoothed by temperature, then truncated to prevent outliers.

How do you choose the right settings?

Experiment. There's no formula. The right settings depend on your task.

Are there guidelines?

Loose ones. Low temperature for factual tasks, code, structured output. Medium for conversation and explanation. High for creative writing and brainstorming.

But you said to experiment?

Because those are guidelines, not rules. Some code benefits from higher temperature to explore alternatives. Some creative tasks need lower temperature to maintain coherence. You discover what works through iteration.

What should someone take away from understanding temperature?

That the model's output isn't deterministic by nature. It's probabilistic. You're sampling from a distribution, and temperature shapes that distribution.

This means you have control. If output is too random, turn down the dial. Too repetitive, turn it up. The model computes possibilities; temperature determines how you navigate them.
