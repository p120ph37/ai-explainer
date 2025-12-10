# How Do Tokens Become Numbers? — Metaphor Voice

*Single-threaded narrative deeply immersed in metaphorical thinking.*

---

Imagine a vast map where every word has a location. Not a geographic map — this one has thousands of directions, not just north-south and east-west.

On this map, you can travel from "cold" toward "hot" by moving along a temperature direction. Travel from "walk" toward "run" along an intensity direction. Travel from "dog" toward "dogs" along a plurality direction.

Every word sits at the intersection of thousands of such directions. The location encodes not a position on Earth, but a position in meaning-space. Nearby words are semantically related. Distant words are unrelated.

This is the embedding space: a map where meaning is distance.

**The coordinate system of meaning**

When a token enters the model, it transforms into coordinates. Not x, y, z — but x₁, x₂, x₃, ... x₁₅₃₆. A point in 1536-dimensional space. Unvisualizable, but mathematically precise.

"Cat" lives at one point. "Dog" lives nearby. "Algorithm" lives far away. The model doesn't know these are words. It knows these are points, and it has learned which points cluster together.

The remarkable thing: these positions weren't designed. Nobody placed "king" near "queen." The placement emerged from reading billions of sentences and adjusting coordinates until words that appear in similar contexts ended up near each other.

**The arithmetic of analogy**

In this space, relationships are directions.

"King" minus "man" plus "woman" equals (approximately) "queen." The direction from "man" to "woman" is a vector, an arrow in this thousand-dimensional space. Apply that same arrow starting from "king," and you land near "queen."

This is analogy as geometry. A:B :: C:D means the arrow from A to B is parallel to the arrow from C to D. The embedding space has learned not just where words live but how they relate.

"Paris" minus "France" plus "Italy" lands near "Rome." Capital-of is a direction. Subtract one country, add another, and the direction takes you to the corresponding capital.

**The sculpted landscape**

Before training, the embedding space is featureless. Every word placed randomly, relationships non-existent.

Training is erosion. Billions of sentences flow through, and each one carves the landscape slightly. Words that appear together get pulled closer. Words that never co-occur drift apart.

Over time, structure emerges. Clusters form: animals here, colors there, technical terms in another region. Between clusters, gradients of relatedness. The flat randomness becomes a sculpted terrain where semantic mountains and valleys encode the patterns of human language.

**The migration of meaning**

In context, word meanings shift. "Bank" near "river" means something different from "bank" near "money."

The embedding gives each word a starting position, but attention and the network layers can migrate that position based on context. The word starts where its embedding places it, then moves through the space as the model processes surrounding words.

By the output layer, "bank" might have migrated toward financial territory or riparian territory, depending on context. The embedding is just the starting point. Context determines the journey.

**Different maps for different models**

Every model learns its own map. GPT-4's coordinates for "cat" have no relation to BERT's coordinates for "cat." The spaces are incompatible atlases of the same semantic territory.

This is why you can't mix embedding models. A search using one model's map won't find documents embedded with another model's map. The coordinates don't align. It's like giving London coordinates to someone using a New York grid.

**The foundation of understanding**

Embeddings are where symbols become math. A word is discrete — it's either "cat" or it isn't. A coordinate is continuous — it can be anywhere in space.

This continuity enables everything neural networks do with language. Similar meanings become similar coordinates. Relationships become vectors. Analogy becomes arithmetic. The discrete world of symbols connects to the continuous world of mathematical optimization.

When you hear that AI "understands" language, embeddings are the crucial transformation: the bridge from words you type to geometry the model can navigate.
