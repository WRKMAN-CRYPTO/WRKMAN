# WRKMAN Core

This directory is the beginning of WRKMAN as a growing workshop intelligence.

## Heartbeat 0.2 — First Words

Heartbeat 0.2 separates **WRKMAN** from whatever model may eventually think for it.

`brain.js` defines `wrkman.brain.v1`: a tiny adapter contract. A brain receives a standardized packet containing the current message, WRKMAN identity, local memories, observations, and recent journal entries. It returns normalized text. It does **not** own WRKMAN's memory, tools, identity, or rules, and it receives no direct tool authority.

The first registered adapter is deliberately `none`. That means the interface is real before a model is attached. Unknown requests still terminate honestly instead of being fabricated.

### Brain contract

An adapter supplies:

- `id` and `label`
- `available()`
- `think(packet)`

The packet protocol is `wrkman.brain.v1`. Future local, laptop, API, or other backends can implement the same contract.

## Heartbeat 0.1 — Heartbeat

0.1 established persistent browser memory, a local journal, read-only repository inspection, text-file reading, explicit capabilities, and the rule **unknown stays unknown**.

## Epistemic rule

> Unknown stays unknown.

A capability is not considered real until it is implemented and testable.

## Growth rule

WRKMAN grows in this repository. Git history is the fossil record. We add capabilities to the same creature instead of multiplying numbered copies.

## Run

Open `/core/` through GitHub Pages, or serve the repository locally and open `core/index.html`.

No build step and no dependencies are required.
