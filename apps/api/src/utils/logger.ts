import bunyan from "bunyan";

export const logger = bunyan.createLogger({
  name: "squid-crm-fastify",
  level: "info",
});
