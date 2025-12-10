# How Does Attention Work? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking.*

---

Imagine a room where everyone can whisper to everyone else.

A hundred people sit in a circle. In the old architecture, messages passed person-to-person around the ring. By the time a message reached the far side, it was garbled, diluted, transformed by a hundred retellings.

Attention changes the room. Now everyone can whisper directly to everyone else. Each person chooses who to listen to based on what they need to know. Person 100 can directly consult person 3. The message arrives intact.

This is the revolution. Direct connections, regardless of distance. The room topology collapsed from a ring into a fully connected network where information flows wherever it's needed.

**The spotlight array**

Picture not one spotlight, but dozens, all controlled by different operators with different purposes.

One spotlight tracks grammar. When it reaches a verb, it shines back toward the subject. "Who is doing this action?"

Another spotlight tracks meaning. When it reaches a pronoun, it shines toward the referent. "What does 'it' refer to?"

Another spotlight tracks emotional tone. It shines toward words that signal sentiment.

These spotlights operate in parallel, each illuminating different patterns. The model sees through all of them simultaneously. This is multi-head attention: multiple ways of asking "what else in this context matters?"

**The query-key-value protocol**

Each position in the sequence does three things:

It broadcasts a **query**: "I'm looking for X." Maybe the query means "I need to find my subject" or "I need semantic context."

It broadcasts a **key**: "I contain Y." Maybe the key means "I'm a noun" or "I'm about animals."

It broadcasts a **value**: "If you attend to me, here's what you'll get." The actual information to be gathered.

Attention is matchmaking. Queries look for compatible keys. When they match, the value flows. When they don't, silence.

The beauty: none of this is programmed. The model learns what queries and keys to broadcast. Training discovers that verbs should query for subjects, that pronouns should query for noun antecedents, that conclusions should query for premises. The patterns emerge from the pressure to predict text well.

**The weighted council**

After matching queries to keys, each position has weights over every other position. Some weights are high: "listen carefully to this." Some are near zero: "ignore this."

Now each position takes a weighted vote. Every other position contributes its value, scaled by the weight. High-weight positions speak loudly. Low-weight positions barely whisper.

The result is a new representation: a synthesis of what this position found relevant throughout the context. The original token becomes enriched with information gathered from wherever attention directed.

**The quadratic tax**

The room's power comes with a cost. Everyone can whisper to everyone — but in a room of a million people, that's a trillion potential whispers.

Each position must consider every other position. Double the positions, quadruple the considerations. This is why context windows have limits. The attention mechanism scales poorly with length.

Researchers work on sparse rooms: not everyone can whisper to everyone, only to nearby neighbors or to designated hubs. This reduces cost but loses some of the magic. The tradeoffs are ongoing.

**The direct pathway**

Before attention, understanding a long document was like a game of telephone. Information at the beginning had to pass through every intermediate position to reach the end. With each step, it could degrade, distort, disappear.

Attention is a wormhole network. Position 1000 can reach directly back to position 1. No intermediate steps. No degradation. The connection is as fresh as if they were adjacent.

This is why Transformers handle long documents that previous architectures couldn't. The wormholes preserve information that the telephone game would have lost.

**The learned gaze**

What makes attention profound is that the patterns are learned, not designed.

Nobody programmed "when processing 'she,' attend to female names mentioned earlier." The model discovered this because it helps predict what comes after "she." Nobody programmed "when processing a conclusion, attend to the premises." The model discovered this because logical text follows logical patterns.

Attention is the mechanism. The specific attention patterns are emergent behaviors, crystallized from the pressure to predict text across all the patterns humans use.

When you see an LLM grasp a complex reference or follow a subtle argument, you're seeing attention patterns that the model taught itself. The gaze that connects distant parts of the text is the model's own creation.
