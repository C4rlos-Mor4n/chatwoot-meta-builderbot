import downloadFile from "../../utils/downloaderUtils";
import { config } from "../../config";

class ServerHttp {
  private provider: any;
  private bot: any;

  constructor(provider = undefined, bot = undefined) {
    if (!provider || !bot) {
      throw new Error("DEBES_DE_PASAR_BOT");
    }
    this.provider = provider;
    this.bot = bot;
    provider.server.post("/chatwoot", this.chatwootCtrl);
  }

  /**
   * Este el controlador del los enventos del Chatwoot
   * @param {*} req
   * @param {*} res
   */
  chatwootCtrl = async (req: any, res: any) => {
    const body = req.body;
    const attachments = body?.attachments;
    try {
      const mapperAttributes = body?.changed_attributes
        ?.map((a) => Object.keys(a))
        .flat(2);

      /**
       * Esta funcion se encarga de agregar o remover el numero a la blacklist
       * eso quiere decir que podemos hacer que el chatbot responda o no
       * para que nos sirve, para evitar que el chatbot responda mientras
       * un agente humano esta escribiendo desde chatwoot
       */
      if (
        body?.event === "conversation_updated" &&
        mapperAttributes.includes("assignee_id")
      ) {
        const phone = body?.meta?.sender?.phone_number.replace("+", "");
        const idAssigned =
          body?.changed_attributes[0]?.assignee_id?.current_value ?? null;

        if (idAssigned) {
          this.bot.dynamicBlacklist.add(phone);
        } else {
          this.bot.dynamicBlacklist.remove(phone);
        }
        res.statusCode = 200;
        res.end("ok");
        return;
      }

      if (
        body?.content_type === "input_csat" &&
        body?.event === "message_created" &&
        body?.conversation?.channel.includes("Channel::Api") &&
        body?.private === false &&
        body?.content?.includes("Por favor califica esta conversación") &&
        body?.conversation?.status === "resolved"
      ) {
        const phone = body.conversation?.meta?.sender?.phone_number.replace(
          "+",
          ""
        );
        const content = body?.content ?? "";
        const updatedContent = content.replace(
          "http://0.0.0.0:3000",
          config.CHATWOOT_ENDPOINT
        );

        await this.provider.sendMessage(`${phone}@c.us`, updatedContent, {});
        res.statusCode = 200;
        res.end("ok");

        if (this.bot.dynamicBlacklist.checkIf(phone)) {
          this.bot.dynamicBlacklist.remove(phone);
        }

        return;
      }

      /**
       * La parte que se encarga de determinar si un mensaje es enviado al whatsapp del cliente
       */
      const checkIfMessage =
        body?.private == false &&
        body?.event == "message_created" &&
        body?.message_type === "outgoing" &&
        body?.conversation?.channel.includes("Channel::Api");
      if (checkIfMessage) {
        const phone = body.conversation?.meta?.sender?.phone_number.replace(
          "+",
          ""
        );
        const content = body?.content ?? "";

        const file = attachments?.length ? attachments[0] : null;
        if (file) {
          console.log(`Este es el archivo adjunto...`, file.data_url);
          const { fileName, filePath, fileBuffer, extension } =
            await downloadFile(file.data_url);

          switch (extension) {
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
            case "webp":
              await this.provider.sendImage(`${phone}@c.us`, filePath, content);
              break;
            case "mp4":
            case "avi":
            case "mov":
              await this.provider.sendVideo(`${phone}@c.us`, filePath, content);
              break;
            case "oga":
            case "wav":
            case "mp3":
              await this.provider.sendAudio(`${phone}@c.us`, filePath);
              break;
            case "pdf":
              await this.provider.sendFile(`${phone}@c.us`, filePath, content);
              break;
            default:
              await this.provider.sendFile(`${phone}@c.us`, filePath, content);
          }

          res.statusCode = 200;
          res.end("ok");
          return;
        }

        /**
         * esto envia un mensaje de texto al ws
         */
        await this.provider.sendMessage(`${phone}@c.us`, content, {});

        res.statusCode = 200;
        res.end("ok");
        return;
      }
    } catch (error) {
      console.log(error);
      res.statusCode = 405;
      res.end("Error");
      return;
    }
  };
}

export default ServerHttp;
