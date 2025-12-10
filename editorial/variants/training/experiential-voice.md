# How are LLMs Trained? — Experiential Voice

*Commentary on the three base voices, connecting concepts to likely reader experiences and suggesting interactive enrichments.*

---

## Experiential Anchors

### "How does it know so much?"

**The breadth surprise**: Every user has been surprised by the range of topics an LLM can discuss. "How does it know about 15th-century Venetian glassmaking AND Python debugging AND that obscure movie?" The answer — it trained on trillions of tokens from everywhere — explains the breadth.

**The knowledge cutoff experience**: Users have experienced asking about recent events and getting "I don't have information after [date]." This is the training data boundary made tangible.

---

### "It feels like it learned from Reddit/Wikipedia/Twitter"

**Recognizing the training data**: Users sometimes notice patterns — responses that feel "very Reddit," explanations that feel "like Wikipedia," responses with Twitter-like phrasing. They're detecting the training data through style patterns.

**The code completion feel**: Developers using Copilot or ChatGPT for code notice it suggests patterns from StackOverflow or popular GitHub repos. The model learned from what developers posted, so it reproduces those patterns.

---

### "It's scary how much compute this takes"

**The scale awareness**: Many readers have seen articles about AI training costs (hundreds of millions of dollars) or environmental impact (carbon footprint of training runs). This creates an ambient awareness that training is massively resource-intensive.

**The "why is it so expensive?" question**: API pricing feels abstract until you understand that behind every query is a model that cost enormous resources to create.

---

### "How can predicting text teach reasoning?"

**The intuition gap**: This is the experience of finding the explanation (prediction requires understanding) intellectually surprising. Readers who sit with this often have an "aha" moment when the logic clicks.

---

## Suggested Interactive Elements

### Mini training loop simulator

**Concept**: Simplified, visual version of the training loop.

**Implementation**:
- Small neural network (visualized as nodes and connections)
- Feed in text examples
- Show prediction, compare to actual, show error
- Animate weight adjustments
- Watch loss decrease over iterations

**Why it works**: Makes the abstract loop concrete and observable. Users can see "learning" happen visually.

---

### Training data explorer

**Concept**: Let users explore what kinds of data are in typical training sets.

**Implementation**:
- Categories: web pages, books, code, conversations, papers
- Sample snippets from each category
- Statistics: how much of each type
- Slider showing rough proportions

**Why it works**: Demystifies "trillions of tokens" by showing concrete examples.

---

### Loss curve visualization

**Concept**: Interactive chart showing loss decreasing during training.

**Implementation**:
- X-axis: training steps
- Y-axis: loss (prediction error)
- Animated line descending
- Annotations at key points: "still gibberish," "starting to make sense," "grammatical," "knows facts"

**Why it works**: Connects abstract "loss minimization" to observable progress.

---

### Training cost calculator

**Concept**: Estimate what it would cost to train a model of different sizes.

**Implementation**:
- Input: model size (parameters), dataset size, hardware choice
- Output: estimated cost in dollars, time, energy
- Compare to reference models (GPT-3, LLaMA, etc.)

**Why it works**: Makes the economics tangible.

---

## Pop Culture Touchstones

**The "10,000 hours to mastery" concept**: Malcolm Gladwell popularized this idea. LLMs are the extreme version — billions of "hours" of exposure to text. But unlike human mastery, it's exposure without experience, pattern recognition without lived understanding.

**Deepfake awareness**: Many readers are aware of deepfakes and the idea that AI can learn to imitate. LLM training is similar — learning patterns of human expression so well that the output seems human-generated.

**"Trained on the internet"**: This phrase has become common knowledge. Users understand, at least superficially, that AI learned from internet content. The training page deepens this surface understanding.

---

## Diagram Suggestions

### The data pipeline

**Concept**: Visual showing data sources flowing into training.

**Implementation**:
- Left side: various sources (web crawl, books, code, forums)
- Middle: processing (filtering, deduplication, tokenization)
- Right: model being trained
- Size of flows indicating proportion of each source

---

### Training stages ladder

**Concept**: Show the progression from pre-training through fine-tuning to RLHF.

**Implementation**:
- Three steps/stages
- Pre-training: massive, broad, foundational
- SFT: smaller, curated, instructional
- RLHF: even smaller, preference-based, behavioral
- Show what each stage teaches and how long/expensive each is

---

### The "what prediction requires" unpacking

**Concept**: Visual argument for why prediction leads to understanding.

**Implementation**:
- Start: "Predict the next word"
- Branch 1: "In mystery stories → need to track plot"
- Branch 2: "In code → need to understand logic"
- Branch 3: "In arguments → need to follow reasoning"
- Converge: "Good prediction across all domains requires something like understanding"

---

## Missed Connections in Base Voices

**The "it sounds like the internet" experience**: Users often notice that AI outputs have a certain "internet writing" quality — not quite like any individual person. This is the training data showing through. More explicit connection to this experience would help.

**The fine-tuning experience**: Users who've customized GPTs or used fine-tuned models experience the difference between base models and specialized ones. This is the SFT/RLHF stages in action.

**The "assistant persona" emergence**: Users might wonder why ChatGPT acts like an assistant rather than completing prompts like web pages. The answer is post-training (SFT/RLHF) — connecting this to user experience would help.

**The rate of improvement**: Users who've tracked AI progress over recent years have experienced rapid capability gains. This connects to the scaling laws — more compute, more data, predictable improvement.
