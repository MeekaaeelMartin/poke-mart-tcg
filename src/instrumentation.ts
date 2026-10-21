export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDatabase } = await import("./lib/ensureDatabase");
    await ensureDatabase().catch((err) => {
      console.error("[instrumentation] ensureDatabase failed", err);
    });
  }
}
