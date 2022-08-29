const express = require('express')
const { login, register, changePassword, isAdmin, updateUsers, getUsers, getUserDetails } = require('./controllers/authentication')
const { upload } = require('./helpers/upload')

const products = require('./controllers/products')
const sales = require('./controllers/sales')
const inventories = require('./controllers/inventories')
const general = require('./controllers/general')
const analytics = require('./controllers/analytics')
const { validate } = require('./validate')

const router = express.Router()

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res, next) => {
	res.status(200).send('API Working')
})

// LOGIN && REGISTER ROUTE
router.post('/login', validate('/login'), login)
router.post('/register', validate('/register'), isAdmin, register)
router.post('/change-password', validate('/change-password'), changePassword)
router.get('/users', isAdmin, getUsers)
router.get('/users/get-detail/:id', validate('id'), isAdmin, getUserDetails)
router.post('/users/update/:id', validate('/users/update'), isAdmin, updateUsers)

router.get('/dashboard', analytics.dashboardData)
router.post('/sales-report', isAdmin, analytics.salesByDate)

router.post('/upload-images', upload.array('image', 1), general.uploadFile)

router.post('/products/create', validate('/products/create'), isAdmin, products.createProduct)
router.post('/products/update/:id', validate('/products/update'), isAdmin, products.updateProduct)
router.get('/products', products.getProducts)
router.get('/products/get-detail/:id', validate('id'), isAdmin, products.getProductDetail)
router.get('/products/delete/:id', validate('id'), isAdmin, products.deleteProduct)

router.post('/inventories/create', validate('/inventories/create'), isAdmin, inventories.createInventory)
router.post('/inventories/update/:id', validate('/inventories/update'), inventories.updateInventory)
router.get('/inventories', inventories.getInventories)
router.get('/inventories/get-detail/:id', validate('id'), inventories.getInventoryDetail)
router.get('/inventories/delete/:id', validate('id'), isAdmin, inventories.deleteInventory)

router.post('/sales/create', validate('/sales/create'), sales.createSale)
router.post('/sales/update/:id', validate('/sales/update'), isAdmin, sales.updateSale)
router.get('/sales', sales.getSales)
router.get('/sales/get-detail/:id', validate('id'), sales.getSaleDetail)

module.exports = router
