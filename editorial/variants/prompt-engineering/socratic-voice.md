# Communicating Effectively with LLMs — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

Why do small changes in how you phrase a request lead to dramatically different responses?

Because the model takes your words literally, as context. Every word shapes what comes next. Different words, different context, different predictions.

So the model is sensitive to exact phrasing?

Very. This sensitivity is what makes prompt engineering matter. Small adjustments can transform results.

What's prompt engineering?

The practice of crafting inputs to get better outputs. Learning what phrasing, structure, and context help the model produce what you want.

Is there a formula?

No universal formula, but there are patterns that help.

Like what?

First: be specific. "Tell me about dogs" is vague. "Explain how dogs were domesticated from wolves, focusing on the timeline and genetic evidence" is specific. Specificity focuses the model.

Why does specificity help?

It reduces the space of reasonable responses. Given a vague prompt, the model must guess what you want. Given a specific prompt, it has clearer direction.

What about context?

Equally important. The model only knows what's in the context window. If you want it to write for beginners, say "explain this for beginners." If you want formal tone, say so. Don't assume it knows your situation.

What are "few-shot examples"?

Showing the model what you want by giving examples before your actual request. "Here are three examples of input-output pairs. Now do the same for this new input."

Why does that work?

Pattern matching. The model sees your examples and continues the pattern. This often communicates format and style better than description.

What about "chain of thought"?

Asking the model to show its reasoning. "Think step by step" or "Explain your reasoning before giving the answer."

Does that actually help accuracy?

Yes, for complex problems. The model does computation through the tokens it generates. Reasoning tokens are where thinking happens. Skip them and you skip some computation.

So the output is part of the computation?

Exactly. That's why asking for reasoning often improves results — you're giving the model more tokens to think with.

What if the prompt doesn't work?

Iterate. Try something, see the result, adjust. Prompting is usually a conversation, not a one-shot command.

Common adjustments?

If output is too broad, add constraints. If too narrow, remove some. If format is wrong, provide examples. If accuracy is low, ask for reasoning. Each iteration teaches you about the model's tendencies.

Are there limits to what prompting can do?

Yes. Prompting can't create capabilities that don't exist in the model. And it can't guarantee consistency — some variation is inherent due to sampling.

So prompting is steering, not programming?

Good way to put it. You're guiding a capable system, not specifying exact behavior. Good prompts make desired outputs more likely, not certain.

What should someone learning prompting focus on?

Start with clarity and specificity. Then learn to provide context. Then experiment with examples and chain-of-thought. Most importantly: iterate. Watch what works and what doesn't for your specific use cases.

Prompting is a skill that improves with practice.
