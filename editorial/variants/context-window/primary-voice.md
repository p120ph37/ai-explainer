# The Context Window — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**Why does ChatGPT sometimes "forget" what you told it earlier?**

It hasn't forgotten. It simply can't see that part of your conversation anymore.

LLMs have a **context window**: a maximum number of tokens they can consider at once. Everything the model knows about your conversation must fit within this window. Your messages, its responses, any system instructions — all of it competes for the same limited space.

When a conversation grows too long, older content gets pushed out. The model isn't storing memories elsewhere. If it's outside the window, it's gone.

**How big is the context window?**

It varies by model and keeps growing:

- GPT-3 (2020): 4,096 tokens (~3,000 words)
- GPT-4 (2023): 128,000 tokens (~100,000 words)
- Claude 4.5 (2025): 200,000 tokens (~150,000 words)
- Gemini 2.0 (2025): 2,000,000 tokens (~1.5 million words)

These numbers sound large, but they fill up quickly. A back-and-forth conversation accumulates tokens fast. Every message you send, every response generated, every piece of context provided by the application — all counts against the limit.

**What happens when you hit the limit?**

Different systems handle this differently:

**Truncation:** The oldest messages simply get dropped. You keep chatting, but the model's view of history slides forward, forgetting the beginning.

**Summarization:** Some systems periodically compress older conversation into a shorter summary, preserving key points while freeing tokens.

**Refusal:** Some systems tell you the context is full and you need to start a new conversation.

The application you're using makes this choice, often invisibly. When an AI assistant suddenly seems to lose track of your project, it may have silently truncated your earlier context.

**Why can't they just make it bigger?**

They're trying. Context windows have grown dramatically. But there are real constraints.

**Computational cost scales with context length.** The attention mechanism requires comparing every token to every other token. Double the context, roughly quadruple the computation.

**Quality can degrade with length.** Models trained on shorter contexts may struggle to use very long ones effectively. Research shows that information in the middle of long contexts often gets less attention than information at the beginning or end.

**Memory requirements grow.** Long contexts require storing more intermediate values. A million-token context needs substantially more GPU memory than a thousand-token one.

**What about the "lost in the middle" problem?**

This is a documented phenomenon. LLMs attend well to the beginning of the context (primacy) and the end (recency), but middle content can get overlooked.

Put critical information at page 50 of a 100-page document, and the model may effectively ignore it, even though it's technically within the context window. Researchers are working on architectures that handle long contexts more uniformly, but it remains an open challenge.

**What does this mean for how you use AI?**

Understanding context windows changes how you interact:

**Front-load important information.** Put critical context early in your prompt where it's less likely to be truncated and more likely to receive attention.

**Be concise.** Verbose prompts waste tokens. Every unnecessary word is space that could hold useful context.

**Start fresh when needed.** If a conversation has gone on too long and the AI seems confused, starting a new conversation with a clear summary of relevant context often works better than continuing.

**Provide context explicitly.** Don't assume the model remembers previous conversations. Each session typically starts with an empty context window.

**The context window shapes AI limitations**

Many limitations people attribute to AI "intelligence" are actually context window constraints.

Can't maintain a coherent project over weeks? Context window. Contradicts earlier statements? Context window. Needs repeated reminders? Context window.

As context windows grow, some limitations ease. But the fundamental constraint remains: the model can only reason about what it can currently see. There's no background knowledge store, no long-term memory, no filing cabinet. Everything happens on a desk of limited size, and when the desk fills, things fall off.
