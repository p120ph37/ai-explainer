# Content Authoring Guide

## Overview

Content for the AI Explainer is authored in **MDX** — a format that combines Markdown with JSX components. This gives you the readability of Markdown for prose with the power of custom Preact components for interactive elements.

**No compilation step required** — MDX files are processed in-memory by Bun's bundler via the plugin configured in `bunfig.toml`.

## Quick Start

1. Create a new `.mdx` file in the appropriate topic directory under `src/content/`
2. Add frontmatter with required metadata
3. Write your content in Markdown, using custom components where needed
4. Register the file in `src/content/_registry.ts`
5. Run `bun run dev` — MDX is compiled automatically with HMR

## File Structure

```
src/content/
├── _types.ts          # TypeScript types for content nodes
├── _registry.ts       # Content loading/management
├── intro/
│   └── what-is-llm.mdx     # MDX content (author this directly)
├── foundations/
│   └── tokens.mdx
└── ...
```

## MDX File Template

```mdx
---
id: tokens
title: "Tokens: The Atoms of Text"
summary: LLMs don't read letters or words—they read tokens, chunks of text that the model has learned to recognize.
prerequisites:
  - intro
children:
  - bpe-algorithm
  - vocabulary-size
related:
  - embeddings
keywords:
  - tokenization
  - BPE
  - vocabulary
---

import { Expandable, Recognition, TryThis, Sources, Citation, Term } from '../../app/components/content/index.ts'

When you type a message to an AI, it doesn't see individual letters or even whole words. Instead, it breaks your text into **tokens**—chunks that might be words, parts of words, or even punctuation.

This process is called <Term id="tokenization">tokenization</Term>, and it's one of the first steps in how an LLM processes your input.

<Expandable title="How Tokenization Works">

The most common tokenization method is called *byte-pair encoding* (BPE). Starting with individual characters, the algorithm repeatedly merges the most frequent pairs until reaching a target vocabulary size.

Common words like "the" become single tokens. Rare words get split: "tokenization" might become "token" + "ization".

</Expandable>

<Recognition>

Ever noticed that AI seems to struggle with counting letters in words? That's because it doesn't see letters—it sees tokens. The word "strawberry" might be split as "straw" + "berry", making it hard to count the r's.

</Recognition>

<TryThis>

Visit [tiktokenizer.vercel.app](https://tiktokenizer.vercel.app) and type different words. Notice how common words are single tokens, while unusual words get split up?

</TryThis>

<Sources>
  <Citation
    type="video"
    title="Let's build the GPT Tokenizer"
    source="Andrej Karpathy"
    url="https://www.youtube.com/watch?v=zduSFxRajkE"
    year={2024}
  />
</Sources>
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Unique identifier (should match filename without extension) |
| `title` | ✅ | Display title for the node |
| `summary` | ✅ | One-sentence summary (the TLDR) |
| `prerequisites` | ❌ | Array of node IDs that must be understood first |
| `children` | ❌ | Array of node IDs for "go deeper" navigation |
| `related` | ❌ | Array of node IDs for lateral navigation |
| `keywords` | ❌ | Array of keywords for search |

## Available Components

### `<Expandable>`

Progressive disclosure for deeper detail:

```mdx
<Expandable title="Section Title">

Content that's hidden by default but can be expanded.
Use for deeper explanations that aren't essential to the main point.

</Expandable>

<Expandable title="Advanced Topic" level="advanced">

Technical content for readers who want to go deep.
Shows a 🔬 indicator.

</Expandable>
```

### `<Recognition>`

Connect concepts to user's existing experience:

```mdx
<Recognition>

**You've seen this:** When ChatGPT seems to "forget" something from earlier in a long conversation, that's because older tokens have fallen outside the context window.

</Recognition>
```

### `<TryThis>`

Actionable experiments:

```mdx
<TryThis>

Open ChatGPT and ask it to repeat the word "buffalo" 500 times. Notice how it loses count? That's the model's limited "working memory" in action.

