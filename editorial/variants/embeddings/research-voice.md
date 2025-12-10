# How Do Tokens Become Numbers? — Research Voice

*Examines claims and provides supporting evidence, research, and additional context.*

---

## Core Claims and Evidence

### Claim: Embeddings convert tokens to dense vectors where similarity encodes meaning

**Foundational paper:** "Efficient Estimation of Word Representations in Vector Space" (Mikolov et al., Google, 2013) introduced Word2Vec and demonstrated meaningful embedding structure: https://arxiv.org/abs/1301.3781

**Key finding:** Words appearing in similar contexts have similar embeddings. This emerges from the distributional hypothesis: "a word is characterized by the company it keeps."

**Modern embeddings:** Current LLMs use contextual embeddings (different vectors for the same word in different contexts) rather than static embeddings (one vector per word). The lookup table provides the starting point; transformer layers provide context-dependent modifications.

---

### Claim: "King - man + woman ≈ queen" works in embedding space

**Source:** Word2Vec paper (Mikolov et al., 2013) popularized this analogy finding.

**Technical details:**
- Analogy is tested via: argmax(cosine_similarity(vec("king") - vec("man") + vec("woman"), vocabulary))
- Result is often "queen" but not always — depends on training data and embedding quality
- Works for many semantic relationships: capitals, verb tenses, plurals, etc.

**Caveats:** Later research showed these analogies are imperfect and sensitive to methodology. "Man is to Doctor as Woman is to Nurse" reveals biases in training data.

**Paper on biases:** "Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings" (Bolukbasi et al., 2016): https://arxiv.org/abs/1607.06520

---

### Claim: Embedding dimensions don't have obvious human-interpretable meanings

**Research on interpretability:**
- "Linear Algebraic Structure of Word Senses" (Arora et al., 2018) finds some structure in embeddings
- Most dimensions remain opaque
- Meaning is distributed across dimensions rather than localized

**PCA visualization:** Dimensionality reduction (PCA, t-SNE) reveals cluster structure but collapses information. The 2D/3D projections show relatedness but lose detailed structure.

**Tool:** TensorFlow Embedding Projector allows interactive exploration: https://projector.tensorflow.org/

---

### Claim: Different models have incompatible embedding spaces

**Why:** Embedding matrices are randomly initialized and trained independently. There's no canonical "correct" position for any word.

**Consequence:** Vectors from GPT-4 cannot be meaningfully compared to vectors from BERT. Cosine similarity between them is meaningless.

**Cross-model techniques:** "Aligning Word Vectors" research attempts to map between spaces, but results are imperfect: https://arxiv.org/abs/1710.04087

---

### Claim: Specialized embedding models exist for retrieval

**Examples:**
- OpenAI text-embedding-3: optimized for semantic similarity
- Sentence-BERT: https://arxiv.org/abs/1908.10084
- E5: https://arxiv.org/abs/2212.03533
- BGE: https://github.com/FlagOpen/FlagEmbedding

**Training objective:** Contrastive learning — similar pairs should have high similarity, dissimilar pairs should have low similarity.

**Use cases:** Semantic search, clustering, classification, RAG (retrieval-augmented generation)

**Evaluation:** MTEB benchmark compares embedding models on diverse tasks: https://huggingface.co/spaces/mteb/leaderboard

---

## Additional Research and Context

### Static vs contextual embeddings

**Static embeddings (Word2Vec, GloVe):** One vector per word, regardless of context. "Bank" has the same embedding whether referring to rivers or money.

**Contextual embeddings (BERT, GPT):** Vector depends on surrounding context. "Bank" in "river bank" vs "bank account" produces different vectors.

**Paper:** "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018): https://arxiv.org/abs/1810.04805

### Embedding dimensions and model size

**Typical dimensions:**
- GPT-2 small: 768
- GPT-3: 12,288
- LLaMA 7B: 4,096
- Modern embedding models: 768-1536

**Trade-off:** Higher dimensions capture more nuance but increase memory and compute costs.

### Probing embeddings

**Research approach:** Train simple classifiers on embeddings to test what information they encode.

**Findings:** Embeddings encode syntax, semantics, sentiment, and more — much more information than surface-level word meaning.

**Paper:** "A Structural Probe for Finding Syntax in Word Representations" (Hewitt & Manning, 2019): https://aclanthology.org/N19-1419/

### Compression and quantization

**Challenge:** Embedding matrices are large (vocab_size × dimensions). For 100K vocabulary and 4096 dimensions, that's 400M parameters just for embeddings.

**Solution:** Quantization, shared embeddings (input/output), and vocabulary optimization.

---

## Recommended Resources

**For understanding:**
1. "Word2Vec Tutorial" (Chris McCormick): http://mccormickml.com/2016/04/19/word2vec-tutorial-the-skip-gram-model/
2. TensorFlow Embedding Projector: https://projector.tensorflow.org/
3. StatQuest "Word Embedding and Word2Vec" video: https://www.youtube.com/watch?v=viZrOnJclY0

**For implementation:**
1. Sentence Transformers library: https://www.sbert.net/
2. OpenAI Embeddings API: https://platform.openai.com/docs/guides/embeddings
3. Hugging Face embedding models

**For research:**
1. Original Word2Vec paper (Mikolov et al., 2013)
2. GloVe paper (Pennington et al., 2014): https://aclanthology.org/D14-1162/
3. MTEB benchmark and leaderboard
