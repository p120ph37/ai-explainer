# How Do Tokens Become Numbers? — Curiosity Voice

*Questions and objections an astute reader might have while reading the Primary narrative. Each question includes a brief answer suitable for a Question aside-box, with pointers to deeper exploration.*

---

## Q: "King - man + woman = queen"—does that actually work, or is it a cherry-picked example?

**Short answer:** It works, approximately. The classic example comes from Word2Vec research that genuinely demonstrated this arithmetic. But it's not perfect—you typically get "queen" among the top results, not exactly. And many analogies fail entirely. The example illustrates a real phenomenon (directions in embedding space encode relationships) without being universally reliable. It's a useful metaphor, not a guaranteed technique.

*→ Explore further: [How are LLMs Trained?]* (on how these relationships emerge from training)

---

## Q: You say dimensions don't have obvious meanings. Is there any way to interpret what the model has learned?

**Short answer:** This is active research—the field of "interpretability." Researchers probe embeddings to find meaningful directions (gender, sentiment, topic). Sometimes they succeed; often the meaning is distributed in ways that resist simple interpretation. It's like asking what each neuron in a brain "means." We can find some interpretable features, but the full picture remains elusive.

*→ Explore further: [Do LLMs Really Understand?]*

---

## Q: If each model has different embeddings, how do systems that combine models work?

**Short answer:** They typically don't mix embeddings directly. Multi-model systems either use one model's embeddings consistently, convert between spaces with learned transformations, or pass text (not embeddings) between models. When you hear about "embedding search" or "semantic search," a single embedding model is used consistently. Mixing embedding spaces without translation produces nonsense.

---

## Q: How can hundreds or thousands of dimensions encode meaning better than, say, 10?

**Short answer:** More dimensions = more room to encode distinctions. In 2D, you can only separate points in a plane. In 768D, you have vastly more ways to position concepts. Related terms cluster, but "related" has many dimensions: semantic, syntactic, topical, connotative. High-dimensional space lets the model encode all these relationship types simultaneously without forcing artificial tradeoffs.

*→ Explore further: [What are Parameters?]*

---

## Q: You mentioned embeddings trained "specifically for retrieval." What's different about them?

**Short answer:** Training objective differs. Standard LLM embeddings are optimized for next-token prediction. Retrieval embeddings are optimized for similarity: queries and relevant documents should be close, irrelevant documents far. This produces different geometry—better for search tasks but not interchangeable with generation embeddings. Models like OpenAI's embedding API are retrieval-optimized.

*→ Explore further: [How are LLMs Trained?]*

---

## Q: When embeddings "drift" during training, how does the model maintain stable meanings?

**Short answer:** It doesn't maintain anything explicitly. Meanings aren't stored—they're emergent from prediction tasks. If "cat" and "dog" embeddings drifted apart, predictions involving them would worsen, and gradients would push them back. Stability emerges from consistent training pressure, not from any mechanism "remembering" where words should be. The training data anchors the geometry.

---

## Q: Isn't this just a fancy lookup table? Token ID → vector?

**Short answer:** At inference time, yes—it's a lookup. But the *values* in that table were learned through training, encoding statistical patterns from trillions of word co-occurrences. A random lookup table wouldn't capture meaning. The magic isn't in the lookup mechanism but in what training discovered should be looked up. The vectors themselves are the learned knowledge.

*→ Explore further: [What are Parameters?]* (embeddings are parameters)

---

## Q: If embeddings encode meaning, why can't we just compare embeddings to detect lies or hallucinations?

**Short answer:** Embeddings encode statistical patterns from training text—not truth. "The Earth is flat" has a coherent embedding because that sentence exists in training data. The embedding captures that it's a claim about Earth's shape, not whether it's true. Detecting falsehood requires grounding in reality that embeddings don't provide. They encode plausibility, not accuracy.

*→ Explore further: [Why Do LLMs Make Things Up?]*

---

## Q: Could you visualize embedding space? What would it look like?

**Short answer:** Not directly—humans can't perceive 768 dimensions. Researchers use dimensionality reduction (t-SNE, UMAP) to project embeddings into 2D or 3D. These visualizations show clusters (similar words group together) and can reveal structure, but they're lossy projections. It's like a shadow of a higher-dimensional object—informative but incomplete.

---

## Q: Building on earlier about model differences—if I embed text with Model A then search with Model B, I get garbage?

**Short answer:** Exactly. Each model's embedding space has arbitrary axes. "Cat" might be positive on dimension 47 in Model A and negative in Model B. The spaces aren't aligned without explicit transformation. Always use the same embedding model for encoding and retrieval. This is why embedding choice is an architectural decision that persists throughout a system's lifetime.
