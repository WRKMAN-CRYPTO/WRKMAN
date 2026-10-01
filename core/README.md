# WRKMAN Core

This directory is the beginning of WRKMAN as a growing workshop intelligence.

## Heartbeat 0.4 — Subjects

WRKMAN's first retrieval mistake taught the next lesson.

With the memory `My favorite color is Red.`, Heartbeat 0.3 correctly answered `What's my favorite color?` but incorrectly returned the same memory for `What's my favorite food?`. The primitive retriever treated the shared word `favorite` as sufficient evidence.

0.4 introduces **query anchors**. Generic relation words such as `favorite` may contribute to a match, but a question containing a concrete subject/property must share at least one concrete anchor with the candidate memory. Thus `color` can retrieve a color memory while `food` cannot retrieve it merely because both questions contain `favorite`.

This is still lexical, not semantic understanding. That limitation is intentional and explicit.

### 0.4 field bug: split-brain cache

The first phone test appeared to show 0.4 still confusing favorite food with favorite color. Inspection showed the 0.4 retrieval code on `main` already required the `food` anchor and could not produce that result. The page had updated to 0.4 while Safari reused a cached 0.3 `brain.js`.

The brain script is now loaded with a heartbeat version query (`brain.js?v=0.4.0`). Future heartbeat changes must bump this asset version so the displayed core version and executing brain cannot silently diverge.

### Regression test

With `My favorite color is Red.` stored:

- `What's my favorite color?` → retrieve the color memory.
- `What's my favorite food?` → `I do not know.`

## Heartbeat 0.3 — First Words

WRKMAN gained the deterministic `first-words` brain: greetings, identity responses, and basic memory retrieval.

### First cognitive failure

0.3's keyword retrieval confused favorite color with favorite food. This failure is preserved here because it directly motivated 0.4.

## Heartbeat 0.2 — Brain Interface

`brain.js` defines `wrkman.brain.v1`. Brains receive context but do not own WRKMAN's identity, memory, tools, or truth rules.

## Heartbeat 0.1 — Heartbeat

0.1 established persistent browser memory, a local journal, read-only repository inspection, text-file reading, explicit capabilities, and the rule **unknown stays unknown**.

## Epistemic rule

> Unknown stays unknown.

A capability is not considered real until it is implemented and testable.

## Growth rule

WRKMAN grows in this repository. Git history is the fossil record.
