# ADR 0001: Record Architecture Decisions

- Status: Accepted
- Date: 2026-05-02
- Deciders: project owner

## Context

The Node Core Lab project intentionally explores many trade-offs that a senior engineer must justify: ORM choice, cookie strategy, refresh token rotation, queue technology, observability stack, deployment target, and more. Without a written record, decisions are forgotten, re-litigated, or invisible to future contributors and to the author after a context switch. We need a lightweight, durable mechanism to capture every non-trivial decision with the reasoning behind it.

## Decision

We adopt the Architecture Decision Records (ADR) pattern as described by Michael Nygard. All non-trivial decisions are recorded as numbered Markdown files in `docs/adr/`. Each ADR follows the template at [`docs/adr/_template.md`](./_template.md). Numbering is monotonic (`NNNN-kebab-case-title.md`). The index is maintained in [`docs/adr/README.md`](./README.md). ADRs are immutable once accepted; changes are made by writing a new ADR that supersedes the previous one and updating the old one's status.

## Consequences

Positive:

- Every meaningful decision has a stable, citable record.
- Reviewers can challenge a decision against the alternatives that were considered.
- Onboarding becomes faster because rationale lives next to the code.

Negative:

- Small overhead per decision (about 10-20 minutes to write a clear ADR).
- Discipline is required to actually write ADRs instead of "decide and forget".

Reversibility: high. The pattern is markdown-only and can be abandoned at any time without code impact.

## Alternatives Considered

- No formal record, rely on chat history and commits. Rejected because rationale gets lost and is unsearchable.
- Wiki pages on a third-party service. Rejected because rationale must travel with the source repository.
- RFCs as long documents per topic. Rejected for this project as too heavy; RFCs may be added later for cross-team decisions.

## References

- Michael Nygard, "Documenting Architecture Decisions", 2011.
- [`docs/adr/_template.md`](./_template.md).
- [`docs/architecture-roadmap.md`](../architecture-roadmap.md).
