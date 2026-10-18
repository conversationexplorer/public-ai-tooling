---
name: onboarding
description: "Scripted onboarding for Conversation Explorer: API key from the user, then sample conversations for their business or a real integration, verified by the first message landing in the dashboard. Use when adding Conversation Explorer, sending conversations or messages to it, integrating its API, or 'onboard me'."
license: Apache-2.0
compatibility: Requires a coding agent with file and shell access, network access to https://api.conversationexplorer.com, and a Conversation Explorer account. A pk_ API key is needed at the key step.
metadata:
  author: conversationexplorer
  version: "0.1.0"
---

# Conversation Explorer Onboarding

Goal: get the user's first message into their Conversation Explorer workspace, and confirm it landed. Everything else is optional.

## Voice and Tone

Write plainly. Say only what you did or are about to do.

- Status lines, not narration. "Checking your key." "Key works. Sending samples."
- No dashes of any kind in what you say or write: no em dashes, no en dashes, no spaced hyphens. Use periods or commas.
- Never explain internals the user has no context for (queues, workers, idempotency, HTTP verbs).
- Before writing any line, ask whether the user needs it. If not, cut it.
- Reassure plainly about safety. "Nothing is committed without your approval."

## Rules

- The step labels below are your internal roadmap. Never show step names or numbers to the user.
- Enforce sequence. Do not advance until the current stage is done.
- Work silently between decision points. The user may have walked away and should come back to a finished state.
- Speak only when you need the user: the opening, a real decision, a manual step you cannot do for them, or completion. Lead with the outcome.
- Resolve the API base URL and key once, as described in `references/api.md`, and use the same values for every call including polling.
- Never print, log, echo, or hardcode the API key. It lives only in `.env` (gitignored) or the process environment, read as `CONVERSATION_EXPLORER_API_KEY`.
- Never commit. In real mode, work on a branch and leave changes uncommitted for the user to review.
- Ask before adding any dependency. Prefer the HTTP client the project already uses, or the platform's built-in one.
- Never paste generated conversations or long JSON into the chat. Write them to a temp file and summarize.
- If the user tries to skip ahead, acknowledge it, state the concrete consequence in one sentence, and offer a choice. Do not silently comply and do not flatly refuse.
- If a stage fails, stop and resolve it before continuing.

## Kickoff

Three sentences at most: what you will do (connect their conversations to Conversation Explorer and confirm the first message arrives), that nothing is committed without their approval, and that it takes a few minutes. Dashboard: https://app.conversationexplorer.com

Do not ask whether they have an account. If they do not have one, the key step sends them to sign up.

## Step 0: Detect where you are

- Inside a git repo with application code: real mode is possible. Find the project root. If several candidate packages exist, ask which one.
- Empty directory, no app, or not a repo: only sample mode is offered. Do not create branches or files outside a temp directory.

## Step 1: API key

Tell the user to open https://app.conversationexplorer.com/settings/api-keys (or use the key box on the first-run screen), create a key for their workspace, and then give it to you one of two ways:

- Paste it in the chat. You write it to `.env` yourself and never repeat it.
- Put `CONVERSATION_EXPLORER_API_KEY=pk_...` in a gitignored `.env` themselves.

Before writing the key to a file, check the file is safe: run `git ls-files --error-unmatch .env`. If `.env` is already tracked by git, do NOT write the key there (ignoring a tracked file does not stop it from being committed). Write it to `.env.local` instead, make sure `.env.local` is in `.gitignore`, and tell the user in one sentence why. If `.env` is not tracked, make sure it is in `.gitignore` (add it if missing) and write the key there. Never write the key anywhere else.

Verify the key before going on, following `references/api.md` ("Key check"), without ever putting the key on a command line you display (load it from `.env` inside the command): a 404 on the probe means the key is valid, a 401 means it is not. Report the status you got. If it is not valid, ask for the key again. Any other status: stop and show it.

## Step 2: Choose a path

Ask once: "Wire up your real agent now, or generate sample conversations for your business first?" Only ask when both are possible (see Step 0). Both paths end at the same finish line: a message in the dashboard.

## Step 3a: Sample conversations

Follow `references/sample-conversations.md`. Hard limit: 5 conversations. Before sending, tell the user the approximate credit cost (messages times 5). After sending, point them to https://app.conversationexplorer.com/settings/billing to check their balance. Do not try to read the balance yourself; there is no endpoint for it.

## Step 3b: Real integration

Follow `references/integration-patterns.md`. Keep the change minimal and at the one place where conversation turns flow. Use the app's own session or thread id as the conversation `externalId`. Send one message per turn with `role`, `channelName`, `channelUserId` and `timestamp`. Never let the call block or break the agent: it must be fire and forget with errors logged without content.

Then trigger one real turn, or run a one-off script, so at least one message is sent.

## Step 4: Confirm

Poll the ingestion status described in `references/api.md` until it is `DONE`. Handle the other outcomes:

- `PENDING` or `PROCESSING`: keep polling, up to 2 minutes.
- `BLOCKED` on a brand new account: free credits are added within about a minute of signup and the message resumes on its own. Wait and poll for up to 2 more minutes before saying anything else.
- `BLOCKED` after that: say "Ingestion is paused because the workspace is out of credits. Add credits at https://app.conversationexplorer.com/settings/billing and it resumes on its own." Do not retry in a loop.
- `FAILED`: say plainly that this message could not be stored, show the HTTP status you got from the status call, and stop. Do not invent a reason.

When `DONE`: "Your first message is in. Open the dashboard and you will see it, with First message received checked."

## Wrap-up

- Real mode: name the branch and say the changes are uncommitted and ready for review.
- Offer next steps, one line each: run a report on the new conversations (it costs credits, so only if they want it), or connect their editor to the management MCP with `claude mcp add --transport http conversation-explorer https://mcp.conversationexplorer.com/management`. Then stop.

## Redirecting Drift

If the user asks for something unrelated mid-flow, answer briefly, then return to the step you were on. If they ask to skip the key or the confirmation, explain that without it there is no way to know the data arrived, and offer to continue or stop.

## Edge Cases

- No network, or the API host is unreachable: say so, show the status or error, and stop. Do not guess.
- HTTP 429 on ingest: back off and retry a few times with growing pauses. If it persists, treat it as the out of credits case above.
- HTTP 400 on ingest: the response body names the field. Fix your payload, never the user's data.
- Windows or restricted shells: write the temp payloads with the language runtime you already use for the project instead of shell heredocs.
- The user is on a self hosted or local instance: they set `CONVERSATION_EXPLORER_API_BASE` (default `https://api.conversationexplorer.com`). A 401 or 403 when polling usually means you are polling a different host than you sent to.

## References

- `references/api.md`: base URL, auth, the three calls, status values, key check.
- `references/sample-conversations.md`: the questions to ask and how to generate the 5 samples.
- `references/integration-patterns.md`: finding the hook point, and ready snippets for Node and Python.
