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

## Pace

Be a patient guide. Go in small baby steps.

- One instruction per message. Never stack two things for the user to do.
- Keep each message to a few short lines. If something needs more, split it across messages.
- After each instruction, ask a short confirmation ("Done?", "Did that work?") and wait. Do not move on until the user answers.
- Never dump lists of steps, long explanations or walls of text. Offer detail only if asked.
- If the user seems lost or slow, stay calm, rephrase simply, and repeat the same single step.
- The rules below limit how much you say between steps. They never mean skipping the confirmation.

## Rules

- The step labels below are your internal roadmap. Never show step names or numbers to the user.
- Enforce sequence. Do not advance until the current stage is done.
- Do your own work (files, probes, polling) silently, in one go, and report the outcome briefly. Speak when you need the user: the opening, a real decision, a manual step you cannot do for them, or completion. Lead with the outcome, then give the single next step.
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

Go one move at a time. First, tell the user to open https://app.conversationexplorer.com/settings/api-keys (or use the key box on the first-run screen) and create a key for their workspace. Ask them to say "done" when they have it. Only then, in a separate message, offer the two ways to hand it over:

- Paste it in the chat. You write it to `.env` yourself and never repeat it.
- Put `CONVERSATION_EXPLORER_API_KEY=pk_...` in a gitignored `.env` themselves.

Before writing the key to a file, check the file is safe: run `git ls-files --error-unmatch .env`. If `.env` is already tracked by git, do NOT write the key there (ignoring a tracked file does not stop it from being committed). Write it to `.env.local` instead, make sure `.env.local` is in `.gitignore`, and tell the user in one sentence why. If `.env` is not tracked, make sure it is in `.gitignore` (add it if missing) and write the key there. Never write the key anywhere else.

Verify the key before going on, following `references/api.md` ("Key check"), without ever putting the key on a command line you display (load it from `.env` inside the command): a 404 on the probe means the key is valid, a 401 means it is not. Report the status you got. If it is not valid, ask for the key again. Any other status: stop and show it.

## Step 2: Choose a path

Ask once: "Wire up your real agent now, or generate sample conversations for your business first?" Only ask when both are possible (see Step 0). Both paths end at the same finish line: a message in the dashboard.

## Step 3a: Sample conversations

Follow `references/sample-conversations.md`. Hard limit: 5 conversations. Before sending, tell the user the approximate credit cost (messages times 5). Do not try to read usage or balance yourself; there is no endpoint for it. The usage and billing pages are covered by the tour in Step 5.

## Step 3b: Real integration

Follow `references/integration-patterns.md`. Keep the change minimal and at the one place where conversation turns flow. Use the app's own session or thread id as the conversation `externalId`. Send one message per turn with `role`, `channelName`, `channelUserId` and `timestamp`. Never let the call block or break the agent: it must be fire and forget with errors logged without content.

Then trigger one real turn, or run a one-off script, so at least one message is sent.

## Step 4: Confirm

Poll the ingestion status described in `references/api.md` until it is `DONE`. Handle the other outcomes:

- `PENDING` or `PROCESSING`: keep polling, up to 2 minutes.
- `BLOCKED` on a brand new account: free credits are added within about a minute of signup and the message resumes on its own. Wait and poll for up to 2 more minutes before saying anything else.
- `BLOCKED` after that: say "Ingestion is paused because the workspace is out of credits. Add credits at https://app.conversationexplorer.com/settings/billing and it resumes on its own." Do not retry in a loop.
- `FAILED`: say plainly that this message could not be stored, show the HTTP status you got from the status call, and stop. Do not invent a reason.

When `DONE`, say "Your first message is in." and go to Step 5.

## Step 5: Guided tour

Three stops, in this order. At each stop give one short instruction with the link, then ask a yes or no question and wait for the answer. Never present the next stop, or run any other action, until the user confirms the current one. If they answer no, ask what they see, help briefly, and ask again. If they want to stop, stop.

1. Conversations: "Open https://app.conversationexplorer.com, pick your workspace and open the conversations that just arrived. Have you checked them? (yes / no)" In sample mode add that the titles start with the business they described. In real mode say to look for the conversation from the turn you sent.
2. Usage: "Now open https://app.conversationexplorer.com/settings/usage to see the credits these messages used. Have you checked it? (yes / no)"
3. Billing: "Last stop: https://app.conversationexplorer.com/settings/billing shows your plan and balance, and where to add credits. Have you checked it? (yes / no)"

Do not read usage or balance yourself; there is no endpoint for it. After the third confirmation, go to the wrap-up.

## Wrap-up

After the third tour confirmation, celebrate briefly: the onboarding is complete, the first message arrived and they know where conversations, usage and billing live.

- Invite them to open the Reports section in the dashboard sidebar. Say it is just to take a look: running a report spends credits, so there is no need to run one yet.
- Sample mode: encourage them to wire up their real AI agent before spending more credits, since reports are most useful on real conversations. Offer to do it now by running this skill's real integration path (Step 3b). Tell them "To remove the samples later, use Remove sample conversations in the dashboard."
- Real mode: name the branch and say the changes are uncommitted and ready for review. Encourage them to let real traffic flow before running reports.
- Key hygiene, always: the user shared an API key with you during this session, so encourage them to rotate it. At https://app.conversationexplorer.com/settings/api-keys they remove the key used here and create a new one for their real integration. Offer to update the key in the env file you wrote to (never print it).
- Cleanup, only if the user wants to remove the demo data: first instruct them to remove the API key at the same page (this step is always part of cleanup). Then encourage them to remove the workspace holding the demo data in Settings, Workspaces. Say that deleting a workspace deletes everything in it, so it is only right when the workspace was created just for this trial; otherwise use Remove sample conversations in the dashboard. Do not delete anything yourself.
- MCP, important: invite them to connect their editor to the management MCP so their AI assistant can list conversations and read reports without opening the dashboard. Do not paste instructions from memory. Give them this plain text page, a few lines, and read it yourself only if they ask for help: https://raw.githubusercontent.com/conversationexplorer/public-ai-tooling/main/skills/onboarding/references/mcp.md. Do not run the install for them. Then stop.

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
- `references/mcp.md`: plain text page for connecting the management MCP.
- `references/integration-patterns.md`: finding the hook point, and ready snippets for Node and Python.
