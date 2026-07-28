export default function Loading() {
  return (
    <div className="container-page pb-10 pt-28">
      <div className="skeleton h-[45vh] min-h-[300px] w-full rounded-3xl" />
      <div className="mt-10 space-y-10">
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={row}>
            <div className="skeleton mb-4 h-6 w-44 rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-[145px] shrink-0 sm:w-[168px] lg:w-[190px]">
                  <div className="skeleton aspect-[2/3] rounded-2xl" />
                  <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                  <div className="skeleton mt-2 h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
