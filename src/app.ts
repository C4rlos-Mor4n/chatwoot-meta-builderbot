import { ChatwootClass } from "./services/chatwoot/chatwoot.class";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { downloadFile } from "./utils/downloaderUtils";
import { createBot, MemoryDB } from "@builderbot/bot";
import { handlerMessage } from "./services/chatwoot";
import ServerHttp from "./services/http";
import * as mimeType from "mime-types";
import { provider } from "./provider";
import Queue from "queue-promise";
import { config } from "./config";
import fs from "fs/promises";
import templates from "./templates";

const chatwoot = new ChatwootClass({
  account: config.CHATWOOT_ACCOUNT_ID,
  token: config.CHATWOOT_TOKEN,
  endpoint: config.CHATWOOT_ENDPOINT,
});

const queue = new Queue({
  concurrent: 1,
  interval: 500,
});

const main = async () => {
  const bot = await createBot({
    database: new MemoryDB(),
    provider,
    flow: templates,
  });

  new ServerHttp(provider, bot);

  provider.on("message", (payload) => {
    queue.enqueue(async () => {
      try {
        const attachment = [];
        /**
         * Determinar si el usuario esta enviando una imagen o video o fichero
         * luego puedes ver los fichero en http://localhost:3001/file.pdf o la extension
         */
        if (payload?.body.includes("_event_") && payload?.url) {
          const { fileName, filePath } = await downloadFile(
            payload.url,
            config.jwtToken
          );
          console.log(`[FIECHERO CREADO] http://localhost:3001/${fileName}`);
          attachment.push(filePath);
        }

        await handlerMessage(
          {
            phone: payload.from,
            name: payload.pushName,
            message: payload?.body.includes("_event_")
              ? "Archivo adjunto"
              : payload.body,
            attachment,
            mode: "incoming",
          },
          chatwoot
        );
      } catch (err) {
        console.log("ERROR", err);
      }
    });
  });

  /**
   * Los mensajes salientes (cuando el bot le envia un mensaje al cliente ---> )
   */
  bot.on("send_message", (payload) => {
    queue.enqueue(async () => {
      const attachment = [];

      if (payload.options?.media) {
        if (payload.options.media.includes("http")) {
          const { fileName, filePath } = await downloadFile(
            payload.options.media
          );
          console.log(`[FIECHERO CREADO] http://localhost:3001/${fileName}`);
          attachment.push(filePath);
        }

        attachment.push(payload.options.media);
      }

      await handlerMessage(
        {
          phone: payload.from,
          name: payload.from,
          message: payload.answer,
          mode: "outgoing",
          attachment: attachment,
        },
        chatwoot
      );
    });
  });

  bot.httpServer(+config.PORT);
};

main();
