# POS + STORE//SIM

Status: Planned

## Purpose

Build two systems together from the beginning:

1. A serious point-of-sale core that owns products, carts, sales, inventory movements, refunds, adjustments, receipts, reconciliation, and audit history.
2. A living synthetic store, **STORE//SIM**, that generates realistic and hostile business activity against the same interfaces the real POS uses.

The simulator is not decoration and is not merely demo data. It is a permanent testing instrument that grows with the POS and exists to discover defects before customers do.

## Core principle

> Simulated reality should exercise the same boundaries as real reality.

STORE//SIM must not reach around the POS and directly mutate production state just because it is convenient. If a simulated customer buys an item, the simulator uses the sale path. If an item expires, it uses the inventory-adjustment path. If a refund occurs, it uses the refund mechanism.

The point is not to make the simulator powerful. The point is to make the POS prove itself.

## Seeded worlds

Every simulation run is deterministic when given the same seed and configuration.

Example:

`SIM RUN 4831 · seed 781224`

The same seed, starting state, simulator version, POS version, and configuration must reproduce the same synthetic store day.

This turns failures from anecdotes into specimens:

- A random failure is difficult to investigate.
- A seeded failure can be replayed exactly.
- Once fixed, that seed becomes a permanent regression scenario.

Seeds should eventually form a named library of known worlds, for example:

- ordinary weekday
- lunch rush
- refund-heavy day
- spoilage and damaged-stock day
- inventory-contention day
- payment-failure day
- offline/recovery day
- concurrency torture chamber

Interesting seeds may later be mutated to create nearby descendant scenarios.

## System boundary

### POS CORE owns truth

The POS owns:

- products and variants
- prices
- carts
- completed sales
- payment state
- taxes
- receipts
- inventory movements
- refunds and partial refunds
- voids
- discounts
- damaged goods
- expired goods
- stock corrections
- cash movements
- audit history
- reconciliation

The POS should initially support cash/manual payment flows before card processing is introduced. Certified external payment processors should own raw card handling when card payments are added.

### STORE//SIM creates pressure

STORE//SIM generates events such as:

- customers arriving
- basket composition
- demand by product and time
- purchases
- abandoned carts
- refunds
- partial refunds
- exchanges
- damaged goods
- expired goods
- stock corrections
- discounts
- cashier mistakes
- demand spikes
- demand collapses
- failed payments
- duplicate payment responses
- delayed responses
- offline periods
- reconnect/reconciliation events
- simultaneous attempts to buy the last item

The simulator observes results and invariants. It does not secretly repair the POS.

## Simulation modes

### 1. Normal life

Generate realistic ordinary operation:

- reasonable customer arrivals
- normal basket sizes
- daypart demand
- occasional returns
- occasional damaged inventory
- routine expiration
- ordinary stock depletion

Goal: prove that boring days remain boring.

### 2. Stress

Generate high but plausible load:

- large rushes
- rapid checkout
- high item counts
- repeated stock depletion
- many refunds
- inventory contention
- multiple registers or actors

Goal: find scaling, ordering, timing, and state-transition failures.

### 3. Hostile weirdness

Deliberately compose edge cases:

- refund an already-refunded item
- partial refund followed by another partial refund
- refund after stock correction
- expire inventory while units are reserved in a cart
- two terminals sell the final unit at nearly the same time
- payment succeeds but the response is lost
- payment callback arrives twice
- reconnect after local state changed
- void after capture
- damaged goods are accidentally made sellable again
- clock/timezone boundaries
- end-of-day reconciliation during unfinished transactions

Goal: make the system encounter unpleasant combinations before a customer does.

## Invariants

These are non-negotiable tripwires. A simulation run fails when an invariant is violated.

1. Inventory cannot appear or disappear without an inventory movement.
2. Inventory after replay must equal starting inventory plus the complete movement ledger.
3. A completed refund cannot exceed the remaining refundable amount.
4. A sale cannot be counted twice because an external event was delivered twice.
5. Voided sales do not count toward completed revenue.
6. Damaged and expired stock cannot remain sellable unless an explicit corrective movement restores it.
7. Every financial mutation has a durable audit record.
8. Every inventory mutation has a durable reason/source.
9. Cash totals reconcile with recorded cash transactions and cash movements.
10. A failed transaction cannot silently become a completed transaction.
11. A completed transaction cannot silently disappear.
12. Replaying the same deterministic event stream from the same starting state produces the same final state.

More invariants should be added whenever a real bug reveals a missing truth condition.

## Failure artifact

