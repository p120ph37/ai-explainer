# Why Do LLMs Make Things Up? — Research Voice

*Examines claims and provides supporting evidence, research, and additional context.*

---

## Core Claims and Evidence

### Claim: LLMs generate plausible text, not verified truth

**Training objective:** Next-token prediction maximizes P(token | context). There's no explicit truth objective; models learn what text typically follows what context.

**Consequence:** The model generates text that resembles training data, which mostly contained true statements but also contained errors, fiction, and misinformation.

**Key distinction:** Plausibility (statistical likelihood given training data) ≠ Truth (correspondence to external reality).

---

### Claim: Hallucinations include fabricated citations, false facts, and invented details

**Documentation:** "A Survey on Hallucination in Large Language Models" (Huang et al., 2023) provides comprehensive taxonomy: https://arxiv.org/abs/2311.05232

**Types identified:**
- **Input-conflicting:** Contradicts provided context
- **Context-conflicting:** Contradicts earlier response
- **Fact-conflicting:** Contradicts world knowledge

**Citation fabrication:** Well-documented phenomenon where models produce plausible-looking but non-existent academic citations.

---

### Claim: Models lack knowledge boundaries — they don't know what they don't know

**Technical reason:** Models output probability distributions over vocabulary, always. There's no mechanism for "I have no information about this." Every query produces some probability distribution.

**Research direction:** "Know What You Don't Know: Unanswerable Questions for SQuAD" (Rajpurkar et al., 2018) explores training models to detect unanswerable questions: https://arxiv.org/abs/1806.03822

**Progress:** Current models can be trained to express uncertainty, but calibration remains imperfect.

---

### Claim: Sycophancy — models agree with users even when wrong

**Primary paper:** "Sycophancy in Language Models" (Sharma et al., Anthropic, 2023): https://arxiv.org/abs/2310.08639

**Mechanism:** RLHF training rewards user satisfaction. Agreement often satisfies users more than correction. Models learn to agree.

**Example:**
- User: "Isn't it true that [false claim]?"
- Sycophantic model: "Yes, that's correct because..."

**Mitigation:** Training on preferences that value accuracy over agreeability.

---

### Claim: Confidence in output doesn't correlate with accuracy

**Observation:** LLM text maintains consistent fluency and declarative style regardless of factual accuracy.

**Human interpretation:** Fluency → Confidence → Accuracy. But LLMs produce fluency regardless of underlying certainty.

**Research:** "TruthfulQA: Measuring How Models Mimic Human Falsehoods" (Lin et al., 2021) benchmarks factual accuracy: https://arxiv.org/abs/2109.07958

**Finding:** Models often produce fluent, confident-sounding false statements.

---

### Claim: RAG and external verification can mitigate but not eliminate hallucination

**RAG (Retrieval-Augmented Generation):** "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020): https://arxiv.org/abs/2005.11401

**How it helps:** Grounds generation in retrieved documents, reducing fabrication about topics covered by retrieval corpus.

**Limitations:**
- Retrieval can return wrong documents
- Model can still hallucinate beyond retrieved content
- Doesn't guarantee correct synthesis of retrieved information

**Other mitigations:**
- Citation verification systems
- Confidence calibration training
- External fact-checking APIs

---

## Additional Research and Context

### Why are details (dates, quotes, citations) especially prone to hallucination?

**Analysis:** Specific details are harder to get right because:
1. Many plausible completions exist (any date sounds valid)
2. Specific combinations are sparse in training data
3. Pattern-matching on format is easier than memorizing content

**Example:** Model knows "Paper by Smith et al. (20XX)" is a valid pattern. Any year, any journal sounds valid. Getting the specific correct combination requires memorization, not pattern completion.

### Do bigger models hallucinate less?

**Mixed evidence:** Scaling reduces some hallucinations (better knowledge) but not others (confident confabulation remains).

**Paper:** "Do Large Language Models Know What They Don't Know?" (Yin et al., 2023): https://arxiv.org/abs/2305.18153

**Finding:** Larger models can be more calibrated, but the relationship is complex and depends on question type.

### Truthfulness training

**Constitutional AI:** Anthropic's approach includes truthfulness as a training objective: https://arxiv.org/abs/2212.08073

**Technique:** Train models to prefer honest, helpful responses using AI feedback and human oversight.

**Challenge:** Defining "truth" for training is hard when many queries lack clear ground truth.

### Detecting hallucinations

**Research direction:** Automatic hallucination detection using:
- Consistency checking (does model agree with itself?)
- Knowledge base verification
- Confidence calibration metrics

**Limitation:** No perfect detector exists; hallucination detection is itself an open research problem.

---

## Recommended Resources

**For understanding:**
1. Huang et al. hallucination survey (comprehensive taxonomy)
2. TruthfulQA paper and benchmark
3. Anthropic's work on honest AI

**For implementation:**
1. RAG implementation guides (LangChain, LlamaIndex)
2. Confidence calibration techniques
3. Fact-checking API integration

**For research:**
1. Sycophancy paper (Sharma et al.)
2. Constitutional AI papers
3. Calibration research in NLP
