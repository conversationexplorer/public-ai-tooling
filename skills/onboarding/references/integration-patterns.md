# Wiring the user's real agent

## Find the hook point

Look for the one place where a conversation turn is complete. Common shapes:

- A chat endpoint or handler that receives a user message and returns the assistant reply.
- A function that wraps the call to the language model provider.
- An agent loop that alternates model calls and tool calls.
- A webhook from a messaging channel (WhatsApp, Slack, Telegram).

Pick the narrowest place that sees both the user message and the assistant reply. If there are several candidates, ask which one the user cares about most. Change that one place only.

## Conversation id

Use an id the app already has for the whole conversation: a session id, thread id, chat id, or phone number plus date. Pass it as the conversation `externalId` (prefix it with the channel if ids can collide, for example `whatsapp:5491100000000`). Creating a conversation twice with the same `externalId` is safe.

## Rules for the call

- Send one message per turn: the user's message with `role: "USER"`, the reply with `role: "ASSISTANT"`, tool results with `role: "TOOL"`.
- Fire and forget. The agent must never wait on, or fail because of, this call. Catch every error and log the status only. Never log message content or the key.
- Set `timestamp` to the moment the turn happened.
- Read the key from `CONVERSATION_EXPLORER_API_KEY`. Never hardcode it.

## Node (built in `fetch`, Node 18 or newer)

```js
const BASE = process.env.CONVERSATION_EXPLORER_API_BASE ?? 'https://api.conversationexplorer.com'
const headers = {
  Authorization: `Bearer ${process.env.CONVERSATION_EXPLORER_API_KEY}`,
  'Content-Type': 'application/json',
}

async function ensureConversation(externalId) {
  const res = await fetch(`${BASE}/api/v1/conversations`, { method: 'POST', headers, body: JSON.stringify({ externalId }) })
  return (await res.json()).conversationId
}

export function recordTurn({ externalId, channelName, channelUserId, role, content }) {
  // fire and forget: never await this from the agent's request path
  ensureConversation(externalId)
    .then((id) =>
      fetch(`${BASE}/api/v1/conversations/${id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ channelName, channelUserId, role, content, timestamp: new Date().toISOString() }),
      }),
    )
    .catch((err) => console.warn('conversation-explorer: send failed', err.message))
}
```

## Python (requests)

```python
import os, threading, datetime, requests

BASE = os.environ.get("CONVERSATION_EXPLORER_API_BASE", "https://api.conversationexplorer.com")
HEADERS = {"Authorization": f"Bearer {os.environ['CONVERSATION_EXPLORER_API_KEY']}"}

def _send(external_id, channel_name, channel_user_id, role, content):
    try:
        conv = requests.post(f"{BASE}/api/v1/conversations", headers=HEADERS, json={"externalId": external_id}, timeout=10)
        conversation_id = conv.json()["conversationId"]
        requests.post(
            f"{BASE}/api/v1/conversations/{conversation_id}/messages",
            headers=HEADERS,
            timeout=10,
            json={
                "channelName": channel_name,
                "channelUserId": channel_user_id,
                "role": role,
                "content": content,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            },
        )
    except Exception as err:  # never break the agent
        print("conversation-explorer: send failed", type(err).__name__)

def record_turn(*args):
    threading.Thread(target=_send, args=args, daemon=True).start()
```

Adapt to the project's language and HTTP client. These are shapes, not files to copy blindly.

## Then send one message

Trigger one real turn, or run a one-off script that calls the function once with a short test message. Do not wait for the user to do it.
