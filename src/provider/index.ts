import { createProvider } from "@builderbot/bot";
import { MetaProvider as Provider } from "@builderbot/provider-meta";
import { config } from "../config";

export const provider = createProvider(Provider, {
  jwtToken: config.jwtToken,
  numberId: config.numberId,
  verifyToken: config.verifyToken,
  version: "v18.0",
});
