# Frontier AI Explainer

An interactive learning tool for understanding how frontier AI technology actually works—the mechanics, the architecture, and the "why" behind the "what."

## Vision

Most AI education focuses on *what* AI can do. This explainer helps users understand *how* and *why*:

- **Progressive disclosure**: Start with high-level concepts, drill down into details as interest allows
- **Cognitive load management**: Each step is digestible; new terms are "optionally opaque"
- **Interactive exploration**: Visualizations and experiments make abstract concepts tangible
- **Credible sources**: Citations to research papers and quality explainers throughout

## Development

This project uses [Bun](https://bun.sh) for development and building.

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start with auto-restart on file changes
bun run dev:watch

# Build for production (static files for GitHub Pages)
bun run build

# Preview production build
bun run preview
```

## Content Authoring

Content is written in **MDX** — Markdown with embedded JSX components. No compilation step required; MDX is processed in-memory when the dev server builds.

```mdx
---
id: tokens
title: "Tokens: The Atoms of Text"
summary: LLMs don't read letters or words—they read tokens.
prerequisites: [intro]
children: [bpe-algorithm]
---

import { Expandable, Recognition } from '../../app/components/content/index.ts'

When you type a message to an AI, it doesn't see individual letters...

<Expandable title="How Tokenization Works">
The most common method is *byte-pair encoding*...
</Expandable>

<Recognition>
Ever noticed AI struggles with counting letters in words?
</Recognition>
```

See `docs/CONTENT-GUIDE.md` for full documentation.

## Project Structure

```
src/
├── server.ts         # Dev server with MDX plugin
├── index.html        # Entry point
├── app/              # Application code
│   ├── main.tsx      # Bootstrap
│   ├── router.ts     # Client-side routing
│   ├── state.ts      # State management
│   └── components/   # UI components
├── content/          # Content nodes (MDX files)
│   ├── _types.ts     # Type definitions
│   ├── _registry.ts  # Content loading
│   └── [topic]/      # Topic-grouped content
├── plugins/          # Bun plugins
│   └── mdx-plugin.ts # MDX compilation
└── styles/           # CSS
    ├── base.css
    ├── components.css
    └── themes.css

docs/
├── DESIGN.md         # Design philosophy
└── CONTENT-GUIDE.md  # Content authoring guide
```

## Design Principles

1. **Cognitive Load Management**: Never overwhelm; each step should feel complete
2. **Optionally Opaque Terms**: New concepts are hyperlinked but surrounding text makes sense without clicking
3. **Progressive Disclosure**: Default shows high-level; detail is available on demand
4. **Recognition Hooks**: Connect concepts to user's existing experience
5. **Credibility**: All claims are cited; sources are annotated by type

See `docs/DESIGN.md` for the full design philosophy.

## License

MIT