</TryThis>
```

### `<Term>`

Link to unexplained concepts (optionally opaque):

```mdx
The model uses <Term id="attention">attention</Term> to figure out which parts of your input are most relevant.
```

The surrounding text must make sense without clicking the link.

### `<Sources>` and `<Citation>`

Citations with type indicators:

```mdx
<Sources>
  <Citation
    type="paper"
    title="Attention Is All You Need"
    authors="Vaswani et al."
    url="https://arxiv.org/abs/1706.03762"
    year={2017}
  />
  <Citation
    type="video"
    title="But what is a GPT?"
    source="3Blue1Brown"
    url="https://www.youtube.com/watch?v=wjZofJX0v4M"
    year={2024}
  />
  <Citation
    type="article"
    title="Constitutional AI"
    source="Anthropic"
    url="https://www.anthropic.com/constitutional-ai"
  />
  <Citation
    type="docs"
    title="OpenAI API Reference"
    source="OpenAI"
    url="https://platform.openai.com/docs"
  />
</Sources>
```

Citation types:
- `paper` (📄) — Research papers, technical references
- `video` (🎬) — Video explainers, accessible content
- `article` (🔗) — Blog posts, articles
- `docs` (📖) — Official documentation

## Writing Guidelines

### The "Optionally Opaque" Rule

When mentioning a concept not yet explained in the prerequisite path:
- The surrounding text **must** make sense without understanding the new term
- Use `<Term>` to link to the concept's node
- Avoid definitions that require understanding other undefined terms

**✅ Good:**
```mdx
Tokens are created using an algorithm called <Term id="bpe">byte-pair encoding</Term> 
(we'll explore this below if you're curious). The key insight is that common words 
become single tokens, while rare words get split up.
```

**❌ Bad:**
```mdx
Tokens are created using byte-pair encoding, which iteratively merges the most 
frequent byte pairs in the training corpus until reaching the target vocabulary size.
```

### Cognitive Load Limits

- Core explanation: 2-4 paragraphs max
- One main concept per node
- Use `<Expandable>` for deeper detail, not inline complexity
- If a paragraph requires more than 2 new terms, split it up

### Recognition Hooks Required

Every content node **must** include at least one of:
- `<Recognition>` block connecting to user's existing experience
- `<TryThis>` block with a concrete action
- Real-world example from familiar AI tools

## Development Workflow

### Running the Dev Server

```bash
# Start dev server with HMR
bun run dev
```

The MDX plugin is configured in `bunfig.toml` and automatically loaded by Bun's bundler.

### Registering New Content

After creating a new MDX file, add it to `src/content/_registry.ts`:

```ts
const contentImports: Record<string, () => Promise<ContentModule>> = {
  'intro': () => import('./intro/what-is-llm.mdx'),
  'tokens': () => import('./foundations/tokens.mdx'),  // Add new entry
};
```

### How It Works

The MDX plugin (`src/plugins/mdx-plugin.ts`) is registered via `bunfig.toml`:

```toml
[serve.static]
plugins = ["./src/plugins/mdx-plugin.ts"]
```

When Bun encounters an `.mdx` import, the plugin:
1. Extracts YAML frontmatter as the `meta` export
2. Compiles Markdown + JSX to Preact components via `@mdx-js/mdx`
3. Returns the transformed code to the bundler

This happens in-memory with full HMR support.

## TSX Alternative

For highly interactive content (e.g., embedded simulations), you can write `.tsx` files directly instead of MDX:

```tsx
// src/content/interactive/tokenizer-demo.tsx
import type { ContentMeta } from '../_types.ts';

export const meta: ContentMeta = {
  id: 'tokenizer-demo',
  title: 'Interactive Tokenizer',
  summary: 'See how text gets split into tokens in real-time.',
  prerequisites: ['tokens'],
};

export default function TokenizerDemo() {
  // Full Preact component with state, effects, etc.
  return (
    <div className="interactive">
      {/* Custom interactive visualization */}
    </div>
  );
}
```

Register TSX files the same way as MDX files in the registry.
