// IMPORT DATABASE FILE
const DB = require('./db')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../helpers/utility')
const aws = require('aws-sdk')
const csv = require('fast-csv')
const config = require('../config/config')
const { updateWallet } = require('../helpers/wallet')
const { Op } = require('sequelize')

/**
 * CREATE MULtiPLE INVENTORIES
 * @param {inventories array containing inventory objects} req
 * @param {*} res
 */

const createMultipleInventories = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { inventories } = req.body
		let errorArr = []
		let successArr = []

		for (let i = 0; i < inventories.length; i++) {
			const { name, qty } = inventories[i]
			const insertData = { name, qty, userId: id }
			const inventory = await DB.inventories.findOne({ where: { name } })
			if (inventory) errorArr.push({ errorMsg: `Inventory ${name} already exists!` })
			await DB.inventories.create(insertData)
			successArr.push({ successMsg: `Inventory ${names} created successfully!` })
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
 * CREATE SINGLE STUDENT
 * @param {inventory object} req
 * @param {*} res
 */

const createInventory = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { id } = req.user
		const { name, qty } = req.body
		Op
		const inventory = await DB.inventories.findOne({ where: { name } })
		if (inventory) return errorResponse(res, `Inventory with name ${name} already exists`)
		const insertData = { name, qty, userId: id }
		const newInventory = await DB.inventories.create(insertData)
		await DB.inventoryHistories.create({ qty, type: 'IN', newQty: qty, description: 'Initial Stock', userId: id, inventoryId: newInventory.id })
		return successResponse(res, `Inventory ${name} created successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * UPDATE SINGLE STUDENT
 * @param {inventory object} req
 * @param {*} res
 */

const updateInventory = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { id } = req.params
		const { name, qty, type, department, description, status } = req.body
		const inventory = await DB.inventories.findOne({ where: { id } })
		if (!inventory) return errorResponse(res, `Inventory with ID ${id} not found!`)
		if (type === 'OUT' && Number(inventory.qty) - Number(qty) < 0) return errorResponse(res, `Available stock not enough. Only ${inventory.qty} left`)
		console.log('qty', inventory.qty)
		const newQty = type === 'IN' ? Number(inventory.qty) + Number(qty) : type === 'OUT' ? Number(inventory.qty) - Number(qty) : null
		console.log('old', inventory.qty, 'qty', qty, 'new', newQty)
		const updateData = {
			name: name ? name : inventory.name,
			qty: qty ? newQty : inventory.qty,
			status: status ? status : inventory.status,
		}
		console.log({ updateData })
		await DB.inventoryHistories.create({ department, qty, type, newQty, description, userId: req.user.id, inventoryId: id })
		await inventory.update(updateData)
		return successResponse(res, `Inventory updated successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET INVENTORIES FROM DATABASE, CALLED FROM INVENTORIES LISTING PAGE
 * @param {*} req
 * @param {*} res
 */

const getInventories = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const inventories = await DB.inventories.findAll({ include: { model: DB.users, attributes: ['id', 'fullName'] }, order: [['createdAt', 'DESC']] })

		if (!inventories.length) return successResponse(res, `No inventory available!`, [])
		return successResponse(res, `${inventories.length} inventor${inventories.length > 1 ? 'ies' : ''} retrived!`, inventories)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET STUDENT DETAIL FROM DATABASE
 * @param {inventoryId} req
 * @param {*} res
 */

const getInventoryDetail = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { id } = req.params
		const inventory = await DB.inventories.findOne({
			where: { id },
			include: [
				{
					model: DB.inventoryHistories,
					attributes: { exclude: ['updatedAt', 'inventoryId', 'userId'] },
					order: [['createdAt', 'DESC']],
					include: { model: DB.users, attributes: ['id', 'fullName'] },
				},
				{ model: DB.users, attributes: ['id', 'fullName'] },
			],
			attributes: { exclude: ['updatedAt', 'userId'] },
			order: [['id', 'DESC']],
		})

		if (!inventory) return errorResponse(res, `Inventory with ID ${id} not found!`)
		return successResponse(res, `Inventory details retrived!`, inventory)
	} catch (error) {
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE SINGLE STUDENT FROM DATABASE
 * @param {inventoryId} req
 * @param {*} res
 */

const deleteInventory = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { id } = req.params
		const checkInventory = await DB.inventories.findOne({ where: { id } })
		if (!checkInventory) return errorResponse(res, `Inventory with ID ${id} not found!`)
		await checkInventory.destroy({ force: true })
		return successResponse(res, `Inventory with ID ${id} deleted successfully!`)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE ALL INVENTORIES FROM DATABASE
 * @param {*} req
 * @param {*} res
 */

const deleteAllInventories = async (req, res) => {
	try {
		await DB.inventories.destroy({ force: true })
		return successResponse(res, `All inventories deleted successfully!`)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * PHYSICALLY DELETE MULTIPLE INVENTORIES FROM DATABASE
 * @param {ids} req
 * @param {*} res
 */

const deleteMultipleInventories = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { ids } = req.body
		let errorArr = []
		let successArr = []
		for (let i = 0; i < ids.length; i++) {
			const checkInventory = await DB.inventories.findOne({ where: { id: ids[i] } })
			if (checkInventory) {
				await checkInventory.destroy()
				successArr.push({ successMsg: `Inventory with ID ${ids[i]} deleted successfully!` })
			} else {
				errorArr.push({ errorMsg: `Inventory with ID ${ids[i]} not found!` })
			}
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
	deleteMultipleInventories,
	deleteAllInventories,
	deleteInventory,
	getInventoryDetail,
	createMultipleInventories,
	createInventory,
	updateInventory,
	getInventories,
}
