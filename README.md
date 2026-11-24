# LangSpan

**Planning stage: implementation proposals under review.**

LangSpan is a proposed headless coordination tool for people working with multiple AI coding agents on the same codebase. The aim is to help those agents share relevant context, recognize overlapping work, and understand how their changes fit together while people keep using their existing coding tools.

## The use case

Imagine one agent changing an interface while another updates a feature that depends on it. Each can make reasonable progress independently, yet their changes may disagree when brought together. Separate branches and worktrees provide useful isolation, but the work still needs coordination.

LangSpan would make that relationship easier to see: what each agent intends to change, which work depends on another change, where edits may conflict, and which checks have run against the resulting code. A passing check would be associated with the inputs it actually checked, so later changes could be distinguished from the previously checked result.

## A tool system at the core

The proposed core would expose a command-line interface and Model Context Protocol (MCP) tools, with integrations for supported agent workflows. An optional user interface could provide a human view of activity and decisions. Existing coding agents would remain the place where coding work happens.

The design priorities are practical: useful coordination, understandable decisions, predictable overhead, and clear handling of incomplete or outdated information.

## Where things stand

We are comparing implementation proposals and evaluating architecture, integration coverage, and ways to measure results. These ideas remain proposals; the initial scope and technical choices are still being reviewed.

This page is a planning-stage introduction. Implementation details and public project information will develop as decisions are made and tested.
