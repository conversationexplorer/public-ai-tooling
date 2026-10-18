# public-ai-tooling

Public repo (`conversationexplorer/public-ai-tooling`) holding agent skills for Conversation Explorer. The dashboard's "Install with AI" prompt (`conversation-explorer-app/web/src/lib/onboardingPrompts.ts`) points at this repo, so the repo name, the `onboarding` skill name and the raw `SKILL.md` path are a public contract. Do not rename them without updating the app.

- Validate with `yarn validate` (frontmatter, `skills.json` paths, plugin manifests, copy rule, no real `pk_` keys).
- Copy rule: no em dashes, en dashes, or spaced hyphens used as dashes in any markdown or JSON text.
- The onboarding skill must follow the real public API (`conversation-explorer-app/api/openapi.public.yaml`). When the API changes, update `skills/onboarding/references/api.md` in the same release.
- Never commit secrets or real keys. Examples use `pk_...`.
- Package manager: yarn. Commit titles: `<type>(CE-<id>): <summary>`.
