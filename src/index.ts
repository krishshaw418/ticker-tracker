import { createServer } from "./lib/server";
import bot from "./bot/bot";
import { config } from "./lib/config";

async function main(): Promise<void> {
  const app = await createServer();
  const PORT = config.port;

  // start the server
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}...`);
  });

  // start the bot
  bot.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
