'use strict';
const { default: mongoose, Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error-response");
const commentModel = require("../models/comment.model");
const productModel = require("../models/product.model");
const { getAllCategoriesByFilter, getCategoryById } = require("../models/repositories/category");
const { updateInventoryByProductId } = require("../models/repositories/inventory");
const { createOrUpdateNotificationByType, checkProductExists, deleteProductInStaffNotification } = require("../models/repositories/notification");
const { findProductByName, createProduct, getAllProduct, deleteProductById, updateProductById, getProductById, getAllProductsByUser } = require("../models/repositories/product");
const { removeUndefinedObject, updateNestedObject } = require("../utils");
const content = {
    "STAFF-001": "There is a risk of product shortage in quantity (<=5)",
}

class ProductService {
    static async createProduct(payload) {
        const {name} = payload;
        const foundProduct = await findProductByName(name);
        if (foundProduct) throw new BadRequestError("Product already exists");
        const newProduct = await createProduct(payload);
        if (!newProduct) throw new BadRequestError("Create product failed");
        if (newProduct.product_quantity <= 5) {
            await createOrUpdateNotificationByType({
                type: "STAFF",
                content: "STAFF-001",
                option: {...newProduct, productId: newProduct._id}
            })
        }
        return newProduct;
    }

    static async getAllProducts(payload) {
        // console.log(">>>payload: ", payload);
        return await getAllProductsByUser(payload);
    }

    static async deleteProductById(id) {
        const product = await deleteProductById(id);
        if (await checkProductExists("STAFF", id, "STAFF-001")) {
            await deleteProductInStaffNotification(id, "STAFF-001");
        }
        return product;
    }

    static async updateProductById(id, payload) {
        const tempPayload = removeUndefinedObject(payload);
        const product = await updateProductById(id, updateNestedObject(tempPayload));
        if (!product) throw new BadRequestError("Update product failed");
        if (payload.product_quantity) {
            await updateInventoryByProductId(id, payload.product_quantity);
            if (payload.product_quantity <= 5) {
                await createOrUpdateNotificationByType({
                    type: "STAFF",
                    content: "STAFF-001",
                    option: {...product._doc, productId: product._id}
                })
            } else if (await checkProductExists("STAFF", id, "STAFF-001")) {
                await deleteProductInStaffNotification(id, "STAFF-001");
            }
        }
        return product;
    }

    static async getProductById(productId) {
        const foundProduct = await getProductById(productId, []);
        if (!foundProduct) throw new NotFoundError("Product not found")
        const category = await getAllCategoriesByFilter({filter: {
            _id: {$in: foundProduct.product_categories}
        }, select: ['_id', 'category_name']})
        if (!category) throw new NotFoundError('Product category not found');
        return {
            ...foundProduct,
            product_categories: category
        }
    }

    static async getProductByCategoryId(categoryId, payload) {
        const foundCategory = await getCategoryById(categoryId, ["category_name"]);
        if (!foundCategory) throw new NotFoundError("Category not found");
        return await getAllProductsByUser({...payload, filter: {
            product_categories: {$in: [categoryId]}
        }, unSelect: ["product_categories", "__v"]});
    }

    static async updateProductRating(productId) {
        try {
            const pipeline = [
                {
                  $match: { comment_productId: new Types.ObjectId(productId), comment_parentId: null }
                },
                {
                  $group: {
                    _id: null,
                    totalRating: { $sum: '$comment_rating' },
                    commentCount: { $sum: 1 }
                  }
                }
            ];
            const result = await commentModel.aggregate(pipeline);
            if (result.length > 0) {
                const { totalRating, commentCount } = result[0];
                const product = await updateProductById(productId, {
                  product_ratingAverage: commentCount > 0 ? totalRating / commentCount : 0
                });
                return product;
            }
            return null;
          } catch (error) {
            throw new BadRequestError(error);
          }
    }
}

module.exports = ProductService;