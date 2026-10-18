# Connect the management MCP

Read-only access to the user's Conversation Explorer data: workspaces, conversations, messages, message counts, credit usage and AI reports.

Server URL (text only responses, best for AI assistants): https://mcp.conversationexplorer.com/management?responseFormat=text

Claude Code:

    claude mcp add --transport http conversation-explorer "https://mcp.conversationexplorer.com/management?responseFormat=text"

Then run /mcp, select conversation-explorer, and choose Authenticate. Sign in, pick one organization and approve. No API key is pasted.

Claude.ai or Claude Desktop: Settings, Connectors, Add custom connector, paste the URL.
Other clients (ChatGPT, Cursor, VS Code): add a remote MCP server with the URL and sign in through the browser.

First tries: "list my latest conversations", "show my analysis runs".

Full docs: https://conversationexplorer.com/docs/mcp/
