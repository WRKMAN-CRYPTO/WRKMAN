# WRKMAN Core

This directory is the beginning of WRKMAN as a growing workshop intelligence.

## Heartbeat 0.1

The first version is intentionally small. It is not pretending to be a general AI.

It can:

- report its implemented capabilities and limitations;
- persist simple memories in the browser's local storage;
- recall and remove those memories after ordinary restarts;
- inspect the live \`WRKMAN-CRYPTO/WRKMAN\` repository;
- read UTF-8 text files from the repository;
- keep a local event journal;
- explicitly decline requests it does not know how to perform.

It does **not** yet have a language model, write access, code execution, autonomous behavior, or cross-device memory.

## Epistemic rule

> Unknown stays unknown.

A capability is not considered real until it is implemented and testable.

## Growth rule

WRKMAN grows in this repository. Git history is the fossil record. We add capabilities to the same creature instead of multiplying numbered copies.

## Run

Open \`/core/\` through GitHub Pages, or serve the repository locally and open \`core/index.html\`.

No build step and no dependencies are required.
