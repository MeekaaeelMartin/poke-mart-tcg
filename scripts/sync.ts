import "dotenv/config";
import { runNightlySync } from "../src/lib/sync";

async function main() {
  console.log("Starting CardDex sync…");
  const pages = Number(process.env.SYNC_CARD_PAGES || 25);
  const result = await runNightlySync({ maxCardPages: pages, fullCards: true });
  console.log("Sync complete:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
