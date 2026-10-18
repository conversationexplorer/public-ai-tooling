# Contributing

Thanks for helping. This repo holds agent skills: text playbooks that coding agents follow.

## Ground rules

- One skill per folder under `skills/`, with a `SKILL.md` that has frontmatter (`name`, `description`, `license`, `metadata.version`).
- Register every skill in `skills.json` and in the plugin manifests under `.claude-plugin/` and `.cursor-plugin/`.
- Copy rule: no em dashes, no en dashes, no spaced hyphens used as dashes. Use periods or commas.
- Never put a real API key in an example. Use `pk_...`.
- Skills must never ask an agent to print, log, or commit a key, and must never auto commit user code.

## Check your change

```bash
yarn validate
```

Test a skill by running it with a real coding agent against a local or production Conversation Explorer workspace, and note what you ran in the pull request.

## Versioning

Bump `metadata.version` in the skill, `skills.json`, and both plugin manifests together, and add a line to `CHANGELOG.md`.
