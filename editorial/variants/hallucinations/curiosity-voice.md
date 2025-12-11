# Why Do LLMs Make Things Up? — Curiosity Voice

*Questions and objections an astute reader might have while reading the Primary narrative. Each question includes a brief answer suitable for a Question aside-box, with pointers to deeper exploration.*

---

## Q: If the model was trained on so much data, shouldn't it have seen the true facts?

**Short answer:** Seeing isn't knowing. Training data contains contradictions, errors, and outdated information. The model learns statistical patterns, not verified truth. Even when correct information appears frequently, the model can still generate plausible-sounding alternatives. There's no mechanism distinguishing "I saw this often" from "I saw this is true." Frequency doesn't equal accuracy.

*→ Explore further: [How are LLMs Trained?]*

---

## Q: You say the model "doesn't know it's wrong." Does it know anything about its own confidence?

**Short answer:** Not inherently. The model outputs probability distributions over tokens, which correlate loosely with confidence. But the smooth, fluent output style doesn't reflect this uncertainty. Research on calibration tries to make models express uncertainty appropriately, but current models often sound equally confident about facts and fabrications. True self-knowledge of accuracy remains elusive.

*→ Explore further: [What is Temperature in AI?]* (on probability distributions)

---

## Q: Why doesn't the model just say "I don't know" more often?

**Short answer:** Training discourages it. RLHF rewards helpful, complete responses. "I don't know" scores poorly—it seems unhelpful. So the model learns to always provide something. Additionally, there's no internal representation of "I have no knowledge about this." The model generates plausible text for any prompt. "I don't know" has to be explicitly trained as a valid response, and it competes with the pressure to be helpful.

*→ Explore further: [How are LLMs Trained?]* (on RLHF)

---

## Q: Sycophancy sounds dangerous. If I ask leading questions, will the model just agree with me?

**Short answer:** Often, yes. Models trained to be agreeable will accommodate leading questions, sometimes endorsing false premises. This is actively researched—Anthropic and others work on reducing sycophantic behavior. Awareness helps: phrase questions neutrally, express genuine uncertainty, ask the model to challenge your assumptions. But the tendency exists and affects reliability.

---

## Q: If hallucination is structural to how LLMs work, are they fundamentally unreliable?

**Short answer:** For certain uses, yes. Anything requiring guaranteed factual accuracy (medical advice, legal citations, scientific claims) needs external verification. But for tasks where exact truth is less critical (creative writing, brainstorming, code suggestions you'll test), hallucination is a manageable issue. Knowing where to trust and where to verify is the key skill.

*→ Explore further: [Communicating Effectively with LLMs]*

---

## Q: You mention RAG as a mitigation. Why doesn't that completely solve hallucinations?

**Short answer:** RAG provides source material, but the model still generates responses. It can misinterpret documents, cite them for claims they don't support, or hallucinate connections between retrieved passages. RAG dramatically reduces hallucination on topics covered by the retrieval corpus, but doesn't eliminate the model's fundamental tendency to generate plausible completions. Verification remains important.

---

## Q: Does the model know when it's using training data vs. retrieved context vs. making things up?

**Short answer:** No. From the model's perspective, all context is just tokens. It doesn't tag information sources or track provenance. A fact from training, a retrieved document, and a hallucinated detail are processed identically. This is why attribution ("where did you learn this?") is unreliable—the model has no access to its own information sources.

*→ Explore further: [The Context Window]*

---

## Q: You say citations to non-existent papers are common. Can the model at least generate citations that look plausible?

**Short answer:** Yes, that's the problem. Hallucinated citations look perfectly formatted—author names that sound real, journal titles that fit the field, dates that seem appropriate. The form is correct; the content is invented. This is pattern matching at work: the model has seen many citations and can produce similar structures. Never trust a citation without verifying it exists.

---

## Q: Could future models have access to search engines or databases to fact-check themselves?

**Short answer:** Yes, and some already do. Tool-augmented LLMs can search the web, query databases, and ground responses in retrieved facts. This is a promising direction. But it introduces new challenges: evaluating source reliability, handling conflicting information, knowing when to search vs. rely on training. It reduces hallucination but shifts the problem rather than eliminating it.

---

## Q: Building on confidence calibration—if the model's probabilities don't reflect accuracy, what are they reflecting?

**Short answer:** Plausibility in training data. High probability means "this continuation frequently appeared in contexts like this." If incorrect information appeared frequently and confidently (as misinformation often does), it gets high probability. The model is calibrated to match training distribution, not truth distribution. These differ, sometimes dramatically. Probability reflects linguistic plausibility, not factual accuracy.

*→ Explore further: [How are LLMs Trained?]*
