import { addKeyword } from "@builderbot/bot";

const discordFlow = addKeyword("doc").addAnswer(
  [
    "You can see the documentation here",
    "📄 https://builderbot.app/docs \n",
    "Do you want to continue? *yes*",
  ].join("\n"),
  { capture: true },
  async (ctx, { flowDynamic }) => {
    if (ctx.body.toLocaleLowerCase().includes("yes")) {
      return await flowDynamic("Thanks!");
    }
    await flowDynamic("Thanks!");
    return;
  }
);

const welcomeFlow = addKeyword(["hi", "hello", "hola"])
  .addAnswer(`🙌 Hello welcome to this *Chatbot*`)
  .addAnswer(
    [
      "I share with you the following links of interest about the project",
      "👉 *doc* to view the documentation",
    ].join("\n"),
    { delay: 800, capture: true },
    async (ctx, { fallBack }) => {
      if (!ctx.body.toLocaleLowerCase().includes("doc")) {
        return fallBack("You should type *doc*");
      }
      return;
    },
    [discordFlow]
  );

export { welcomeFlow, discordFlow };
