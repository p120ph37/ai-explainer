# How Do Tokens Become Numbers? — Experiential Voice

*Commentary on the three base voices, connecting concepts to likely reader experiences and suggesting interactive enrichments.*

---

## Experiential Anchors

### "It knows these things are related"

**The synonym understanding**: Ask about "cars" and the AI discusses "automobiles," "vehicles," and "transportation" fluidly. It's not matching keywords — it's working in embedding space where these words are neighbors.

**The conceptual leap**: Users experience the AI making connections that aren't literal word matches. Ask about "good places to eat" and it discusses "restaurants," "dining," and "cuisine." Embeddings enable these conceptual leaps.

---

### "Semantic search actually works"

**The search experience**: Users who've tried AI-powered search (Perplexity, ChatGPT with browsing, semantic doc search) experience finding relevant results even when exact keywords don't match. This is embedding-based similarity in action.

**Contrast with keyword search**: The experience of Google not finding something because you used different words, vs. AI search finding it because meanings are close in embedding space.

---

### "Recommendation systems"

**The "you might also like" experience**: Netflix, Spotify, Amazon — they all suggest related items. While they don't all use the same embedding techniques as LLMs, the concept of "similar things are nearby in some space" is familiar from these experiences.

---

## Suggested Interactive Elements

### 3D embedding space explorer

**Concept**: Navigate a 3D visualization of word relationships.

**Implementation**:
- Words as points in 3D space (projected from high dimensions)
- Zoom, rotate, pan
- Search for specific words
- See nearest neighbors
- Draw paths between words showing relationships

**Why it works**: Makes the "space where meaning is distance" tangible and navigable.

---

### Analogy calculator

**Concept**: Test the "king - man + woman = queen" arithmetic.

**Implementation**:
- Input: word1, word2, word3
- Compute: word1 - word2 + word3
- Show nearest neighbors to the result
- Works for many relationships: capitals, verb tenses, plurals
- Shows when it fails (illustrates limitations)

**Why it works**: The famous example becomes interactive and testable.

---

### Embedding similarity checker

**Concept**: Enter two pieces of text, see their similarity score.

**Implementation**:
- Two text input boxes
- Compute embeddings for each
- Show cosine similarity score
- Show where they'd be in 2D/3D space relative to each other

**Why it works**: Makes abstract "semantic similarity" concrete and measurable.

---

### Dimension mystery explorer

**Concept**: Try to figure out what dimensions mean.

**Implementation**:
- Show words ranked by their value on a specific dimension
- User tries to identify the pattern
- Some dimensions might suggest patterns (size? sentiment? abstractness?)
- Many dimensions will remain opaque

**Why it works**: Demonstrates that dimensions rarely have clean interpretations.

---

## Pop Culture Touchstones

**Spotify Wrapped**: Most people have seen their annual Spotify summary showing how their music taste clusters. Music embedding spaces organize songs by similarity. "Your taste is 73% similar to [artist]" is an embedding calculation.

**Netflix recommendations**: "Because you watched..." is familiar to everyone. The underlying technology involves mapping content to embedding spaces where similar things cluster together.

**"Vibes" as intuitive embedding**: When people say something has "similar vibes" to something else, they're describing intuitive semantic similarity. Embeddings formalize vibes into math.

**The "that's not what I meant" search experience**: Everyone has experienced a search engine returning results that matched keywords but missed meaning. This frustration is the gap that semantic embeddings help close.

---

## Diagram Suggestions

### The word galaxy

**Concept**: Words as stars in a galaxy, clustered by meaning.

**Implementation**:
- Large clusters: animals, colors, actions, places
- Smaller sub-clusters within each
- Gradients between clusters where meanings overlap
- Interactive: search for words, see where they live

---

### The analogy arrows

**Concept**: Show analogies as parallel arrows in embedding space.

**Implementation**:
- "man" and "woman" as points
- Arrow from man to woman
- "king" as a point
- Same arrow applied from king → lands near queen
- Multiple examples: country/capital, verb tenses, etc.

---

### The embedding lookup table

**Concept**: Show the simple mechanism: token ID → vector lookup.

**Implementation**:
- Table showing token IDs and their embedding vectors
- Animation: token enters → ID lookup → vector retrieved
- Show that this happens for every token in parallel

---

## Missed Connections in Base Voices

**The RAG experience**: Users who've used AI tools with document upload or connected data sources experience embedding-based retrieval. The system embeds their documents and their queries, then finds matches. This is embeddings in production.

**The "that's weirdly relevant" moment**: When AI surfaces something unexpectedly on-point, that's often embedding similarity working well — finding meaning-based connections that keyword matching would miss.

**The "context-appropriate suggestions" in code**: Developers using Copilot see context-appropriate suggestions (not just syntax-appropriate). The model's embeddings connect the meaning of surrounding code to relevant suggestions.

**Photo search on phones**: Many readers have used "search for beach photos" on their phone and seen it work. This is image embeddings — similar concept, different modality. The text experience connects to the image experience.
