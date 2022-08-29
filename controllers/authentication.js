const config = require('../config/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const DB = require('./db')
const { Op } = require('sequelize')
const moment = require('moment')
const { handleResponse, successResponse, errorResponse } = require('../helpers/utility')
const { validationResult } = require('express-validator')

/**
 * check if user is authorized
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const register = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { fullName, phone, password, role } = req.body
	let insertData = { fullName, phone, role }
	//Hash password
	const salt = await bcrypt.genSalt(15)
	const hashPassword = await bcrypt.hash(password, salt)
	insertData = { ...insertData, password: hashPassword }
	// insertData.password = hashPassword;

	try {
		const userExists = await DB.users.findOne({ where: { phone } })

		// if user exists stop the process and return a message
		if (userExists) return handleResponse(res, 401, false, `User with email or phone already exists`)

		const user = await DB.users.create(insertData)
		let payload = {
			id: user.id,
			fullName,
			phone,
			role,
		}
		const token = jwt.sign(payload, config.JWTSECRET)
		const data = { token, user: payload }
		return handleResponse(res, 200, true, `Registration successfull`, data)
	} catch (error) {
		console.log(error)
		return handleResponse(res, 401, false, `An error occured - ${error}`)
	}
}

const login = async (req, res) => {
	const { phone, password } = req.body
	try {
		const user = await DB.users.findOne({ where: { phone } })

		if (!user) return handleResponse(res, 401, false, `Incorrect Phone`)
		const { id, fullName, role, status } = user
		const validPass = await bcrypt.compareSync(password, user.password)
		if (!validPass) return handleResponse(res, 401, false, `Phone or Password is incorrect!`)

		if (status === 'INACTIVE') return handleResponse(res, 401, false, `Account Suspended!, Please contact Administrator`)

		// Create and assign token
		let payload = {
			id,
			fullName,
			phone,
			role,
		}
		const token = jwt.sign(payload, config.JWTSECRET)
		return res.status(200).header('auth-token', token).send({
			success: true,
			message: 'Operation Successful',
			token,
			user: payload,
		})
	} catch (error) {
		console.log(error)
		return handleResponse(res, 401, false, `An error occured - ${error}`)
	}
}

const changePassword = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { phone, oldPassword, newPassword } = req.body
	try {
		const user = await DB.users.findOne({ where: { phone, status: 'ACTIVE' } })
		if (!user) return handleResponse(res, 400, false, `User not found!`)
		const validPassword = await bcrypt.compareSync(oldPassword, user.password)
		if (!validPassword) return handleResponse(res, 400, false, `Incorrect  old password!`)
		const salt = await bcrypt.genSalt(15)
		const hashPassword = await bcrypt.hash(newPassword, salt)
		const changedPassword = await user.update({ password: hashPassword })
		if (!changedPassword) return handleResponse(res, 400, false, `Unable change password!`)
		return handleResponse(res, 200, true, `Password changed successfully`)
	} catch (error) {
		console.log(error)
		return handleResponse(res, 401, false, `An error occured - ${error}`)
	}
}

const isAuthorized = async (req, res, next) => {
	//this is the url without query params
	let current_route_path = req.originalUrl.split('?').shift()

	let routes_excluded_from_auth = config.ROUTES_EXCLUDED_FROM_AUTH
	// console.log(routes_excluded_from_auth.indexOf(current_route_path));
	if (routes_excluded_from_auth.indexOf(current_route_path) > -1) {
		return next()
	}

	let token = req.headers.authorization
	if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`)

	try {
		token = token.split(' ')[1] // Remove Bearer from string

		if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`)

		let verifiedUser = jwt.verify(token, config.JWTSECRET) // config.JWTSECRET => 'secretKey'
		if (!verifiedUser) return handleResponse(res, 401, false, `Unauthorized request`)
		// verifiedUser.type === 'user' ? req.user = verifiedUser : verifiedUser.type === 'user' ? req.user = verifiedUser : handleResponse(res, 401, false, `Unidentified access`);
		req.user = verifiedUser // user_id & user_type_id
		next()
	} catch (error) {
		handleResponse(res, 400, false, `Token Expired`)
	}
}

const isAdmin = async (req, res, next) => {
	if (req.user.role != 'ADMIN') return handleResponse(res, 401, false, `Access Denied / Unauthorized request`)
	next()
}

const getUsers = async (req, res, next) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const users = await DB.users.findAll({ attributes: { exclude: ['password'] } })

		if (!users.length) return successResponse(res, `No user available!`, [])
		return successResponse(res, `${users.length} user${users.length > 1 ? 's' : ''} retrived!`, users)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

const getUserDetails = async (req, res) => {
	const { id } = req.params
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const user = await DB.users.findOne({
			where: { id },
			attributes: { exclude: ['password'] },
			include: { model: DB.sales, attributes: { exclude: ['userId', 'updatedAt'] } },
		})
		if (!user) return successResponse(res, `User not found!`, [])
		return successResponse(res, `User retrived!`, user)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

const updateUsers = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
		const { fullName, phone, role, status } = req.body
		const { id } = req.params
		const user = await DB.users.findOne({ where: { id } })
		if (!user) return errorResponse(res, `User with ID ${id} not found!`)
		const updateData = {
			fullName: fullName ? fullName : user.fullName,
			phone: phone ? phone : user.phone,
			role: role ? role : user.role,
			status: status ? status : user.status,
		}
		await user.update(updateData)
		return successResponse(res, `User updated successfully!`)
	} catch (error) {
		console.log(error)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

module.exports = {
	isAuthorized,
	isAdmin,
	login,
	register,
	changePassword,
	getUsers,
	getUserDetails,
	updateUsers,
}
