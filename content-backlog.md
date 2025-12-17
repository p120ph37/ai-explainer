# Content Backlog

## How This Works

- **Unchecked `[ ]`** = Suggested topic, pending human approval
- **Checked `[x]`** = Approved for development (Cursor Agent may work on these)
- **Completed items** = Move to the Completed section at the bottom

Cursor Agent: Only work on checked items. Add new suggestions as unchecked items.

---

## Approved for Development

Check a box to approve a topic. Cursor Agent will work through these.

*(No items currently approved)*

---

## Suggestions (Pending Approval)

Cursor Agent adds suggestions here. Check to approve.

- [ ] **mcp**: What is Model Context Protocol?
  - Scope: MCP specification, standardized tool integration, ecosystem
  - Rationale: Emerging standard for AI tool use; split from tools topic

- [ ] **rag**: What is Retrieval-Augmented Generation?
  - Scope: RAG pattern, combining retrieval with generation, grounding responses
  - Rationale: Key technique for reducing hallucinations; split from vector-databases topic

- [ ] **multimodal**: How do AI models see and hear?
  - Scope: Vision models, audio, video, how LLMs expand beyond text
  - Rationale: Increasingly relevant as GPT-4V, Gemini, Claude vision become standard

- [ ] **uses**: What can AI actually do today?
  - Scope: Practical current applications, effectiveness by use case, supported by real results and firsthand accounts, honest assessment of limitations
  - Rationale: Grounded reality check; counters marketing hype with actual user experiences and measurable outcomes

---

## Toys Backlog

Ideas for interactive widgets, visualizations, and hands-on learning experiences.

- [x] **game-of-life**: Embedded Conway's Game of Life simulation *(2025-12-10)*
  - Related topics: `emergence`
  - Notes: Interactive simulation with play/pause/step, speed control, generation counter, multiple presets (random densities, classic patterns like gliders, spaceships, oscillators, glider gun), and click-to-toggle editing

- [x] **tokenizer-demo**: Real-time tokenizer visualization *(2025-12-10)*
  - Related topics: `tokens`
  - Notes: Interactive demo using gpt-tokenizer library; shows live tokenization as user types

- [ ] **attention-viz**: Attention pattern visualizer
  - Related topics: `attention`, `transformer`
  - Notes: Currently links to BertViz; could build a simplified in-app version showing which words attend to which, how "it" finds its referent, etc.

- [x] **perceptron-toy**: Interactive single-neuron perceptron *(2025-12-10)*
  - Related topics: `neural-network`, `parameters`
  - Notes: Interactive visualization with adjustable weights, bias, and activation function; shows classification boundary and accuracy on sample points

- [ ] **prompt-sandbox**: Embedded LLM prompt interface
  - Related topics: `prompt-engineering`, `emergence`, `parameters`, `scale`
  - Notes: Embed HuggingFace Spaces to let readers try prompts without leaving the page. Key use case: side-by-side comparison of small vs large models on the same prompt — show the quantum leap from simple next-word prediction (small models) to actual reasoning (Llama-scale+). Demonstrates emergence thresholds viscerally. Options: HF Spaces iframes (free, community-hosted), or self-hosted with Groq/Gemini free tiers for faster responses

- [ ] **embedding-space**: 3D visualization of word embeddings
  - Related topics: `embeddings`, `vector-databases`
  - Notes: Show how similar words cluster together in semantic space; let users explore neighborhoods, see relationships. Use neutral examples (cities/countries, animals, professions). 
  - *Explicitly avoided:* The classic "king - man + woman = queen" example — while mathematically interesting, the gendered framing invites distracting side questions about bias. Could note this as an aside that leads readers toward `bias` and `alignment` topics, but keep it out of the main interactive flow.

- [ ] **temperature-slider**: Same prompt, adjustable temperature
  - Related topics: `temperature`, `inference`
  - Notes: Slide from 0 (deterministic/repetitive) to 2 (chaotic/creative) and watch the same prompt produce wildly different outputs. Visceral demonstration of the creativity-coherence tradeoff.

- [ ] **context-window-viz**: Watch the context fill up and overflow
  - Related topics: `context-window`
  - Notes: Visual representation of tokens filling a fixed window as conversation progresses; show what gets "forgotten" when it overflows. Could animate the sliding window effect.

