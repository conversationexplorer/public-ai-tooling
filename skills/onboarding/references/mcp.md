# Connect the management MCP

Read-only access to the user's Conversation Explorer data: list workspaces, list and read conversations, read analysis runs and credit usage.

Server URL: https://mcp.conversationexplorer.com/management
Transport: HTTP. Sign in with the Conversation Explorer account when the client asks.

Claude Code:

    claude mcp add --transport http conversation-explorer https://mcp.conversationexplorer.com/management

Other clients: add a remote HTTP MCP server with the URL above.

First tries: "list my latest conversations", "show my analysis runs".
