# How Do Tokens Become Numbers? — Socratic Voice

*Narrative progressing through questions, leading discovery.*

---

Neural networks are mathematical functions. They take numbers in and produce numbers out. But when you type "Hello, how are you?", those aren't numbers. How does the model process them?

Through **embeddings**. Each token gets converted to a list of numbers — a vector — that represents its position in a mathematical space.

Where does this list come from?

A learned lookup table. The model has an embedding matrix with one row per vocabulary token. Token 9906 ("Hello") maps to row 9906 of this matrix, which contains (say) 1536 numbers.

Why 1536 numbers?

The dimension is a design choice. More dimensions allow more nuance but cost more compute. Modern models use hundreds to thousands of dimensions. GPT-3 uses 12288; smaller models might use 768.

Are these numbers arbitrary?

No — they're learned during training. Initially they might be random, but training adjusts them so that tokens with similar meanings end up with similar numbers.

How does that happen?

Through gradient descent, like all neural network learning. If the model would predict better with "cat" and "dog" having similar embeddings, the training process will nudge them closer.

Why would similar meanings need similar embeddings?

Because similar words can often substitute for each other. "The cat sat on the mat" and "The dog sat on the mat" are both reasonable sentences. If the model predicts one, it should probably assign similar probability to the other. Similar embeddings enable similar predictions.

So the embedding space is organized by meaning?

Roughly, yes. Words that appear in similar contexts cluster together. Technical terms cluster. Emotional words cluster. Names cluster.

But it's also organized by more subtle relationships. The classic example: "king" minus "man" plus "woman" approximately equals "queen."

What does that mean?

That relationships become directions in the space. The vector from "man" to "woman" represents something like "gender transformation." Apply that same vector starting from "king" and you land near "queen."

Is this programmed?

No. It emerges from training. The model saw enough examples of male/female pairs and royalty pairs that it learned to encode the relationship geometrically. Nobody specified what the dimensions should mean.

Do the dimensions have meaning?

Usually not in a human-interpretable way. You might hope dimension 47 represents "animate" or "positive," but typically each dimension captures some statistical pattern that doesn't map cleanly to concepts we have words for.

Meaning is distributed across dimensions rather than localized. "Animate" might be a direction (a combination of dimensions) rather than a single axis.

Do different models use the same embedding space?

No. Each model learns its own space. GPT-4's embedding for "cat" has completely different numbers than BERT's embedding for "cat."

This means embeddings from different models aren't compatible. You can't embed text with one model and search with another — the coordinate systems don't align.

What are "embedding models" used for retrieval?

Some models are trained specifically to produce embeddings where similarity in the space corresponds to semantic similarity. These are optimized for search, clustering, and classification rather than text generation.

OpenAI's text-embedding models, for example, are trained so that semantically related texts end up with high cosine similarity in the embedding space.

What should someone take away?

That embeddings are the bridge between text and mathematics. They convert discrete symbols into continuous geometry where neural network operations can work.

The organization of this geometry — which words are near which, which directions encode which relationships — emerges from training. It's not designed; it's discovered. And it's the foundation on which everything else in language AI builds.