- [ ] **token-probabilities**: Peek at the model's decision-making
  - Related topics: `inference`, `temperature`, `tokens`
  - Notes: For each generated token, show the probability distribution over candidates — why did it pick *this* word? Make the "choosing" process visible.

- [ ] **tool-flow**: Step-by-step tool use visualization
  - Related topics: `tools`
  - Notes: Animate the full cycle: model sees query → recognizes tool needed → formats structured call → receives external result → weaves into response. Important for demystifying how LLMs "do things" in the real world.

- [ ] **reward-game**: Mini-game illustrating reward hacking
  - Related topics: `reward`, `alignment`
  - Notes: Player tries to maximize a score; discovers exploits that technically satisfy the reward signal but completely miss the intended goal. Visceral lesson in why alignment is hard and how training can go wrong.

- [ ] **diagram-system**: Infrastructure for visx-based diagrams
  - Related topics: all
  - Notes: Set up visx with reusable components/patterns. Primary library for charts and visualizations. Fall back to D3 for edge cases, CSS for text annotations (token boundaries). See editors-notes.md for rationale on library choice.

---

## Toys - Not Planned

Ideas considered but set aside (too technical for an explainer context).

- **gradient-descent**: Animated loss landscape with ball rolling downhill
  - Why deferred: Requires spatial intuition about fields, slopes, isosurfaces that most readers won't have. Conceptually tricky to make accessible without a CS/math background.

- **vector-similarity**: Drag vectors, see cosine similarity change
  - Why deferred: More appropriate for a CS course than a conceptual explainer.

- **softmax-playground**: Adjust logits and temperature, see probability shifts
  - Why deferred: Technical and lacks larger context of *why* it matters.

- **hallucination-confidence**: Show confidence scores that don't correlate with accuracy
  - Why deferred: States the fact (confidence ≠ correctness) but doesn't illuminate *why* — needs a better conceptual hook.

---

## Completed

- [x] **what-is-llm**: What is an LLM? *(2025-12-08)*
- [x] **tokens**: What are tokens? *(2025-12-08)*
- [x] **scale**: Why does scale matter? *(2025-12-08)*
- [x] **context-window**: The context window *(2025-12-08)*
- [x] **neural-network**: What is a neural network? *(2025-12-08)*
- [x] **parameters**: What are parameters? *(2025-12-08)*
- [x] **embeddings**: How do tokens become numbers? *(2025-12-08)*
- [x] **attention**: How does attention work? *(2025-12-08)*
- [x] **transformer**: What is a Transformer? *(2025-12-08)*
- [x] **labels**: What is labeled data? *(2025-12-08)*
- [x] **training**: How are LLMs trained? *(2025-12-08)*
- [x] **reward**: How do AI systems learn what's "good"? *(2025-12-08)*
- [x] **tuning**: How are LLMs customized? *(2025-12-08)*
- [x] **inference**: How does text generation actually happen? *(2025-12-08)*
- [x] **temperature**: What is temperature in AI? *(2025-12-08)*
- [x] **emergence**: What is emergent behavior? *(2025-12-08)*
- [x] **hallucinations**: Why do LLMs make things up? *(2025-12-08)*
- [x] **understanding**: Do LLMs really understand? *(2025-12-08)*
- [x] **prompt-engineering**: Communicating effectively with LLMs *(2025-12-08)*
- [x] **tools**: How do LLMs use tools? *(2025-12-08)*
- [x] **vector-databases**: What are vector databases? *(2025-12-08)*
- [x] **hardware**: What hardware runs AI? *(2025-12-08)*
- [x] **models**: What is a model? *(2025-12-09)*
- [x] **players**: Who are the key players in AI? *(2025-12-09)*
- [x] **open**: Open vs closed AI models *(2025-12-09)*
- [x] **bias**: Where does AI bias come from? *(2025-12-09)*
- [x] **alignment**: Why is AI alignment hard? *(2025-12-09)*

---

## Not In Scope (External Links)

Topics better covered elsewhere. Link to these rather than creating nodes.

<!-- Add rejected topics here with links to good external resources -->
