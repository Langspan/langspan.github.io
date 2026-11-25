# LangSpan website context

Read [README.md](README.md) for the product story, current claims,
implementation evidence, local preview and review process.

## Design workflow

Use Impeccable for page and UI work alongside LangSpan's brand voice.
Use the installed `impeccable-product-pages` guidance or an available
`impeccable` skill. If neither is available, read the
[pinned upstream skill](https://github.com/pbakaus/impeccable/blob/b49177d32788f2dc585c42831d845dacf1ebed2c/.agents/skills/impeccable/SKILL.md)
and the relevant playbook in its `reference/` directory.
Use existing project context when optional tooling cannot run.

Treat the marketing page as a Persuade surface: explain the coordination
problem, show a useful example and help visitors choose their next step.

For a substantial change, critique the section being changed, then refine
the relevant layout, typography, copy or interaction. Use audit and adapt
checks for accessibility, performance and screen sizes. Finish with polish
and inspect the rendered result at desktop and narrow sizes. Scale the
review to the change and report only checks actually performed.

## Brand and product basis

The README's “Brand and product basis” section supplies the existing direction.
Use the [approved brand assets](assets/brand/README.md) without redrawing them.
Keep the warm-white, near-black, slate and coral identity.
The mission is to help teams keep building together as their agents write more code.
Distinguish authored illustrations, observed behavior and outcomes
the product still needs to demonstrate.

## Source and delivery

The site is buildless HTML, CSS and JavaScript served by GitHub Pages.
Edit the source files identified in the README.
Keep content readable without JavaScript, with keyboard controls and reduced motion.
Use the existing preview and pull-request workflow.
A design refinement follows the established identity and requested scope.
