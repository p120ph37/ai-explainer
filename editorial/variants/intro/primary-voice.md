# What is an LLM? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations. No asides or expandables.*

---

**What actually happens when you talk to ChatGPT?**

When you type a message and hit send, the system receives your text and does something that sounds almost disappointingly simple: it predicts what text should come next.

That's the core of what a Large Language Model does. Given some text, predict what text would naturally follow. Your prompt becomes the beginning; the model's response is its best guess at a plausible continuation.

**If it's just predicting text, why does it seem to understand things?**

The model was trained by showing it enormous amounts of human writing — books, websites, conversations, code — and asking it, over and over: what comes next?

To predict well across such diverse text, the model had to develop something resembling comprehension. Consider what good prediction requires. To predict how a mystery story continues, you need to track clues and suspects. To predict the next line of code, you need to grasp what the code is doing. To predict how a physics explanation continues, you need to follow the logical thread.

Prediction, at sufficient scale, requires building internal models of how the world works. Not because understanding was the goal, but because understanding is useful for prediction.

**Why "Large"? What's different from autocomplete on my phone?**

Your phone's predictive text uses a small model that considers maybe a sentence and suggests common words. An LLM uses billions of parameters, considers thousands of words of context, and has absorbed patterns from trillions of words of training data.

This isn't just "bigger and more." Scale creates qualitative change. A small model learns that "Paris" often follows "The capital of France is." A larger model can write you a detailed historical analysis of Parisian urban development, synthesizing information it never saw combined in training.

Researchers call these emergent capabilities: abilities that arise spontaneously as models grow larger, without being explicitly programmed. Nobody taught the model to summarize documents or translate between languages it rarely saw paired. These abilities crystallized from the pressure to predict text at massive scale.

**How does it generate long, coherent responses?**

One token at a time. Tokens are chunks of text, typically words or word-pieces. The model generates a probability distribution over all possible next tokens. It samples from that distribution, adds the chosen token to the context, and repeats. A multi-paragraph response emerges token by token, each one conditioned on everything that came before.

This is why the same prompt can yield different responses. The sampling process has randomness built in. At each step, the model might choose the most likely token, or it might choose a less likely but still reasonable one. This controlled randomness produces variety and prevents the output from becoming repetitive.

**Why would you want randomness in the answer?**

For language, there usually isn't one correct continuation. Ask someone "How was your weekend?" and there are thousands of valid responses. The model faces the same situation at every token.

Without randomness, the model would always pick the highest-probability word. This sounds ideal but causes problems. The output becomes repetitive and mechanical. The model can get trapped in loops, repeating phrases because they keep being the most likely continuation of themselves.

Randomness lets the model explore the space of reasonable responses. You can adjust this through a parameter called "temperature." Lower temperature means more predictable, focused responses. Higher temperature means more creative, surprising ones.

**What does this mean for how you use AI?**

Understanding how LLMs work changes how you evaluate them.

When someone says an LLM "knows" something, you now understand: it has learned patterns around that concept. When it makes a confident mistake, you understand why: it predicted a plausible-sounding continuation that happened to be false. When new capabilities emerge in larger models, you can place them in context: better prediction enabling new behaviors.

You're not working with a magical oracle or a search engine with personality. You're collaborating with a sophisticated pattern-matcher that has absorbed more human writing than any person could read in a thousand lifetimes. Its strengths and limitations flow directly from what it is: a system that learned to predict text, and in doing so, learned something about the world the text describes.
