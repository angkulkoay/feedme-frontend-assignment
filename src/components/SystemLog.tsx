import type { LogEntry } from "@/hooks/useOrderController";
import { formatTimestamp } from "@/lib/time";

type SystemLogProps = {
  logs: LogEntry[];
};

export function SystemLog({ logs }: SystemLogProps) {
  return (
    <section
      className="bauhaus-section bg-[#121212] p-4 text-white"
      data-testid="system-log"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-[0.14em] uppercase">
            System Log
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] sm:text-sm">
            Timestamped event trace for queue, bot, and demo actions.
          </p>
        </div>
        <div className="bauhaus-chip bg-[#F0C020] text-[#121212]">
          {logs.length} events
        </div>
      </div>

      <div className="grid gap-2">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="grid gap-2 border-2 border-white bg-[#121212] p-3 sm:grid-cols-[8rem_1fr] sm:items-start"
            >
              <div className="bauhaus-chip justify-self-start bg-white text-[#121212]">
                {formatTimestamp(log.timestamp)}
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em]">
                {log.message}
              </p>
            </div>
          ))
        ) : (
          <p className="bauhaus-empty border-white text-white">
            No events yet. Start the demo to populate the system log.
          </p>
        )}
      </div>
    </section>
  );
}
