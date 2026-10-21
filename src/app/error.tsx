"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {error.message || "A server error occurred. Try reloading the page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[#FFD700] px-5 py-2.5 text-sm font-semibold text-[#0B0E14]"
      >
        Try again
      </button>
    </div>
  );
}
