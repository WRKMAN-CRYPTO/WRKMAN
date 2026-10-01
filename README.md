# The Constellation

A public, mobile-first 3D atlas of the broader project ecosystem.

## Governance

- **Game-core leads**: exploration should be compelling, legible, and worth doing.
- **Builder-core holds veto**: usefulness, dignity, truth, and practical clarity outrank spectacle.

## Interaction

- Drag to rotate
- Pinch to zoom
- Two-finger movement pans
- Tap a star or planet for details
- Focus recenters a selected node
- Home restores the initial view

The page is intentionally dependency-light and self-contained so it can survive as a durable artifact rather than relying on an external rendering framework.

## WRKMAN Core

The repository now also houses the growing WRKMAN intelligence under [\`/core/\`](./core/).

**Heartbeat 0.1** begins deliberately small: local memory, a local journal, read-only self-inspection, explicit capability reporting, and one hard rule: **unknown stays unknown**. No language model is connected yet.
