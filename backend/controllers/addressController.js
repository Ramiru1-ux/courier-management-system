const Address = require("../models/Address");

const createAddress = async (req, res) => {
  try {
    const {
      user,
      label,
      street,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      isDefault,
      phone,
      notes,
    } = req.body;

    if (!user || !street || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "User, street, city and country are required",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { user },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user,
      label: label || "Home",
      street,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      isDefault: Boolean(isDefault),
      phone,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create address",
      error: error.message,
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.user) {
      filter.user = req.query.user;
    }

    if (req.user && req.user._id) {
      filter.user = req.user._id;
    }

    const addresses = await Address.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Get address by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (updateData.isDefault && address.user) {
      await Address.updateMany(
        { user: address.user, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByIdAndDelete(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: address,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};