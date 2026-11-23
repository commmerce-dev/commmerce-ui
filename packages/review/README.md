# @commmerce/review

Review what you build with Commmerce UI, from your coding agent or CI: look components up, check a page locally, and
get a design and code review from Commmerce. A command line tool and an MCP server.

**Private by default.** What you send (from here, the MCP server, or the feedback form,
https://commmerce.com/commmerceui/#apps--feedback) is seen only by Commmerce and your team, and never published. Replies come back only to you
(`commmerce-review status <id>`, `get_review`, or the form's private status link). Screenshots and source are deleted 30 days after
a review is done. Send demo data only. Public GitHub issues are optional, only if you want to report a library bug in public.

Docs: https://commmerce.com/commmerceui/#apps--review

## Key

`submit`, `status`, `wait`, `request-component` and `feedback` need a review key in `COMMMERCE_REVIEW_KEY`. Keys are
issued by Commmerce on request: send the feedback form (type Question). `check` and the component lookup need no key.

## Agents

Claude Code:

```sh
claude mcp add commmerce-review --env COMMMERCE_REVIEW_KEY=cmr_your_key -- npx -y @commmerce/review mcp
```

Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.commmerce-review]
command = "npx"
args = ["-y", "@commmerce/review", "mcp"]
env = { COMMMERCE_REVIEW_KEY = "cmr_your_key" }
```

Remote MCP server (Streamable HTTP, same tools; `check_page` there explains how to run the check locally):
`https://commmerce.com/commmerceui/api/mcp` with the header `Authorization: Bearer cmr_your_key`.

Tools: `search_components`, `get_component`, `check_page`, `submit_review`, `get_review`, `request_component`, `send_feedback`.

## Command line

`check` and `submit` use Playwright (an optional peer dependency): `npm install --save-dev playwright` and
`npx playwright install chromium`.

```sh
npx @commmerce/review check http://localhost:5173/orders           # exits 1 on blockers; --json, --strict
npx @commmerce/review submit http://localhost:5173 --app "Orders app" --screen orders=/orders --wait
npx @commmerce/review submit --images orders@390=phone.png orders@1280=desktop.png --app "Orders app"
npx @commmerce/review status rv_abc123
npx @commmerce/review request-component --name "Swimlanes" --need "Group board columns by owner" --app "CRM"
npx @commmerce/review feedback --kind bug --title "Select clips at 320px" --body "Steps: ..."
npx @commmerce/review help
```

`check` looks for: Commmerce UI on the page and its version, `cm-*` tags that aren't defined, axe-core (WCAG 2.2 A and
AA), sideways scroll at 320, 390, 768 and 1280px, text under 12px, targets under 24px, and native controls where a
`cm-*` component exists. Nothing is sent anywhere.

`submit` takes screenshots at 390, 768 and 1280px on your machine (localhost works). It warns when emails or phone
numbers are visible and sends only with `--yes`.

Made and maintained by Commmerce. See LICENSE.md.
