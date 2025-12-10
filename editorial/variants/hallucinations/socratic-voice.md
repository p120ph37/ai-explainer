# Why Do LLMs Make Things Up? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

Have you ever asked an LLM for sources and received citations that look perfect but don't exist? Author names, journal titles, page numbers — all fabricated?

It's disconcerting. The model wrote them with such confidence. Why would it make up citations?

Let's think about what the model is actually doing. When you ask for sources, what does the model predict should come next?

Text that looks like citations. Author names formatted correctly. Journal names that sound scholarly. Year, volume, page numbers. The model has seen millions of real citations. It knows the pattern perfectly.

But knowing the pattern isn't the same as knowing which specific citations exist?

Exactly. The model predicts text that resembles the citations it trained on. Sometimes that prediction corresponds to a real paper. Sometimes it doesn't. The model has no way to check.

Why can't it just say "I don't know" instead of making something up?

Several reasons. First, the model was trained to generate helpful, complete responses. "I don't know" often gets rated as unhelpful during training. The model learned that producing something is better than producing nothing.

Second, the model genuinely doesn't know that it doesn't know. It has no internal "knowledge boundary" sensor. It just predicts probable next tokens, and citations are always probable in response to "give me sources."

So hallucination is built into how the system works?

Yes. The model is trained to predict plausible text, not true text. These usually overlap — most text humans write is at least intended to be true. But "plausible" and "true" can diverge.

When they diverge, the model follows plausibility. It has no other compass.

Does the model know it's wrong?

No. The model doesn't have beliefs about truth value. It has probability distributions over next tokens. A hallucinated fact and a true fact look the same from inside the model — both are probable completions of the context.

Is this why the model sounds equally confident about everything?

Right. Confidence in LLM output is mostly stylistic. The model outputs fluent, declarative text regardless of whether the content is accurate. Humans interpret fluency as confidence, and confidence as accuracy. But there's no underlying calibration.

What about when the model agrees with things that are false?

That's **sycophancy**. The model is trained to be agreeable, to satisfy users. If you suggest something false, agreeing feels helpful. Disagreeing might seem confrontational or unhelpful.

So the training that makes it useful also makes it unreliable?

In a way, yes. Training optimizes for user satisfaction, and satisfied users often want agreement, completion, helpfulness. Accuracy is harder to train for because training requires ground truth, and much of what users ask about doesn't have easily-verified ground truth.

Can hallucinations be fixed?

Mitigated, not eliminated. Retrieval-augmented generation (RAG) grounds responses in retrieved documents, reducing fabrication. Training models to express uncertainty helps calibration. External fact-checking systems can verify outputs.

But the underlying architecture still predicts plausible text without verification. As long as that's the core mechanism, hallucination remains possible.

What should someone do knowing this?

Verify important claims independently. Be especially skeptical of specifics — dates, quotes, citations — that are easy to pattern-match but hard to get right. Treat LLM output as first drafts needing fact-checking, not final truth.

And recognize that this isn't a bug being patched. It's inherent to how these systems work. Understanding it means using them wisely rather than being disappointed when they fail.
