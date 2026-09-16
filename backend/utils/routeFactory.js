const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { apiKeyAuth } = require("../middleware/apiKeyAuth");
const { rateLimiter } = require("../middleware/rateLimiter");

const resolveHandler = (controller, operation) => {
  if (typeof controller[operation] === "function") return controller[operation];

  const patterns = {
    create: /^create[A-Z]/,
    list: /^get(?!.*ById|.*ByNumber|.*Tracking$)[A-Z]/,
    getById: /^get.*ById$/,
    update: /^update[A-Z]/,
    remove: /^delete[A-Z]/,
  };
  const key = Object.keys(controller).find((name) => patterns[operation]?.test(name));
  return key ? controller[key] : null;
};

const createCrudRouter = ({
  controller,
  auth = true,
  apiKey = false,
  middleware = [],
  custom = [],
}) => {
  const router = express.Router();
  const guards = [
    auth ? authenticate : optionalAuth,
    apiKey ? apiKeyAuth : null,
    rateLimiter,
    ...middleware,
  ].filter(Boolean);
  const use = (handler) => [...guards, handler];

  const create = resolveHandler(controller, "create");
  const list = resolveHandler(controller, "list");
  const getById = resolveHandler(controller, "getById");
  const update = resolveHandler(controller, "update");
  const remove = resolveHandler(controller, "remove");

  if (create) router.post("/", ...use(create));
  if (list) router.get("/", ...use(list));
  if (getById) router.get("/:id", ...use(getById));
  if (update) router.patch("/:id", ...use(update));
  if (remove) router.delete("/:id", ...use(remove));
  for (const route of custom) {
    router[route.method || "get"](route.path, ...use(route.handler));
  }
  return router;
};

module.exports = { createCrudRouter };
