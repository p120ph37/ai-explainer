# How Do Tokens Become Numbers? — Primary Voice

*Single-threaded narrative in the primary style: question-led, direct answers, clear explanations.*

---

**Neural networks work with numbers. Text is words. How do you bridge that gap?**

When a token enters a neural network, it's immediately converted into a list of numbers called an **embedding**. The token "cat" might become something like [0.2, -0.5, 0.8, 0.1, ...], extending to hundreds or thousands of dimensions.

This isn't arbitrary. The embedding positions are learned during training. Tokens with similar meanings end up with similar number patterns. The geometry of this number space captures something about meaning.

**What does the embedding space look like?**

Each dimension in an embedding is like a coordinate axis. Two dimensions give you a flat plane. Three give you 3D space. Modern embeddings have 768, 1536, or even more dimensions. You can't visualize this directly, but the math works the same way.

In this space, tokens aren't scattered randomly. "King" and "queen" are near each other. "King" and "banana" are far apart. "Paris" and "France" are close. The distances and directions encode relationships.

**The famous example: king - man + woman = queen**

This arithmetic actually works (approximately) in embedding space.

Take the vector for "king." Subtract the vector for "man." Add the vector for "woman." The result is a vector very close to "queen."

What does this mean? The direction from "man" to "woman" captures something about gender. Apply that same direction to "king" and you get the corresponding gendered concept: "queen."

This isn't programmed. It emerges from training on text where these words appear in analogous contexts.

**How are embeddings learned?**

Through training, like everything else in neural networks. Initially, each token gets a random embedding. As the model trains on text prediction, it adjusts these embeddings.

If "cat" and "dog" appear in similar contexts ("The [X] sat on the mat"), their embeddings get pulled closer together. If "cat" and "algorithm" appear in different contexts, they drift apart.

Billions of training examples sculpt the embedding space until meaningful relationships emerge. The final embeddings encode statistical patterns of word usage across the entire training corpus.

**Dimensions don't have obvious meanings**

You might hope dimension 47 means "animate" and dimension 128 means "positive sentiment." It's not that clean.

Each dimension captures some statistical pattern, but these rarely map to human-interpretable concepts. The meaning is distributed across many dimensions. "Animate" might be a direction in the space (a combination of many dimensions) rather than a single axis.

Researchers study embedding spaces to find interpretable directions, but most dimensions remain opaque.

**Every model has its own embedding space**

Different models learn different embeddings. GPT-4's embedding for "cat" is completely different numbers than BERT's embedding for "cat." The spaces aren't compatible.

This matters when building applications. If you embed text with one model and try to search with another, the geometry doesn't match. You need to use the same embedding model consistently.

Some embedding models are trained specifically for retrieval: they optimize for meaningful similarity rather than text generation. These are what power semantic search.

**Why embeddings matter**

Embeddings are where symbols meet geometry. They're why neural networks can process language at all: they convert discrete tokens into continuous space where similarity, analogy, and relationship become mathematical operations.

When you search for similar documents, you're comparing embeddings. When a model understands that "automobiles" relates to "cars," embeddings make that connection. The entire edifice of modern language AI rests on this conversion of words to meaningful coordinates.
