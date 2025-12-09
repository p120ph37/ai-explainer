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

- [ ] **training**: How are LLMs trained?
  - Scope: Pre-training, prediction objective, compute requirements
  - Rationale: Natural next question after understanding what LLMs do

- [ ] **hallucinations**: Why do LLMs make things up?
  - Scope: What hallucination is, why it happens, mitigation
  - Rationale: Common user concern, mentioned in intro

- [ ] **understanding-debate**: Do LLMs really understand?
  - Scope: Philosophical debate, Chinese Room, behavioral vs phenomenal
  - Rationale: Expands on "Is prediction understanding?" aside

- [ ] **temperature**: What is "temperature" in AI?
  - Scope: Temperature parameter, sampling, creativity vs accuracy
  - Rationale: Expands on "Why add randomness?" aside

- [ ] **attention**: How does attention work?
  - Scope: Intuition for attention mechanism, self-attention basics
  - Rationale: Core mechanism enabling context understanding

- [ ] **prompt-engineering**: Communicating effectively with LLMs
  - Scope: Why prompts matter, techniques, pitfalls
  - Rationale: Practical application of LLM understanding

- [ ] **parameters**: What are parameters?
  - Scope: Neural network weights, what they encode, why billions are needed
  - Rationale: Referenced in why-large as child node; explains the "large" in LLM

- [ ] **embeddings**: How do tokens become numbers?
  - Scope: Vector representations, semantic similarity, embedding space
  - Rationale: Referenced in tokens as related; bridges tokenization to neural network processing

- [ ] **vector-databases-rag**: How do LLMs use external knowledge?
  - Scope: Vector databases, embeddings for retrieval, RAG (Retrieval-Augmented Generation), semantic search
  - Rationale: Practical technique for grounding LLMs in specific knowledge; addresses hallucination concerns
  - Note: Could split into vector-databases + rag if scope too broad

- [ ] **tools-mcp**: How do LLMs use tools?
  - Scope: Function calling, tool use, MCP (Model Context Protocol), agents
  - Rationale: Key capability extending LLMs beyond text; how AI assistants take actions
  - Note: Could split into tool-use + mcp if scope too broad

- [ ] **tuning**: How are LLMs customized?
  - Scope: Fine-tuning, RLHF, instruction tuning, LoRA, when/why to tune
  - Rationale: Explains how base models become assistants; complements training topic

- [ ] **emergent-behavior**: What is emergent behavior?
  - Scope: Emergence in complex systems, phase transitions, why scale produces surprise capabilities
  - Rationale: Unintuitive but crucial concept; explains why LLM capabilities are hard to predict
  - Note: Interactive Conway's Game of Life widget to demonstrate emergence from simple rules
  - Aside: Primordial ooze / abiogenesis as canonical example; LLM work as theoretical validation that complex systems can arise from immense numbers of simple components under consistent external steering stimuli

---

## Completed

- [x] **what-is-llm**: What is an LLM? *(2024-12-08)*
- [x] **tokens**: What are tokens? *(2024-12-08)*
- [x] **why-large**: Why does scale matter? *(2024-12-08)*
- [x] **context-window**: The context window *(2024-12-08)*

---

## Not In Scope (External Links)

Topics better covered elsewhere. Link to these rather than creating nodes.

<!-- Add rejected topics here with links to good external resources -->
