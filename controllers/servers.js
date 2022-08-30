// IMPORT DATABASE FILE
const DB = require('./db')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse, generateServerId } = require('../helpers/utility')

/**
 * CREATE MULtiPLE SERVERS
 * @param {servers array containing server objects} req
 * @param {*} res
 */

/**
 * CREATE SINGLE ORDER
 * @param {server object} req
 * @param {*} res
 */

const createServer = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { fullName, phone } = req.body
		const insertData = { fullName, phone }
		await DB.servers.create(insertData)
		return successResponse(res, `Server created successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

const updateServer = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { status, fullName, phone } = req.body
		const { id } = req.params
		const server = await DB.servers.findOne({ where: { id } })
		if (!server) return errorResponse(res, `server with ID ${id} not found!`)
		await server.update({
			status: status ? status : server.status,
			fullName: fullName ? fullName : server.fullName,
			phone: phone ? phone : server.phone,
		})
		return successResponse(res, `Server updated successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET SERVERS FROM DATABASE, CALLED FROM SERVERS LISTING PAGE
 * @param {*} req
 * @param {*} res
 */

const getServers = async (req, res) => {
	const { status } = req.params
	const where = {}
	if (status) where.status = status
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const servers = await DB.servers.findAll({
			where,
			order: [['id', 'DESC']],
		})
		if (!servers.length) return successResponse(res, `No server available!`, [])
		return successResponse(res, `${servers.length} server${servers.length > 1 ? 's' : ''} retrived!`, servers)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

/**
 * GET ORDER DETAIL FROM DATABASE
 * @param {serverId} req
 * @param {*} res
 */

const getServerDetail = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { id } = req.params
		const server = await DB.servers.findOne({
			where: { id },
			include: [{ model: DB.sales, order: [['id', 'DESC']] }],
		})
		if (!server) return errorResponse(res, `Server with ID ${id} not found!`)
		return successResponse(res, `Server details retrived!`, server)
	} catch (error) {
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

module.exports = { getServerDetail, createServer, updateServer, getServers }
