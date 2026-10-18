# Conversation Explorer AI tooling

Agent skills for [Conversation Explorer](https://conversationexplorer.com). Today: `onboarding`, which gets your first message into your workspace and confirms it arrived.

## Use it

Paste this into your coding agent:

```
Run `npx skills add conversationexplorer/public-ai-tooling --skill onboarding -y` and onboard me to Conversation Explorer
```

Your agent will ask for an API key. Create one at https://app.conversationexplorer.com/settings/api-keys.

If your agent cannot run `npx skills add`, paste this instead:

```
Read https://raw.githubusercontent.com/conversationexplorer/public-ai-tooling/main/skills/onboarding/SKILL.md and onboard me to Conversation Explorer
```

## What the onboarding skill does

1. Checks your project and asks you for an API key. The key only ever goes into a gitignored `.env`.
2. Either generates 5 sample conversations for your business and sends them through the real API, or adds a minimal call at the one place where your agent's conversation turns flow.
3. Confirms the first message arrived. Your dashboard checklist shows First message received.

It never commits, never prints your key, and asks before adding any dependency.

## Install other ways

- **Claude Code plugin:** `/plugin marketplace add conversationexplorer/public-ai-tooling`, then `/plugin install conversation-explorer@conversation-explorer-ai-tooling`.
- **Cursor:** add this repository as a plugin from Settings, Plugins.
- **Manual:** copy `skills/onboarding` into your agent's skills folder (for Claude Code, `.claude/skills/onboarding`).

## Docs

- API reference: https://conversationexplorer.com/docs/api
- Management MCP (read your data from your editor): https://conversationexplorer.com/docs/mcp

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `yarn validate` before opening a pull request.

## License

Apache-2.0. See [LICENSE](LICENSE).
