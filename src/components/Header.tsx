export function Header() {
  return (
    <section className="dashboard-section relative overflow-hidden bg-[#F8F4EA] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="relative z-10 space-y-4">
          <p className="inline-block border-2 border-[#121212] bg-[#F0C020] px-3 py-1 text-xs font-black tracking-[0.22em] uppercase">
            Frontend Take-Home Prototype
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-[0.16em] uppercase sm:text-5xl lg:text-6xl">
            Cooking Bot Order Controller
          </h1>
          <p className="max-w-2xl border-l-8 border-[#D02020] pl-4 text-sm font-semibold tracking-[0.08em] uppercase sm:text-base">
            VIP priority queue · 10-second bot processing · in-memory prototype
          </p>
        </div>

        <div className="hidden relative mx-auto h-56 w-full max-w-sm">
          <div className="absolute left-2 top-3 h-16 w-16 rounded-full border-4 border-[#121212] bg-[#D02020]" />
          <div className="absolute left-20 top-0 h-24 w-24 border-4 border-[#121212] bg-[#1040C0]" />
          <div className="absolute right-4 top-12 h-0 w-0 border-b-[88px] border-l-[52px] border-r-[52px] border-b-[#F0C020] border-l-transparent border-r-transparent" />
          <div className="absolute bottom-4 left-0 h-20 w-32 border-4 border-[#121212] bg-white" />
          <div className="absolute bottom-0 left-24 h-14 w-14 rounded-full border-4 border-[#121212] bg-[#F0C020]" />
          <div className="absolute bottom-8 right-2 h-24 w-24 border-4 border-[#121212] bg-[#D02020]" />
          <div className="absolute left-12 top-20 h-3 w-40 rotate-[18deg] bg-[#121212]" />
          <div className="absolute left-10 top-28 h-3 w-32 -rotate-[15deg] bg-[#121212]" />
        </div>
      </div>
    </section>
  );
}
