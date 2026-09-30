import { runNightlySync } from "../src/lib/sync";

async function main() {
  console.log("Starting CardDex sync…");
  const result = await runNightlySync({ maxCardPages: 6, fullCards: true });
  console.log("Sync complete:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
