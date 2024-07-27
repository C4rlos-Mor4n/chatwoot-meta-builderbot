import { createFlow } from "@builderbot/bot";
import { discordFlow, welcomeFlow } from "./flowWelcome";
import { fullSamplesFlow } from "./fullsamples";

export default createFlow([welcomeFlow, fullSamplesFlow, discordFlow]);
