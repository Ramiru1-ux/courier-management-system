class ApiFeatures {
	constructor(query, queryString = {}) {
		this.query = query;
		this.queryString = { ...queryString };
	}

	filter(excluded = ["page", "limit", "sort", "fields", "search"]) {
		const filters = { ...this.queryString };
		excluded.forEach((key) => delete filters[key]);
		for (const [key, value] of Object.entries(filters)) {
			if (typeof value === "string" && /^\w+\[(gte|gt|lte|lt|ne|in)\]$/.test(key)) {
				const [, field, operator] = key.match(/^(\w+)\[(gte|gt|lte|lt|ne|in)\]$/);
				filters[field] = { ...(filters[field] || {}), [`$${operator}`]: operator === "in" ? value.split(",") : value };
				delete filters[key];
			}
		}
		this.query = this.query.find(filters);
		return this;
	}

	search(fields = []) {
		if (this.queryString.search && fields.length) {
			const regex = new RegExp(String(this.queryString.search).trim(), "i");
			this.query = this.query.find({ $or: fields.map((field) => ({ [field]: regex })) });
		}
		return this;
	}

	sort(defaultSort = "-createdAt") {
		this.query = this.query.sort(this.queryString.sort || defaultSort);
		return this;
	}

	limitFields() {
		if (this.queryString.fields) this.query = this.query.select(this.queryString.fields.split(",").join(" "));
		return this;
	}

	paginate(defaultLimit = 25, maxLimit = 100) {
		const page = Math.max(Number.parseInt(this.queryString.page, 10) || 1, 1);
		const limit = Math.min(Math.max(Number.parseInt(this.queryString.limit, 10) || defaultLimit, 1), maxLimit);
		this.query = this.query.skip((page - 1) * limit).limit(limit);
		this.pagination = { page, limit };
		return this;
	}
}

module.exports = ApiFeatures;
module.exports.ApiFeatures = ApiFeatures;
