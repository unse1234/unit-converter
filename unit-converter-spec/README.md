# Production Unit Converter — Specification Pack

This directory contains the product and engineering specifications for a production-grade unit converter designed for UX, SEO, performance, and monetization.

## Files

### `CLAUDE.md`
Instructions for Claude Code: engineering behavior, quality standards, implementation workflow, and definition of done.

### `PROJECT_REQUIREMENTS.md`
Product requirements and functional expectations.

### `DESIGN.md`
UX, responsive behavior, visual direction, accessibility, and design-system requirements.

### `UNIT_CATALOG.md`
Initial unit taxonomy and data-model rules.

### `SEO_SPEC.md`
URL architecture, programmatic SEO, metadata, canonicalization, internal linking, sitemap, and SEO QA.

### `ARCHITECTURE.md`
Recommended technical architecture and separation of responsibilities.

## Recommended Claude Code Workflow

1. Put these files at the root of the project.
2. Ask Claude Code to read all specification files before coding.
3. Ask it to inspect the repository and create an implementation plan.
4. Have it implement one phase at a time.
5. Require typecheck, lint, tests, and build validation after meaningful changes.
6. Review the conversion data and SEO architecture before large-scale content generation.

## Suggested Initial Prompt

```text
Read CLAUDE.md, PROJECT_REQUIREMENTS.md, DESIGN.md, UNIT_CATALOG.md,
SEO_SPEC.md, and ARCHITECTURE.md before making any changes.

Inspect the repository and compare its current state against the specifications.
Do not start by rewriting the project.

First produce a concise implementation plan divided into phases. Identify any
requirements that need technical decisions or clarification, but make reasonable
engineering assumptions rather than blocking progress unnecessarily.

Then begin with Phase 1 only. Implement it completely, validate it, and report
what changed and what was verified before moving to the next phase.

Treat the product as a real public website that will be indexed by search engines
and monetized. Prioritize correctness, UX, SEO, accessibility, performance,
maintainability, and testability.
```
