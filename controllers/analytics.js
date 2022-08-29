const DB = require('./db')
const { Op } = require('sequelize')
const moment = require('moment')
const { successResponse, errorResponse } = require('../helpers/utility')

const dashboardData = async (req, res) => {
	const { id, role } = req.user
	const where = role !== 'ADMIN' ? { userId: id } : {}
	try {
		const inventories = await DB.inventories.findAll()
		const products = await DB.products.findAll()
		const sales = await DB.sales.findAll({ where })
		const users = await DB.users.findAll()

		const totalSales = await DB.sales.sum('amount', { where })
		const maxSales = await DB.sales.max('amount', { where })
		const avgSales = totalSales / sales.length

		const salesToday = await DB.sales.sum('amount', {
			where: {
				...where,
				createdAt: {
					[Op.gte]: moment().startOf('date'),
				},
			},
		})
		const salesYesterday = await DB.sales.sum('amount', {
			where: {
				...where,
				createdAt: {
					[Op.gte]: moment().startOf('day').add(-1, 'day'),
					[Op.lte]: moment().startOf('day'),
				},
			},
		})
		const salesThisWeek = await DB.sales.sum('amount', {
			where: {
				...where,
				createdAt: {
					[Op.gte]: moment().startOf('week'),
					[Op.lte]: moment().endOf('day'),
				},
			},
		})
		const salesThisMonth = await DB.sales.sum('amount', {
			where: {
				...where,
				createdAt: {
					[Op.gte]: moment().startOf('month'),
					[Op.lte]: moment().endOf('day'),
				},
			},
		})
		const salesThisYear = await DB.sales.sum('amount', {
			where: {
				...where,
				createdAt: {
					[Op.gte]: moment().startOf('year'),
					[Op.lte]: moment().endOf('day'),
				},
			},
		})
		const salesSoFar = await DB.sales.sum('amount', { where })

		const topSelling = await getTopSellingProducts(sales)

		const data = {
			totalInventories: inventories.length,
			totalProducts: products.length,
			totalSales: sales.length,
			totalUsers: users.length,
			topSelling,
			sales: {
				totalSales,
				maxSales,
				avgSales,
				salesToday,
				salesYesterday,
				salesThisWeek,
				salesThisMonth,
				salesThisYear,
				salesSoFar,
			},
		}

		return successResponse(res, `Dashboard data retrived!`, data)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

const salesByDate = async (req, res) => {
	const { startDate, endDate } = req.body
	try {
		const sales = await DB.sales.findAll({
			where: {
				createdAt: {
					[Op.gte]: moment(startDate).startOf('day'),
					[Op.lte]: moment(endDate).endOf('day'),
				},
			},
		})
		const sumOfSales = await DB.sales.sum('amount', {
			where: {
				createdAt: {
					[Op.gte]: moment(startDate).startOf('day'),
					[Op.lte]: moment(endDate).endOf('day'),
				},
			},
		})
		const summary = await getTopSellingProducts(sales, 'summary')
		const data = { sumOfSales, summary, sales }
		return successResponse(res, `Sales data retrived!`, data)
	} catch (error) {
		console.log(error.message)
		return errorResponse(res, `An error occured:- ${error.message}`)
	}
}

module.exports = {
	salesByDate,
	dashboardData,
}

let arr = [
	{
		id: 1,
		amount: 3500,
		products: [
			{
				id: 2,
				qty: 3,
				name: 'Budwiser Beer',
				price: 500,
				total: 5500,
			},
			{
				id: 1,
				qty: 5,
				name: 'Tiger Beer',
				price: 400,
				total: 2000,
			},
		],
	},
	{
		id: 1,
		amount: 3500,
		products: [
			{
				id: 2,
				qty: 3,
				name: 'Budwiser Beer',
				price: 500,
				total: 1500,
			},
			{
				id: 1,
				qty: 5,
				name: 'Tiger Beer',
				price: 400,
				total: 2000,
			},
		],
	},
	{
		id: 1,
		amount: 3500,
		products: [
			{
				id: 2,
				qty: 3,
				name: 'Budwiser Beer',
				price: 500,
				total: 1500,
			},
			{
				id: 1,
				qty: 5,
				name: 'Tiger Beer',
				price: 400,
				total: 2000,
			},
		],
	},
]
const getTopSellingProducts = async (salesArr, type) => {
	let newArr = []
	salesArr = salesArr.map((p) => {
		newArr.push(...p.products)
	})
	const groupBy = (list, keyGetter) => {
		const map = new Map()
		list.forEach((item) => {
			const key = keyGetter(item)
			const collection = map.get(key)
			if (!collection) {
				map.set(key, [item])
			} else {
				collection.push(item)
			}
		})
		return map
	}
	const grouped = groupBy(newArr, (product) => product.name)

	const productsArr = []
	const products = await DB.products.findAll()
	products.map((product) => {
		productsArr.push(product.name)
	})
	const sales = []
	productsArr.forEach((product) => {
		if (grouped.get(product)) {
			sales.push({
				product,
				sales: grouped
					.get(product)
					.map((item) => item.total)
					.reduce((prev, curr) => prev + curr, 0),
			})
		}
	})
	if (type !== 'summary') return sales.sort((a, b) => b.sales - a.sales).slice(0, 3)
	// sales.push({ total: sales.map((item) => item.sales).reduce((prev, curr) => prev + curr, 0) })
	return sales.sort((a, b) => b.sales - a.sales)
}
