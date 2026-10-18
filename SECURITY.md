# Security

To report a vulnerability, email the address listed at https://conversationexplorer.com instead of opening a public issue. Never include real API keys or customer conversations in a report.

Skills in this repo must handle credentials safely: keys live only in a gitignored `.env` or the process environment, are never printed or logged, and are never committed.
