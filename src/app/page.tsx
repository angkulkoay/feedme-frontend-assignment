"use client";

import { BotPanel } from "@/components/BotPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { QueueColumn } from "@/components/QueueColumn";
import { SystemLog } from "@/components/SystemLog";
import { useOrderController } from "@/hooks/useOrderController";
import { getQueuePosition } from "@/lib/orderQueue";

export default function Home() {
  const {
    pendingOrders,
    processingOrders,
    completedOrders,
    bots,
    logs,
    currentTime,
    addNormalOrder,
    addVipOrder,
    addBot,
    removeBot,
    reset,
  } = useOrderController();

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-[#121212] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Header />

        <ControlPanel
          botCount={bots.length}
          onAddBot={addBot}
          onAddNormalOrder={addNormalOrder}
          onAddVipOrder={addVipOrder}
          onRemoveBot={removeBot}
          onReset={reset}
        />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_1.2fr_1fr]">
          <QueueColumn
            accentClassName="bg-[#F0C020]"
            count={pendingOrders.length}
            description="VIP orders stay ahead of normal orders while preserving FIFO inside each type."
            testId="pending-queue"
            title="Pending Queue"
          >
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  queuePosition={getQueuePosition(pendingOrders, order.id)}
                />
              ))
            ) : (
              <p className="empty-state">
                No pending orders. Add one from the control panel.
              </p>
            )}
          </QueueColumn>

          <BotPanel
            bots={bots}
            currentTime={currentTime}
            processingOrders={processingOrders}
          />

          <QueueColumn
            accentClassName="bg-[#1040C0] text-white"
            count={completedOrders.length}
            description="Finished orders remain visible here for the current demo session."
            testId="completed-orders"
            title="Complete"
          >
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="empty-state">
                Completed orders will stack here after their 10-second cook
                cycle.
              </p>
            )}
          </QueueColumn>
        </section>

        <SystemLog logs={logs} />
      </div>
    </main>
  );
}
