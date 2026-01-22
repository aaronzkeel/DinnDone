# DinnDone Dev Server Loop Recovery (2025-01-19)

## Summary
After the rename to DinnDone and a brief worktree experiment, the app started flashing/reloading in Chrome. The loop was caused by server-side failures (500s) rather than a browser or service worker issue. We resolved it by standardizing on a single tree, ensuring Convex runs before Next, and performing a clean rebuild when Turbopack panicked.

## What Happened (Short Timeline)
- Renamed the app to DinnDone and updated code/docs/metadata.
- Created a worktree and ran Next and Convex from different directories.
- Chrome showed a flashing reload loop; the UI sometimes still said "Dinner Bell".
- Dev logs showed 500s from Convex client missing its address and, later, a Turbopack fatal about "Next.js package not found".
- We reverted to a single-tree flow, rebuilt cleanly, and restarted services in order.

## Root Causes
1) **Mixed runtime contexts**
   - Next and Convex were started from different directories (main repo vs worktree), causing config and runtime mismatches.

2) **Convex not running when Next started**
   - Next booted without a live Convex backend, causing server errors and repeated reloads.

3) **Missing node_modules after cleanup**
   - Turbopack fatally errored when the Next package could not be found.

## Final Fix
- Standardized on **single-tree** flow (no worktrees).
- Performed a clean rebuild:
  - Kill all dev servers
  - Remove `.next` and `node_modules`
  - `npm install`
  - `npm run build`
- Restarted services in order:
  1) `npx convex dev`
  2) `./nukemac.sh`

## Verified Outcome
- Convex reports "functions ready"
- Next reports "ready" on http://localhost:3002
- Page loads with **DinnDone** header and no reload loop

## Recommended Restart Flow (Single Tree)
1) Stop Next (`Ctrl+C`)
2) Stop Convex (`Ctrl+C`)
3) Start Convex: `npx convex dev`
4) Start Next: `./nukemac.sh`

## Troubleshooting Signals
- **Flashing loop:** check server logs; usually 500s from backend not ready.
- **"No address provided to ConvexReactClient":** Convex not running or config not available to the Next process.
- **Turbopack fatal (Next.js package not found):** delete `.next` and `node_modules`, then reinstall and rebuild.
