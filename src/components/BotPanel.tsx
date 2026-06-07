import type { Bot, Order } from "@/hooks/useOrderController";
import { getRemainingSeconds } from "@/lib/time";

type BotPanelProps = {
  bots: Bot[];
  currentTime: number;
  processingOrders: Order[];
};

export function BotPanel({
  bots,
  currentTime,
  processingOrders,
}: BotPanelProps) {
  const processingById = new Map(processingOrders.map((order) => [order.id, order]));

  return (
    <section
      className="dashboard-section flex min-h-[26rem] flex-col bg-[#1040C0] p-4 text-white"
      data-testid="bot-panel"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-[0.14em] uppercase">
            Bots / Processing
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] sm:text-sm">
            Every bot handles one order at a time and completes it in exactly
            10 seconds.
          </p>
        </div>
        <div className="status-badge bg-white text-[#121212]">
          {bots.length} bots
        </div>
      </div>

      <div className="grid flex-1 gap-3 md:grid-cols-2">
        {bots.length > 0 ? (
          bots.map((bot) => {
            const currentOrder = bot.currentOrderId
              ? processingById.get(bot.currentOrderId)
              : undefined;
            const remainingSeconds =
              bot.status === "PROCESSING"
                ? getRemainingSeconds(bot.startedAt, currentTime)
                : null;

            return (
              <article
                key={bot.id}
                className="dashboard-card flex flex-col gap-3 bg-white p-4 text-[#121212]"
                data-testid={`bot-card-${bot.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.1em] uppercase">
                      Bot Number
                    </p>
                    <h3 className="text-3xl font-black tracking-[0.12em] uppercase">
                      #{bot.id}
                    </h3>
                  </div>
                  <div
                    className={`status-badge ${
                      bot.status === "PROCESSING"
                        ? "bg-[#D02020] text-white"
                        : "bg-[#F0C020] text-[#121212]"
                    }`}
                  >
                    {bot.status}
                  </div>
                </div>

                {currentOrder ? (
                  <div className="space-y-2">
                    <div className="status-badge inline-flex bg-[#1040C0] text-white">
                      Order #{currentOrder.id}
                    </div>
                    <p className="text-sm font-bold uppercase tracking-[0.08em]">
                      Type: {currentOrder.type}
                    </p>
                    <p className="text-lg font-black uppercase tracking-[0.1em]">
                      Countdown: {remainingSeconds}s
                    </p>
                  </div>
                ) : (
                  <div className="empty-state bg-[#F8F4EA]">
                    Idle and waiting for the next order.
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div
            className="dashboard-card flex items-center justify-center bg-white p-6 text-center text-[#121212]"
            data-testid="bot-empty-state"
          >
            <p className="text-lg font-black uppercase tracking-[0.1em]">
              No bots online. Add one to start processing the queue.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