Every failed simulation should produce a compact replay artifact containing at least:

- seed
- simulator version
- POS version/commit
- configuration
- starting state checksum
- event count
- first detected invariant failure
- event index and simulated timestamp
- concise event trace around the failure
- resulting state checksum

A defect should be reproducible from the artifact without manually reconstructing the day.

## Regression library

When a seeded run finds a legitimate defect:

1. Preserve the seed and relevant configuration.
2. Reproduce the defect.
3. Fix the POS.
4. Replay the seed.
5. Add the scenario to the permanent regression library.

The simulator therefore becomes stronger every time the project breaks.

## Data philosophy

Synthetic data is not production truth.

Use it to:

- expose logical contradictions
- explore state combinations
- test recovery
- test performance
- test invariants
- generate reproducible edge cases

Do not use simulated demand to claim actual market demand, customer behavior, or business performance.

When real production data eventually exists, preserve a hard boundary between simulated and observed data.

## Architecture principles

- One authoritative transaction model.
- One authoritative inventory ledger.
- Append durable events/movements rather than silently rewriting history.
- Idempotency wherever external or retryable operations exist.
- Explicit transaction states.
- Recoverable failure paths.
- Simulator and real interfaces converge rather than fork.
- Seeded randomness only. Never depend on uncontrolled randomness for reproducible tests.
- Keep the simulator inspectable. Cleverness must not make failures mysterious.

## Development phases

### Phase 0: Contract before interface

Define the minimum domain model and invariants before building a polished register UI.

Deliverables:

- product model
- inventory movement model
- sale state machine
- refund model
- audit model
- simulator event format
- seeded random-number contract
- deterministic clock
- invariant runner

### Phase 1: Cash POS + tiny store

Build the smallest legitimate POS:

- products
- cart
- quantities
- prices
- tax input/configuration boundary
- cash/manual sale
- receipt record
- inventory decrement
- transaction history
- daily totals

STORE//SIM initially generates ordinary purchases and verifies inventory/revenue invariants.

### Phase 2: Returns and inventory loss

Add:

- refunds
- partial refunds
- voids where appropriate
- damaged goods
- expired goods
- stock corrections

STORE//SIM adds refund-heavy, damage, expiration, and correction scenarios.

### Phase 3: Replay laboratory

Build first-class replay tooling:

- seed entry
- run controls
- event timeline
- pause/step
- failure marker
- state diff
- exportable replay artifact
- permanent regression-seed library

At this point the simulator becomes a development instrument rather than a data generator.

### Phase 4: Pressure and concurrency

Add:

- multiple simulated registers/actors
- simultaneous inventory access
- rapid checkout
- large runs
- deterministic scheduling of competing events

Prove that ordering and idempotency remain correct.

### Phase 5: External payment boundary

Only after the transaction core is trustworthy:

- integrate a certified payment processor
- never store or handle raw card data unless absolutely required
- model pending/authorized/captured/failed/refunded states
- simulate processor delay, duplicate callbacks, lost responses, retries, and outages

STORE//SIM should exercise the payment adapter using a test/sandbox integration or a faithful local adapter, not fake success by editing transaction rows.

### Phase 6: Adaptive adversarial simulation

After enough defect history exists, let STORE//SIM learn where failures cluster.

Possible behavior:

- score seeds by novelty and defect yield
- mutate failure-producing seeds
- bias event generation toward historically fragile sequences
- retain diversity so the simulator does not overfit one class of defect

The AI does not decide whether the POS is correct. Invariants and observed state do.

## First milestone

Do not begin with hardware, card readers, cloud sync, multi-location inventory, loyalty programs, analytics dashboards, or elaborate permissions.

The first milestone is intentionally narrow:

> Start with 20 products and a cash register. Run one fully deterministic synthetic day. End with exact inventory and exact money. Replay the seed and get the identical result.

If that cannot be trusted, nothing built above it deserves to exist yet.

## Success criteria for v0

A v0 is successful when:

- a user can complete a cash sale
- inventory moves through a ledger rather than hidden counters
- a seeded simulator can generate a complete store day
- replaying a seed reproduces the identical event stream and final state
- invariants automatically detect at least inventory and revenue contradictions
- a deliberately introduced defect can be caught, reproduced, fixed, and preserved as a regression seed

## Long-term direction

The end state is not merely a POS with automated tests.

It is a commercial system that grows beside a synthetic business capable of continuously challenging it.

Real customers should discover useful features, not foundational accounting bugs.

STORE//SIM exists to find those first.
