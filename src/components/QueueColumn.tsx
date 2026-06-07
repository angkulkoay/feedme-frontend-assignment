import type { ReactNode } from "react";

type QueueColumnProps = {
  title: string;
  description: string;
  count: number;
  accentClassName: string;
  testId: string;
  children: ReactNode;
};

export function QueueColumn({
  title,
  description,
  count,
  accentClassName,
  testId,
  children,
}: QueueColumnProps) {
  return (
    <section
      className="bauhaus-section flex min-h-[26rem] flex-col p-4"
      data-testid={testId}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-[0.14em] uppercase">
            {title}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] sm:text-sm">
            {description}
          </p>
        </div>
        <div className={`bauhaus-chip shrink-0 ${accentClassName}`}>
          {count} items
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </section>
  );
}
