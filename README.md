# Bauhaus McDonald's Order Controller

Frontend-only prototype for the `feedmepos/se-take-home-assignment` frontend option. The app demonstrates a VIP-priority cooking queue, multiple concurrent cooking bots, cancellation on bot removal, and a timestamped event log in a Bauhaus-inspired dashboard.

## Assignment Choice

Frontend

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- React hooks
- In-memory state only

## How to Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How to Build

```bash
npm run lint
npm run build
```

## Deployment Suggestion

Deploy to Vercel for the simplest public hosting path for a Next.js frontend prototype.

## Architecture Notes

- `src/hooks/useOrderController.ts` is the single source of truth for all order, bot, timer, and log behavior.
- `src/lib/orderQueue.ts` owns VIP/NORMAL insertion rules and queue position lookup.
- `src/lib/time.ts` owns timestamp formatting and countdown math.
- UI components stay presentation-focused and receive data plus actions from the hook.

## Requirement Checklist

- [x] New Normal Order creates a unique increasing order number in `pendingOrders`
- [x] New VIP Order creates a unique increasing order number and inserts after existing VIPs but before normal orders
- [x] Order numbers are unique and increasing within the session
- [x] `+ Bot` creates a new bot and immediately assigns the first pending order when available
- [x] Each bot processes only one order at a time
- [x] Each order takes exactly 10 seconds to complete after pickup
- [x] Completed orders move from PROCESSING to COMPLETE after 10 seconds
- [x] Bots automatically pick the next pending order after completion
- [x] Bots become IDLE when no pending order remains
- [x] `- Bot` removes the newest bot
- [x] Removing the newest processing bot cancels its work and returns the order to the pending queue with VIP/NORMAL priority preserved
- [x] No persistence, backend, database, or authentication
- [x] Single-page dashboard includes header, controls, pending, processing, completed, and system log sections
- [x] Order cards display number, type, status, and queue position when pending
- [x] Bot cards display bot number, status, current order, and visible countdown
- [x] System log shows timestamped major lifecycle events

## VIP Queue Behavior

VIP orders preserve FIFO among themselves while always staying ahead of all normal orders. Normal orders preserve FIFO among themselves. That means:

- Existing VIPs stay first
- New VIPs join after the current VIP block
- Normal orders always remain behind the VIP block

Example:

- Add Normal `#1`
- Add Normal `#2`
- Add VIP `#3`
- Pending becomes `#3`, `#1`, `#2`

## Bot Removal Behavior

When `- Bot` is clicked, the newest bot is removed.

- If the newest bot is idle, it is simply removed.
- If the newest bot is processing, its current order is cancelled immediately.
- The cancelled order returns to `PENDING` using the same VIP/NORMAL queue rules.
- Remaining idle bots can immediately pick that order back up if capacity exists.
- The system log records both the cancellation and the bot removal.

## Manual Test Scenario

Use this sequence to verify the assignment behavior:

1. Add Normal `#1`
2. Add Normal `#2`
3. Add VIP `#3`
4. Confirm pending order order is `#3`, `#1`, `#2`
5. Add 2 bots and confirm 2 orders process at the same time
6. Add another VIP while bots are processing
7. Remove the newest bot while it is processing
8. Confirm its order returns to pending in the correct position
9. Wait for processing to complete
10. Confirm bots become idle when no pending orders remain
