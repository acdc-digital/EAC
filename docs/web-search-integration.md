# Anthropic Web Search Integration (Instructions Agent)

This enables Claude to browse the web during `/instructions` generation. Results are cited and appended to the markdown under a “Sources” section.

## What’s included

- Server-side integration in `eac/convex/chatActions.ts`
  - Adds Anthropic `tools: [{ type: "web_search_20250305", name: "web_search" }]`
  - Claude decides when to search; we collect citations and results
  - Appends a deduped “## Sources” list of clickable links
- Env-based configuration and safety (domain filters, localization, rate limit)

## Environment variables

Set these in your Convex deployment environment (preferred) or the server environment where `chatActions.ts` runs:

- `EAC_WEB_SEARCH_ENABLED` (default: `true`)
- `EAC_WEB_SEARCH_MAX_USES` (default: `5`)
- `EAC_WEB_SEARCH_ALLOWED_DOMAINS` (comma/line-separated; optional)
- `EAC_WEB_SEARCH_BLOCKED_DOMAINS` (comma/line-separated; optional; don’t use with allowed list)
- `EAC_WEB_SEARCH_CITY` (optional)
- `EAC_WEB_SEARCH_REGION` (optional)
- `EAC_WEB_SEARCH_COUNTRY` (optional)
- `EAC_WEB_SEARCH_TIMEZONE` (optional; IANA tz like `America/Los_Angeles`)

Note: Your Anthropic org admin must enable Web Search in Console.

## Usage

In the terminal chat:

- Example: `/instructions create new instructions for a marketing campaign on all available platforms`
- Claude may search, cite sources, and the file will be saved under the Instructions project.

## Notes

- If Web Search isn’t available or exceeds `max_uses`, content still generates without sources.
- Citations from text blocks are collected when present and added to Sources.
- UI should render links clearly (already handled by markdown rendering in the editor).

## Future enhancements

- Prompt caching with `cache_control` breakpoints to reduce cost on follow-up turns.
- Per-request domain filters from user input (safely constrained by env).
- UI toggle to enable/disable search per `/instructions` run.
