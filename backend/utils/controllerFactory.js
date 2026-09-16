const getModelName = (Model, fallback) => Model?.modelName || fallback;

const sendError = (res, error, fallbackMessage) => {
  const status = error?.name === "ValidationError" ? 400 : 500;
  return res.status(status).json({
    success: false,
    message: error?.message || fallbackMessage,
    error: process.env.NODE_ENV === "production" ? undefined : error?.message,
  });
};

const ensureModel = (Model, res) => {
  if (!Model || typeof Model.find !== "function") {
    res.status(501).json({
      success: false,
      message: "This resource model has not been configured yet",
    });
    return false;
  }

  return true;
};

const createCrudController = (Model, resourceName, options = {}) => {
  const singular = resourceName.toLowerCase();
  const plural = options.plural || `${singular}s`;
  const modelName = getModelName(Model, resourceName);

  const list = async (req, res) => {
    try {
      if (!ensureModel(Model, res)) return;

      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 25, 1),
        100
      );
      const filter = { ...(options.baseFilter || {}) };

      for (const [key, value] of Object.entries(req.query)) {
        if (!["page", "limit", "sort", "search"].includes(key) && value !== "") {
          filter[key] = value;
        }
      }

      if (req.query.search && options.searchFields?.length) {
        const expression = new RegExp(String(req.query.search).trim(), "i");
        filter.$or = options.searchFields.map((field) => ({ [field]: expression }));
      }

      let query = Model.find(filter);
      if (typeof query.sort === "function") {
        query = query.sort(req.query.sort || options.sort || { createdAt: -1 });
      }
      if (typeof query.skip === "function") query = query.skip((page - 1) * limit);
      if (typeof query.limit === "function") query = query.limit(limit);
      if (typeof query.populate === "function" && options.populate) {
        query = query.populate(options.populate);
      }

      const [items, total] = await Promise.all([
        query,
        typeof Model.countDocuments === "function"
          ? Model.countDocuments(filter)
          : 0,
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
        pagination: {
          page,
          limit,
          total,
          pages: total ? Math.ceil(total / limit) : 0,
        },
      });
    } catch (error) {
      return sendError(res, error, `Failed to fetch ${plural}`);
    }
  };

  const getById = async (req, res) => {
    try {
      if (!ensureModel(Model, res)) return;

      let query = Model.findById(req.params.id);
      if (typeof query.populate === "function" && options.populate) {
        query = query.populate(options.populate);
      }
      const item = await query;

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${resourceName} not found`,
        });
      }

      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      return sendError(res, error, `Failed to fetch ${singular}`);
    }
  };

  const create = async (req, res) => {
    try {
      if (!ensureModel(Model, res)) return;

      const data = { ...(options.defaults || {}), ...(req.body || {}) };
      const item = await Model.create(data);
      return res.status(201).json({
        success: true,
        message: `${resourceName} created successfully`,
        data: item,
      });
    } catch (error) {
      return sendError(res, error, `Failed to create ${singular}`);
    }
  };

  const update = async (req, res) => {
    try {
      if (!ensureModel(Model, res)) return;

      const updateData = { ...(req.body || {}) };
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${resourceName} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${resourceName} updated successfully`,
        data: item,
      });
    } catch (error) {
      return sendError(res, error, `Failed to update ${singular}`);
    }
  };

  const remove = async (req, res) => {
    try {
      if (!ensureModel(Model, res)) return;

      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${resourceName} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${resourceName} deleted successfully`,
        data: item,
      });
    } catch (error) {
      return sendError(res, error, `Failed to delete ${singular}`);
    }
  };

  return {
    list,
    getById,
    create,
    update,
    remove,
    [`get${resourceName}Model`]: () => Model,
    modelName,
  };
};

module.exports = {
  createCrudController,
  sendError,
};
