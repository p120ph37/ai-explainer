# What is an LLM? — Curiosity Voice

*Questions and objections an astute reader might have while reading the Primary narrative. Each question includes a brief answer suitable for a Question aside-box, with pointers to deeper exploration.*

---

## Q: If it's "just" predicting text, how is that different from a really fancy autocomplete?

**Short answer:** Scale creates qualitative change. Your phone predicts the next word from a sentence. An LLM predicts from hundreds of thousands of words of context using billions of learned parameters. At some point, "predicting well" requires modeling the world—understanding causation, logic, social dynamics, physics. The gap between suggesting "you" after "thank" and writing a coherent essay on quantum entanglement isn't just more of the same.

*→ Explore further: [Why Does Scale Matter?]*

---

## Q: You say it "learned something about the world"—but it's never experienced the world. Can you really learn about something you've never touched?

**Short answer:** The model learns about the world indirectly, through descriptions of it. Humans who read about Antarctica without visiting it still learn about Antarctica. Text encodes vast amounts of world-knowledge: physics, relationships, consequences. The model absorbs these patterns. Whether this constitutes "real" understanding is genuinely debated—but the functional knowledge is demonstrably there.

*→ Explore further: [Do LLMs Really Understand?]*

---

## Q: If it's sampling randomly, how can it be reliable? Wouldn't you get garbage sometimes?

**Short answer:** The randomness is *controlled*. At low temperatures, the model strongly favors high-probability tokens—so outputs are consistent and predictable. Randomness only kicks in meaningfully for creative tasks or when you deliberately want variation. And "high probability" isn't random—it reflects billions of training examples of what good continuations look like.

*→ Explore further: [What is Temperature in AI?]*

---

## Q: What stops it from just memorizing the training data and regurgitating it?

**Short answer:** Several things. First, there's vastly more possible text than training examples—the model *must* generalize to produce novel combinations. Second, memorization is tested for and actively reduced during training. Third, the model demonstrably handles questions and scenarios that didn't exist in its training data. Memorization happens in spots, especially for famous text, but generalization is the dominant behavior.

*→ Explore further: [How are LLMs Trained?]*

---

## Q: "Emergent capabilities"—that sounds like hand-waving. Isn't this just a fancy way of saying "we don't know how it works"?

**Short answer:** Partly fair. Emergence is a real phenomenon (water from molecules, consciousness from neurons), but calling something "emergent" doesn't explain the mechanism. What we can say: certain capabilities appear at scale thresholds, they weren't explicitly programmed, and we're actively researching why. The term describes something real even if we can't fully explain it yet.

*→ Explore further: [What is Emergent Behavior?]*

---

## Q: If it's just predicting "plausible" text, what happens when plausible and true diverge?

**Short answer:** The model outputs plausible falsehoods—confidently stated errors known as "hallucinations." It has no fact-checker, no access to ground truth. It only knows "this sounds like how accurate text is structured." When topics are rare, recent, or specialized, the model pattern-matches on surface features rather than verified truth. This is why you verify LLM output on anything that matters.

*→ Explore further: [Why Do LLMs Make Things Up?]*

---

## Q: You say each token is conditioned on "everything that came before"—but how does it actually keep track of thousands of words?

**Short answer:** Through a mechanism called attention. At each position, the model computes relevance scores for all previous positions and creates a weighted combination. It doesn't "remember" in a human sense—it recalculates relationships every time. This is computationally expensive (which is why context windows have limits), but it allows direct connections between any two positions regardless of distance.

*→ Explore further: [How Does Attention Work?]*

---

## Q: You mention the model was trained on "trillions of words"—where did all that text come from? Does it include my emails?

**Short answer:** Mostly public web content: websites, books, code repositories, forums, Wikipedia. Training data is scraped at scale, often from Common Crawl archives. Private emails, DMs, or locked content typically aren't included—but training data composition isn't always fully disclosed. The ethics of training data sourcing (consent, copyright, representation) are active areas of debate.

*→ Explore further: [How are LLMs Trained?]*

---

## Q: If two people ask the same question, do they get the same answer?

**Short answer:** Usually similar, but not identical (unless temperature is set to zero). The model samples from probability distributions, so there's inherent variation. Same prompt → same probability distribution, but different random draws. At low temperature, outputs converge. At high temperature, they diverge more. Some applications cache common queries to ensure consistency.

*→ Explore further: [What is Temperature in AI?]*

---

## Q: This all sounds expensive. How much does it actually cost to run one of these models?

**Short answer:** Significant. Each response requires billions of mathematical operations across specialized hardware. A single query costs fractions of a cent, but at millions of users, that's massive infrastructure. Training costs tens to hundreds of millions of dollars. Inference costs scale with usage. The business model depends on the marginal cost of a query being low enough to sustain at scale.

*→ Explore further: [How Does Text Generation Actually Happen?]*

---

## Q: Building on earlier—if it costs so much to train, how do smaller companies compete?

**Short answer:** They mostly don't train from scratch. They use pre-trained models (open-source or via API) and fine-tune them for specific tasks. Fine-tuning costs orders of magnitude less than training from zero. This is why frontier models come from well-funded labs, while applications are built by everyone else using those models as foundations.

*→ Explore further: [What are Parameters?]*
