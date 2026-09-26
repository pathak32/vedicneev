import type { Prisma, PrismaClient } from "@vedicneev/db";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Round-robin assigns every roster entry (in sequenceNumber order) across
 * `setLabels` — shared by generate-sets/route.ts (after a fresh shuffle)
 * and the document-upload save route (after adding/updating one set's
 * real, unshuffled content), so BOTH ways of populating a batch's sets
 * rebalance the roster the exact same way. Always re-assigns every
 * roster entry from scratch rather than only the unassigned ones, so
 * re-running either flow with a different setLabels list (e.g. Set D
 * uploaded after A-C already existed) redistributes fairly instead of
 * leaving the original assignment lopsided.
 *
 * Grouped into one updateMany per set label (setLabels.length queries
 * total), not one update per roster entry: a coaching institute's test
 * batch routinely runs into the hundreds of students, and hundreds of
 * sequential awaited single-row updates inside one interactive
 * transaction reliably blew past Prisma's default 5-second transaction
 * timeout — the transaction then threw, and since neither caller wraps
 * this in a try/catch, that surfaced to the client as an opaque "Network
 * error" (an unhandled-exception HTML page instead of JSON) rather than
 * any real feedback. Reproduced on a real 200-student batch.
 */
export async function assignRosterToSets(
  tx: Tx,
  testBatchId: string,
  rosterEntries: { id: string }[],
  setLabels: string[]
): Promise<void> {
  const idsBySetCode = new Map<string, string[]>();
  for (let i = 0; i < rosterEntries.length; i++) {
    const entry = rosterEntries[i]!;
    const setCode = setLabels[i % setLabels.length]!;
    const ids = idsBySetCode.get(setCode) ?? [];
    ids.push(entry.id);
    idsBySetCode.set(setCode, ids);
  }

  await Promise.all(
    Array.from(idsBySetCode.entries()).map(([setCode, ids]) =>
      tx.testBatchRosterEntry.updateMany({ where: { id: { in: ids } }, data: { setCode } })
    )
  );
}
