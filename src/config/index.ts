import "dotenv/config";

export const config = {
  CHATWOOT_ACCOUNT_ID: process.env.CHATWOOT_ACCOUNT_ID,
  CHATWOOT_TOKEN: process.env.CHATWOOT_TOKEN,
  CHATWOOT_ENDPOINT: process.env.CHATWOOT_ENDPOINT,
  jwtToken: process.env.jwtToken,
  numberId: process.env.numberId,
  verifyToken: process.env.verifyToken,
  PORT: process.env.PORT ?? 3008,
};
