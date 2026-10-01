# WRKMAN Core

This directory is the beginning of WRKMAN as a growing workshop intelligence.

## Heartbeat 0.3 — First Words

WRKMAN now has his first active brain adapter: `first-words`.

It is intentionally tiny and deterministic. It can recognize greetings, answer simple questions about its identity, and perform basic keyword retrieval over WRKMAN's own local memories. If the answer is not present, it says it does not know.

This is **not** a trained language model and it has no general world knowledge. The point is to prove that the brain socket can host a useful interchangeable brain while WRKMAN retains ownership of identity, memory, tools, and truth rules.

Try:

- `Hey baby WRKMAN.`
- `Who are you?`
- `What do you remember about WorkinMan?`
- store `My favorite color is green`, then ask `What's my favorite color?`
- ask about something never stored and verify that WRKMAN says it does not know.

## Heartbeat 0.2 — Brain Interface

`brain.js` defines `wrkman.brain.v1`. A brain receives a standardized packet containing the current message, WRKMAN identity, local memories, observations, and recent journal entries. It returns normalized text and receives no direct tool authority.

## Heartbeat 0.1 — Heartbeat

0.1 established persistent browser memory, a local journal, read-only repository inspection, text-file reading, explicit capabilities, and the rule **unknown stays unknown**.

## Epistemic rule

> Unknown stays unknown.

A capability is not considered real until it is implemented and testable.

## Growth rule

WRKMAN grows in this repository. Git history is the fossil record. We add capabilities to the same creature instead of multiplying numbered copies.
