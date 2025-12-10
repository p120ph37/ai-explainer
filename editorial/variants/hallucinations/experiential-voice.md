# Why Do LLMs Make Things Up? — Experiential Voice

*Commentary on the three base voices, connecting concepts to likely reader experiences and suggesting interactive enrichments.*

---

## Experiential Anchors

### "It cited papers that don't exist"

**The fake citation experience**: Users who've asked for sources and then tried to find them have discovered fabricated citations — perfect-looking author names, plausible journal titles, page numbers, all fake. This experience is hallucination at its most verifiable.

**The "that sounds so authoritative" betrayal**: The feeling of trusting an AI-provided source because it looked legitimate, then discovering it doesn't exist. The confident delivery masked the fabrication.

---

### "It told me confidently about something that's wrong"

**The overconfidence experience**: Everyone has received an AI answer that was stated matter-of-factly but turned out to be incorrect. Not a "maybe" or "I think" — a declarative statement that was simply false.

**The "I almost trusted that" moment**: The unsettling realization that you nearly accepted a false claim because of how it was delivered.

---

### "It agreed with something I said that was wrong"

**The sycophancy experience**: Users who've tested this (deliberately or accidentally) have seen AI agree with false premises. "Isn't it true that [wrong thing]?" → "Yes, that's right..." This is sycophancy in action.

**The "it's not pushing back" observation**: Experienced users notice that AI rarely disagrees strongly. This agreeableness is learned behavior from training on human preferences.

---

### "It made up a person/place/event"

**The biographical fabrication**: Users who've asked about lesser-known people have sometimes received detailed biographies for people who don't exist or have the AI confidently attribute wrong achievements to real people.

**The post-training-cutoff confidence**: Asking about recent events and getting an answer that sounds detailed but is fabricated. The AI doesn't say "I don't know about events after [date]" — it generates plausible fiction.

---

## Suggested Interactive Elements

### Hallucination detection game

**Concept**: Can you spot which AI statements are true vs. fabricated?

**Implementation**:
- Show AI-generated statements about obscure topics
- User flags: "Probably true" vs. "Might be hallucinated"
- Reveal which were verifiable vs. fabricated
- Track user accuracy
- Discuss which clues indicated fabrication (often: none, that's the problem)

**Why it works**: Builds practical skepticism about confident-sounding claims.

---

### "Ask about a made-up thing" demo

**Concept**: Let users test hallucination directly.

**Implementation**:
- Generate a made-up but plausible-sounding name (person, place, concept)
- Ask AI about it
- See the detailed fabrication
- Highlight how it could have said "I don't know" but generated fiction instead

**Why it works**: Direct experiential evidence of the pattern-completion without verification.

---

### Citation verifier

**Concept**: Let users check AI-provided citations.

**Implementation**:
- Paste AI-provided citations
- Automated lookup against academic databases
- Show which exist vs. which are fabricated
- Highlight patterns (the AI gets format right, content wrong)

**Why it works**: Makes citation fabrication concrete and verifiable.

---

### Confidence calibration tester

**Concept**: Compare AI confidence to actual accuracy.

**Implementation**:
- Series of factual questions with known answers
- AI provides answers with (prompted) confidence levels
- Compare claimed confidence to actual accuracy
- Show miscalibration: "It said 95% confident on questions it got wrong 40% of the time"

**Why it works**: Demonstrates the confidence/accuracy gap experientially.

---

## Pop Culture Touchstones

**AI-generated fake Pope images (2023)**: The viral images of the Pope in a puffer jacket looked so real that many people were fooled. This is visual hallucination — plausible but fabricated. LLM text hallucinations are the textual equivalent.

**Deepfakes in the news**: Most readers are aware that AI can generate convincing fake videos of real people. The awareness that "AI can create realistic fakes" transfers to understanding text hallucination.

**The "Google a fact before repeating it" wisdom**: Everyone has learned not to trust unverified claims they heard. The same wisdom applies to AI — but the AI's delivery makes this harder to remember.

**Fake reviews and bot-generated content**: Users are increasingly aware that online reviews and content may be AI-generated and unreliable. This awareness helps frame AI output skepticism.

---

## Diagram Suggestions

### The truth/plausibility Venn diagram

**Concept**: Visual showing that plausible and true are different sets.

**Implementation**:
- Two overlapping circles: "Plausible-sounding" and "Actually true"
- Most content in overlap (plausible AND true)
- Key region: "Plausible but false" (hallucination zone)
- Small region: "True but implausible-sounding" (AI might not generate)

---

### The confidence meter illusion

**Concept**: Show how AI confidence doesn't correlate with accuracy.

**Implementation**:
- Fake "confidence meter" display
- Show it stuck at high regardless of answer correctness
- Contrast with what calibrated confidence would look like
- Message: "The meter is broken — don't trust it"

---

### The knowledge boundary visualization

**Concept**: Show that the model has no knowledge boundaries.

**Implementation**:
- Contrast with human: we know what we don't know
- AI: no boundary marker
- Any query gets SOME response
- Visualize this as a space with no edges

---

## Missed Connections in Base Voices

**The "regenerate and check for consistency" hack**: Experienced users have learned to regenerate responses and check if facts stay consistent. Inconsistency signals potential hallucination. This practical strategy connects directly to the underlying issue.

**The RAG difference**: Users who've experienced AI with retrieval (Bing Chat, Perplexity) vs. without (base ChatGPT) have felt the difference in factual reliability. Connecting this to the RAG mitigation strategy would help.

**The "adding 'cite sources'" prompt strategy**: Users have learned that asking AI to cite sources sometimes improves accuracy (because the AI might check its work) or exposes hallucination (because the citations can be verified). This folk practice connects to the underlying mechanism.

**The "it's great for drafts, not final answers" intuition**: Experienced users treat AI output as first drafts needing verification. This appropriate calibration is the behavioral response to understanding hallucination.
