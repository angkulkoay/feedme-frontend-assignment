import type { Order } from "@/hooks/useOrderController";

type OrderCardProps = {
  order: Order;
  queuePosition?: number | null;
  onCancel?: (orderId: number) => void;
};

const typeClasses: Record<Order["type"], string> = {
  VIP: "bg-[#D02020] text-white",
  NORMAL: "bg-[#F0C020] text-[#121212]",
};

const statusClasses: Record<Order["status"], string> = {
  PENDING: "bg-white text-[#121212]",
  PROCESSING: "bg-[#1040C0] text-white",
  COMPLETE: "bg-[#121212] text-white",
  CANCELLED: "bg-[#D02020] text-white",
};

export function OrderCard({ order, queuePosition, onCancel }: OrderCardProps) {
  return (
    <article className="dashboard-card p-4" data-testid={`order-card-${order.id}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.1em] uppercase">
            Order Number
          </p>
          <h3 className="text-3xl font-black tracking-[0.12em] uppercase">
            #{order.id}
          </h3>
        </div>
        <div className={`status-badge ${typeClasses[order.type]}`}>
          {order.type}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className={`status-badge ${statusClasses[order.status]}`}>
          {order.status}
        </div>
        {typeof queuePosition === "number" ? (
          <div className="status-badge bg-white">
            Queue Position: {queuePosition}
          </div>
        ) : null}
      </div>

      {onCancel ? (
        <div className="mt-4">
          <button
            className="dashboard-button bg-[#121212] px-3 py-2 text-xs font-black tracking-[0.12em] uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
            data-testid={`cancel-order-button-${order.id}`}
            disabled={order.status !== "PENDING"}
            onClick={() => onCancel(order.id)}
            type="button"
          >
            {order.status === "CANCELLED" ? "Cancelled" : "Cancel Order"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
