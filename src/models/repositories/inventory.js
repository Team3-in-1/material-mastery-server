'use strict';

const { Types } = require("mongoose");
const inventoryModel = require("../inventory.model");

const createInventory = async({ productId, stock, location = 'unknown'}) => {
    return await inventoryModel.create({
        inventory_location: location,
        inventory_productId: new Types.ObjectId(productId),
        inventory_stock: stock
    })
}

const findInventoryByProductId = async (productId) => {
    return await inventoryModel.findOne({inventory_productId: new Types.ObjectId(productId)});
}

const updateInventoryByProductId = async (productId, quantity) => {
    return await inventoryModel.updateOne({inventory_productId: new Types.ObjectId(productId)}, {inventory_stock: quantity}, {new: true});
}

module.exports = {
    createInventory,
    findInventoryByProductId,
    updateInventoryByProductId,
}