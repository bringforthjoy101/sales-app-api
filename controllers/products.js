// IMPORT DATABASE FILE
const DB = require('./db')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../helpers/utility')

/**
 * CREATE MULtiPLE PRODUCTS
 * @param {products array containing product objects} req
 * @param {*} res
 * @param {*} next
 */

const createMultipleProducts = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { products } = req.body
		const { id } = req.user
		let errorArr = []
		let successArr = []

		for (let i = 0; i < products.length; i++) {
			const { name, price } = products[i]
			const insertData = { name, price, userId: id }
			const product = await DB.products.findOne({ where: { name } })
			if (product) errorArr.push({ errorMsg: `Product ${name} already exists!` })
			await DB.products.create(insertData)
			successArr.push({ successMsg: `Product ${name} created successfully!` })
		}
		return successResponse(res, `Operation completed!`, {
			success: successArr.length,
			successData: successArr,
			failure: errorArr.length,
			failureData: errorArr,
		})
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * CREATE SINGLE SERVICE
 * @param {product object} req
 * @param {*} res
 * @param {*} next
 */

const createProduct = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { name, price } = req.body
		const { id } = req.user
		const insertData = { name, price, userId: id }
		const product = await DB.products.findOne({ where: { name } })
		if (product) return errorResponse(res, `Product ${name} already exists for your business!`)
		await DB.products.create(insertData)
		return successResponse(res, `Product ${name} created successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * UPDATE SINGLE SERVICE
 * @param {product object} req
 * @param {*} res
 * @param {*} next
 */

const updateProduct = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { name, price, status } = req.body
		const { id } = req.params
		const product = await DB.products.findOne({ where: { id } })
		if (!product) return errorResponse(res, `Product with ID ${id} not found!`)
		const updateData = {
			name: name ? name : product.name,
			price: price ? price : product.price,
			status: status ? status : product.status,
		}
		await product.update(updateData)
		return successResponse(res, `Product updated successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET PRODUCTS FROM DATABASE, CALLED FROM PRODUCTS LISTING PAGE
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const getProducts = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const products = await DB.products.findAll({ order: [['id', 'DESC']], include: { model: DB.users, attributes: ['id', 'fullName'] } })
		if (!products.length) return successResponse(res, `No product available!`, [])
		return successResponse(res, `${products.length} product${products.length > 1 ? 's' : ''} retrived!`, products)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET SERVICE DETAIL FROM DATABASE
 * @param {productId} req
 * @param {*} res
 */

const getProductDetail = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { id } = req.params
		const product = await DB.products.findOne({ where: { id }, include: { model: DB.users, attributes: ['id', 'fullName'] } })
		if (!product) return errorResponse(res, `Product with ID ${id} not found!`)
		return successResponse(res, `Product details retrived!`, product)
	} catch (error) {
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE SINGLE SERVICE FROM DATABASE
 * @param {productId} req
 * @param {*} res
 */

const deleteProduct = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { id } = req.params
		const checkProduct = await DB.products.findOne({ where: { id, userId: req.user.id } })
		if (!checkProduct) return errorResponse(res, `Product with ID ${id} not found!`)
		await checkProduct.destroy({ force: true })
		return successResponse(res, `Product with ID ${id} deleted successfully!`)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE ALL PRODUCTS FROM DATABASE
 * @param {*} req
 * @param {*} res
 */

const deleteAllProducts = async (req, res) => {
	try {
		await DB.products.destroy({ force: true, where: { userId: req.user.id } })
		return successResponse(res, `All products deleted successfully!`)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE MULTIPLE PRODUCTS FROM DATABASE
 * @param {ids} req
 * @param {*} res
 */

const deleteMultipleProducts = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { ids } = req.body
		let errorArr = []
		let successArr = []
		for (let i = 0; i < ids.length; i++) {
			const checkProduct = await DB.products.findOne({ where: { id: ids[i], userId: req.user.id } })
			if (checkProduct) errorArr.push({ errorMsg: `Product with ID ${ids[i]} not found!` })
			await checkProduct.destroy()
			successArr.push({ successMsg: `Product with ID ${ids[i]} deleted successfully!` })
		}
		return successResponse(res, `Operation successful!`, {
			success: successArr.length,
			successData: successArr,
			failure: errorArr.length,
			failureData: errorArr,
		})
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

module.exports = {
	deleteMultipleProducts,
	deleteAllProducts,
	deleteProduct,
	getProductDetail,
	createMultipleProducts,
	createProduct,
	updateProduct,
	getProducts,
}
