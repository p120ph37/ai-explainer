# Frontier AI Explainer — Design Philosophy

## Mission

Create an interactive learning tool that helps non-technical users understand the **mechanics and architecture** of frontier AI technology—the "how" and "why"—not just the "what."

The goal is to enable users to:
- Set realistic expectations for AI capabilities and limitations
- Use AI tools more effectively through understanding
- Develop intuition for AI behavior through exposure to underlying concepts
- Navigate the AI ecosystem with confidence

## Core Principles

### 1. Cognitive Load Management

The explainer must respect the user's cognitive bandwidth. We anticipate users may be encountering many concepts entirely de novo.

**Rules:**
- Each content node must be understandable using *only* concepts already explained in the path that led to it
- New concepts mentioned but not yet explained must be **optionally opaque**—the surrounding material makes sense without drilling into them
- Unexplained concepts are hyperlinked, inviting exploration but not requiring it
- Each step should feel complete and satisfying on its own

**Anti-patterns:**
- Assuming prerequisite knowledge not established in the path
- Requiring forward-references to understand current content
- Dense walls of interconnected new terminology

### 2. Progressive Disclosure

Information depth is user-controlled. The default view shows high-level, relatable concepts. Detail is available on demand.

**Implementation:**
- Expandable/collapsible sections for deeper detail
- Layered annotations on diagrams (show more on click/hover)
- "Aside" blocks for tangential but interesting details
- Clear visual hierarchy distinguishing summary from detail

### 3. Horizontal vs. Vertical Navigation

Unlike TV Tropes (primarily horizontal/lateral navigation to related concepts), this explainer emphasizes **vertical navigation** (shallow → deep understanding).

However, we do support horizontal navigation for:
- Alternative explanations/framings of the same concept
- Related concepts at the same abstraction level
- Real-world examples and applications

**Navigation affordances:**
- **Downward:** "How does this work?" / "What's inside?"
- **Upward:** "Where does this fit?" / "Why does this matter?"
- **Lateral:** "See also" / "Compare to" / "Used in"

### 4. Recognition Hooks & Immediate Applicability

Each node should connect to something the user already knows or can immediately observe:
- References to familiar AI tools (ChatGPT, Claude, etc.)
- "Try this" prompts they can test immediately
- "You'll notice this when..." observations
- Analogies to everyday phenomena

### 5. Credibility Through Citations

All factual claims should be traceable to sources:
- Primary sources (research papers, technical docs)
- Reputable secondary sources (3Blue1Brown, Veritasium, Anthropic blog)

**Link annotations:**
- 📄 Technical/research paper (deep dive, for fact-checking)
- 🎬 Video explainer (accessible, different perspective)
- 🔗 External article (supplementary reading)
- 📖 Official documentation (authoritative reference)

## Content Structure

### Node Anatomy

Each content node consists of:

```
┌─────────────────────────────────────────┐
│ Title                                   │
│ ─────────────────────────────────────── │
│ One-sentence summary (the "TLDR")       │
├─────────────────────────────────────────┤
│                                         │
│ Core explanation                        │
│ - Uses only established concepts        │
│ - Hyperlinks new terms (don't require   │
│   clicking to understand)               │
│ - 2-4 paragraphs typical                │
│                                         │
├─────────────────────────────────────────┤
│ [Expandable: Deeper Detail]             │
│ [Expandable: Technical Specifics]       │
│ [Expandable: Historical Context]        │
├─────────────────────────────────────────┤
│ Interactive element (if applicable)     │
│ - Visualization                         │
│ - Mini-simulation                       │
│ - Annotatable diagram                   │
├─────────────────────────────────────────┤
│ Recognition hook / Try this             │
├─────────────────────────────────────────┤
│ Navigation                              │
│ ↓ Deeper: [links to child concepts]     │
│ ↔ Related: [lateral links]              │
│ 📚 Sources: [citations]                 │
└─────────────────────────────────────────┘
```

### Topic Hierarchy (Initial Scope)

```
Entry Point: "What is an LLM?"
│
├── The Big Picture
│   ├── What AI is (and isn't)
│   ├── Machine Learning vs. Traditional Programming
│   └── Why "Large" and why "Language"
│
├── Inside the Black Box
│   ├── Tokens: The Atoms of Text
│   ├── Embeddings: Meaning as Geometry
│   ├── Attention: How Context Flows
│   ├── Transformers: The Architecture
│   └── Parameters: Where Knowledge Lives
│
├── Training: How Models Learn
│   ├── Datasets: Learning from the Internet
│   ├── Pre-training: Pattern Absorption
│   ├── Fine-tuning: Specialization
│   ├── RLHF: Learning from Human Preferences
│   └── Emergent Capabilities
│
├── Using Models: The API Layer
│   ├── Prompts and Completions
│   ├── Context Windows
│   ├── Temperature and Sampling
│   ├── System Prompts and Personas
│   └── Tool Use and Function Calling
│
├── The Ecosystem
│   ├── Model Providers (OpenAI, Anthropic, etc.)
│   ├── Open vs. Closed Models
│   ├── RAG: Retrieval-Augmented Generation
│   ├── Agents and Autonomous Systems
│   └── Multimodal Models
│
└── Limitations and Misconceptions
    ├── Hallucinations: Why Models Make Things Up
    ├── The Knowledge Cutoff
    ├── What "Understanding" Means (and Doesn't)
    └── Alignment and Safety
```

## Technical Implementation

### Stack
- **Runtime/Bundler:** Bun
- **UI:** Preact (lightweight React alternative, ~3KB)
- **Styling:** CSS with custom properties, CSS layers
- **Hosting:** GitHub Pages (static output)
- **Content:** TypeScript modules with JSX for rich content

### Content as Code

Content nodes are TypeScript/TSX files that export structured data:
- Enables type safety and IDE support
- Allows embedding interactive components directly
- Supports programmatic navigation graph generation
- Easy to refactor and reorganize

### Code Splitting

The bundled output uses dynamic imports to:
- Load only the content nodes needed for the current path
- Prefetch likely next nodes for smooth navigation
- Keep initial load minimal

### Responsive Design

- Mobile-first CSS
- Touch-friendly navigation
- Collapsible sections work well on small screens
- Visualizations degrade gracefully (simpler on mobile)

