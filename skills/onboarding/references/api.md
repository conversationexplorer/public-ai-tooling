# Conversation Explorer ingest API

Base URL: `https://api.conversationexplorer.com`. If the environment variable `CONVERSATION_EXPLORER_API_BASE` is set, use it instead. Every path below starts with `/api/v1`.

Authentication on every call: `Authorization: Bearer <pk_ key>`. Read the key from `CONVERSATION_EXPLORER_API_KEY`. Never print it.

The full contract is the public OpenAPI file at `https://api.conversationexplorer.com/openapi.public.yaml`. Use it if anything here seems out of date.

## Key check

`GET /api/v1/conversations/__probe__`

- `404`: the key is valid (the conversation just does not exist). Continue.
- `401`: the key is not valid. Ask the user for a fresh one.
- Anything else: stop and show the status.

## Create a conversation

`POST /api/v1/conversations`

```jsonc
{
  "externalId": "sample-bakery-1",   // your own stable id; repeating it returns the same conversation
  "title": "Wedding cake order"      // optional, defaults to externalId
}
```

Response: `201 { "conversationId": "..." }` for a new one, `200` with the same shape when the `externalId` already exists.

`externalId` may contain letters, digits, `-`, `_`, `.`, `:` (max 200 characters).

## Send one message

`POST /api/v1/conversations/{conversationId}/messages`

```jsonc
{
  "channelName": "web-chat",          // where the conversation happens: whatsapp, web-chat, slack
  "channelUserId": "customer-42",     // stable id of the sender within that channel
  "channelUserName": "Dana",          // optional display name
  "role": "USER",                     // USER, ASSISTANT, TOOL or SYSTEM
  "content": "Hi, can I order a cake for Saturday?",
  "externalId": "sample-bakery-1-m1", // optional, makes retries safe
  "timestamp": "2026-10-12T14:03:22Z" // optional ISO 8601, when it really happened
}
```

Response: `202 { "ingestionId": "...", "status": "PENDING" }`. The message is stored a moment later.

## Send many messages at once

`POST /api/v1/conversations/{conversationId}/messages/bulk` with `{ "messages": [ ...same objects as above... ] }`.

All or nothing: if one message is invalid the whole call is rejected with `400` and the failing `index`. Maximum 500 messages per call. Response: `202` with `ingestions: [{ ingestionId, externalId }]`.

## Check ingestion

`GET /api/v1/ingestion/{ingestionId}` returns `{ "status": "..." }` where status is one of:

- `PENDING`, `PROCESSING`: still on its way.
- `DONE`: stored.
- `BLOCKED`: paused because the workspace is out of credits. It resumes by itself once credits are added.
- `FAILED`: gave up. The response carries an error message.

## Cost

Each new message costs 5 credits. Repeating a message with the same `externalId` is never charged twice.
