interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}

export function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = "rounded-[8px]",
}: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse",
        height,
        width,
        rounded,
        className,
      ].join(" ")}
      style={{ background: "var(--border-light)" }}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={["rounded-[12px] p-4 flex flex-col gap-3", className].join(" ")}
      style={{
        background: "var(--offwhite-2)",
        border: "0.5px solid var(--border-light)",
      }}
    >
      <Skeleton height="h-3" width="w-24" />
      <Skeleton height="h-5" width="w-3/4" />
      <Skeleton height="h-3" width="w-1/2" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Hero */}
      <div
        className="rounded-[12px] p-5 flex flex-col gap-3"
        style={{ background: "var(--navy-deep)" }}
      >
        <Skeleton height="h-3" width="w-20" />
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-2" width="full" rounded="rounded-full" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Habits */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[12px] p-4 flex items-center gap-3"
            style={{
              background: "var(--offwhite-2)",
              border: "0.5px solid var(--border-light)",
            }}
          >
            <Skeleton height="h-6" width="w-6" rounded="rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton height="h-3" width="w-2/3" />
              <Skeleton height="h-2.5" width="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
