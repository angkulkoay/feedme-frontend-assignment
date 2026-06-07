type ControlPanelProps = {
  botCount: number;
  onAddNormalOrder: () => void;
  onAddVipOrder: () => void;
  onAddBot: () => void;
  onRemoveBot: () => void;
  onReset: () => void;
};

const buttonStyles = {
  normal:
    "bauhaus-button bg-white px-4 py-3 text-sm font-black tracking-[0.12em] uppercase text-[#121212]",
  vip: "bauhaus-button bg-[#D02020] px-4 py-3 text-sm font-black tracking-[0.12em] uppercase text-white",
  bot: "bauhaus-button bg-[#1040C0] px-4 py-3 text-sm font-black tracking-[0.12em] uppercase text-white",
  remove:
    "bauhaus-button bg-[#F0C020] px-4 py-3 text-sm font-black tracking-[0.12em] uppercase text-[#121212] disabled:opacity-50",
  reset:
    "bauhaus-button bg-[#121212] px-4 py-3 text-sm font-black tracking-[0.12em] uppercase text-white",
};

export function ControlPanel({
  botCount,
  onAddNormalOrder,
  onAddVipOrder,
  onAddBot,
  onRemoveBot,
  onReset,
}: ControlPanelProps) {
  return (
    <section className="bauhaus-panel bg-[#F8F4EA] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-[0.14em] uppercase">
            Control Panel
          </h2>
          <p className="text-sm font-semibold uppercase tracking-[0.08em]">
            Generate orders, scale bots, and reset the full demo state.
          </p>
        </div>
        <div className="bauhaus-chip bg-white">Active Bots: {botCount}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <button
          className={buttonStyles.normal}
          data-testid="new-normal-order-button"
          onClick={onAddNormalOrder}
        >
          New Normal Order
        </button>
        <button
          className={buttonStyles.vip}
          data-testid="new-vip-order-button"
          onClick={onAddVipOrder}
        >
          New VIP Order
        </button>
        <button
          className={buttonStyles.bot}
          data-testid="add-bot-button"
          onClick={onAddBot}
        >
          + Bot
        </button>
        <button
          className={buttonStyles.remove}
          data-testid="remove-bot-button"
          disabled={botCount === 0}
          onClick={onRemoveBot}
        >
          - Bot
        </button>
        <button
          className={buttonStyles.reset}
          data-testid="reset-demo-button"
          onClick={onReset}
        >
          Reset Demo
        </button>
      </div>
    </section>
  );
}
