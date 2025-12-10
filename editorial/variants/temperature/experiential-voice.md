# What is Temperature in AI? — Experiential Voice

*Commentary on the three base voices, connecting concepts to likely reader experiences and suggesting interactive enrichments.*

---

## Experiential Anchors

### "Why did it give me something different this time?"

**The variation experience**: Anyone who's regenerated a response has seen variation. Sometimes the new response is better; sometimes worse; sometimes surprisingly different. This is temperature (and sampling) in action.

**The "I liked the first one better" moment**: Users often regenerate hoping for improvement, then wish they'd kept the original. This experience is exploring the probability distribution — each sample is different, and "better" is subjective.

---

### "Sometimes it's too boring, sometimes it's too weird"

**The quality oscillation**: Users have experienced AI outputs that feel mechanical and predictable (low temperature feel) versus outputs that seem creative but occasionally nonsensical (high temperature feel). This oscillation is the temperature tradeoff felt intuitively.

**Creative writing vs. code generation**: Users who've used AI for both often develop different intuitions. "When I want code, I want it predictable. When I want stories, I want surprise." This is naturally discovering when different temperature settings are appropriate.

---

### "It keeps repeating itself"

**The repetition trap**: At very low temperatures, users sometimes encounter responses that loop or repeat phrases. This is the determinism problem — the highest-probability continuation keeps being the same phrase.

**Breaking out with regeneration**: Users learn that regenerating (effectively re-sampling) breaks loops. This is folk knowledge about the temperature/sampling mechanism.

---

### "The settings menu is confusing"

**Power user discovery**: Users who've explored ChatGPT's memory settings, Claude's project settings, or API parameters have encountered temperature sliders. The confusion about what they do is the gap this page addresses.

---

## Suggested Interactive Elements

### Temperature comparison tool

**Concept**: Same prompt, multiple temperatures, side-by-side outputs.

**Implementation**:
- Enter one prompt
- Generate at 0.0, 0.5, 0.8, 1.0, 1.5
- Display outputs in columns
- Highlight differences and similarities

**Key demonstration**: Run it multiple times at each temperature. Low-temp outputs are nearly identical each time. High-temp outputs vary dramatically.

**Why it works**: Makes the abstract "randomness dial" experiential.

---

### Probability distribution visualizer

**Concept**: Show how temperature reshapes the token probability distribution.

**Implementation**:
- Bar chart of top-10 token probabilities
- Slider for temperature
- Watch bars change as temperature adjusts:
  - Low temp: top bar dominates, others shrink
  - High temp: bars become more equal

**Why it works**: Visualizes the mathematical effect of dividing logits by temperature.

---

### "Spot the temperature" game

**Concept**: Given outputs, guess the temperature setting.

**Implementation**:
- Show 5 responses to the same creative prompt
- User guesses: high temp, medium temp, or low temp?
- Reveal actual settings
- Discuss which clues indicated temperature level

**Why it works**: Builds intuition for recognizing temperature effects in practice.

---

### Repetition loop demonstrator

**Concept**: Show what happens at temperature 0 with certain prompts.

**Implementation**:
- Use prompts known to cause loops at temp=0
- Show the deterministic loop
- Raise temperature slightly, show the loop breaking

**Why it works**: Demonstrates why "always pick the best" doesn't work.

---

## Pop Culture Touchstones

**Autocomplete poetry/songs**: There's a genre of social media content where people let phone autocomplete write messages or song lyrics. The results are unpredictable and often absurd — this is high-temperature energy in a familiar context.

**"AI-generated" meme images**: The surreal, sometimes nonsensical AI-generated images that go viral have a "high temperature" aesthetic — unexpected combinations, logical gaps, surprising juxtapositions. Text generation temperature creates similar effects.

**Predictive text conversations**: Social media challenges where people respond using only autocomplete suggestions. The results vary from coherent to chaotic, demonstrating the same kind of sampling-from-distribution.

---

## Diagram Suggestions

### The temperature dial

**Concept**: Visual metaphor of a dial or slider.

**Implementation**:
- Dial from 0 to 2
- Labels at positions: "Frozen/Deterministic" → "Standard" → "Creative/Chaotic"
- Icons showing output characteristics at each position
- Warning zones at extremes (repetition, incoherence)

---

### Probability landscape visualization

**Concept**: 3D surface showing probability mass concentration.

**Implementation**:
- Tokens on x/y axes (simplified to a few options)
- Height = probability
- Animation showing surface changing with temperature:
  - Low temp: sharp spike at one token
  - High temp: flattened landscape

---

### The sampling tree

**Concept**: Decision tree showing how different samples lead to different completions.

**Implementation**:
- Start with a prompt
- Branch at each token based on sampling
- Show multiple paths diverging
- At low temp: paths cluster
- At high temp: paths diverge widely

---

## Missed Connections in Base Voices

**The "I'll try that again" intuition**: Users frequently regenerate responses without understanding why it works. Connecting regeneration directly to "re-rolling the probabilistic dice" would help.

**Platform defaults matter**: Users may not realize that different platforms use different default temperatures. "ChatGPT feels different from Claude" might partly be default temperature differences, not just model differences.

**Voice assistants as low-temp systems**: Siri, Alexa, and Google Assistant feel predictable and consistent — that's low temperature in action. The contrast with ChatGPT's variability highlights what temperature does.
