# ADR 0001: Ledger-First Architecture

## Context

The Excel version calculated balances, debt progress, goals, and dashboard totals live on every read using `SUMIFS` and `SUMIF`. An unbounded full-column reference caused a doubling bug, exposing the risk of deriving financial state repeatedly from the entire history.

Financial views must be correct, predictable, and fast. Recomputing aggregates at read time makes their correctness depend on every historical row and every formula range.

## Decision

All financial state is computed once at write time by a posting service and stored with the affected record. This includes the user's running balance on each ledger entry, `Debt.currentBalance`, `Goal.currentSaved`, and monthly dashboard snapshots.

Read paths use these stored values and period snapshots; they do not recompute aggregates from the full ledger history. Ledger entries are append-only. The posting service is responsible for calculating balances atomically when it records an entry.

## Consequences

Edits and deletions do not mutate or remove original ledger records. They append correcting entries that reverse the original effect; an edit then appends the corrected replacement entry.

Historical dashboard views read the stored snapshot for the requested period instead of recalculating that period from all transactions. This makes historical results stable and avoids formula-style range errors.

The approach adds some write-time complexity: posting services must coordinate ledger entries and affected debt, goal, or snapshot records transactionally. In return, reads are fast, bounded, and do not risk reintroducing aggregation errors from the full transaction history.
