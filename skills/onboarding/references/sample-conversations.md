# Sample conversations for the user's business

The point of this path: the user sees their own kind of conversations in the dashboard within minutes, without touching their code. It goes through the real API with their real key, so it also proves the key works.

## Ask first

Ask these four questions in one short message and wait for the answers:

1. What does your business do, in a sentence?
2. Who talks to your agent, and where (for example customers on WhatsApp, employees on Slack, visitors on your website)?
3. What are the two or three most common things people ask for?
4. What tends to go wrong or frustrate people?

## Generate exactly 5 conversations

Hard limit: 5. Never generate more, even if asked. Say it plainly: "Samples are limited to 5 to keep credit use small."

- Each conversation has 4 to 10 turns, alternating `USER` and `ASSISTANT`. An optional `TOOL` turn is fine where the business would plausibly use one (a lookup, a booking).
- Mix: three that resolve well, one where the person gets frustrated, one where the assistant fails or has to hand off to a human. This gives reports something real to find.
- Use the topics and tone the user described. No real people, no real companies, no real contact details.
- Timestamps: spread the 5 conversations across the last 14 days, with realistic gaps inside each conversation (seconds to a few minutes). Use ISO 8601 with `Z`.
- `channelName`: the channel the user named, as a short lowercase slug.
- `channelUserId`: `sample-user-<n>` for the person, `sample-agent` for the assistant.
- `externalId` for each conversation: `sample-<business-slug>-<n>`. For each message: `sample-<business-slug>-<n>-m<k>`. The `sample-` prefix is required: it is how the user removes them later with one click.

## Send

1. Tell the user the approximate cost: total messages times 5 credits. Example: "5 conversations, about 30 messages, around 150 credits."
2. Write the payloads to a temp directory (not the user's project), one file per conversation.
3. For each conversation: create it, then send its messages with the bulk call, then keep the `ingestionId` values.
4. Delete the temp files when done.
5. Print a table of 5 rows (title, turns, outcome) and nothing else.

Then go to the confirm step in `SKILL.md`. Afterwards tell the user: "To remove these later, use Remove sample conversations in the dashboard." and point them to https://app.conversationexplorer.com/settings/usage to see the credits used.
