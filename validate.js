const { body, param } = require('express-validator')

exports.validate = (method) => {
	switch (method) {
		// Send contact mail

		case '/send/contact': {
			return [
				body('name').not().isEmpty().isString().withMessage('Name is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('subject').not().isEmpty().isString().withMessage('Subject is required!'),
				body('message').not().isEmpty().isString().withMessage('Message is required!'),
			]
		}
		case '/subscribe': {
			return [
				body('firstName').not().isEmpty().isString().withMessage('Firstname is required!'),
				body('lastName').not().isEmpty().isString().withMessage('Lastname is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
			]
		}

		case '/register': {
			return [
				body('fullName').not().isEmpty().isString().withMessage('Full name is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('role')
					.optional()
					.not()
					.isEmpty()
					.custom((value) => {
						return ['ADMIN', 'SALES_REP', 'STORE'].includes(value)
					})
					.withMessage('role is required!'),
			]
		}
		case '/login': {
			return [
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
			]
		}
		case '/change-password': {
			return [
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('oldPassword').not().isEmpty().isString().withMessage('Old password is required!'),
				body('newPassword').not().isEmpty().isString().withMessage('New password is required!'),
			]
		}

		case 'id': {
			return [param('id').isInt().withMessage('ID must be a number!')]
		}

		// Products validations
		case '/products/create': {
			// const validUnit = ['kg', 'pck', 'pcs', 'l', 'tuber', 'g', 'rubber', 'bunch', 'crate', 'carton']
			// const validCategory = ['shop', 'book', 'store']
			return [
				body('name').not().isEmpty().isString().withMessage('name is required!'),
				body('price')
					.optional()
					.not()
					.isEmpty()
					.custom((value) => {
						return Number(value)
					})
					.withMessage('price is required!'),
			]
		}
		case '/products/update': {
			return [
				param('id').isInt().withMessage('ID must be a number!'),
				body('name').optional().isString().withMessage('name must be a string'),
				// body('price').optional().custom(value => { return Number(value) }).withMessage('price is required!'),
				body('status')
					.optional()
					.custom((value) => {
						return ['available', 'unavailable'].includes(value)
					})
					.withMessage('status can only be available or unavailable!'),
			]
		}

		case '/sales/create': {
			return [
				// body('amount').custom(value => { return Number(value) }).withMessage('amount is required!'),
				body('products')
					.custom((value) => {
						return Array.isArray(value)
					})
					.withMessage('products must be an array of objects'),
			]
		}

		case '/sales/update': {
			return [
				param('id').isInt().withMessage('ID must be a number!'),
				body('status')
					.optional()
					.custom((value) => {
						return ['pending', 'delivered'].includes(value)
					})
					.withMessage('status can only be paid or unpaid!'),
			]
		}

		case '/inventories/create': {
			return [
				body('name').not().isEmpty().isString().withMessage('name is required!'),
				body('qty').not().isEmpty().isString().withMessage('qty is required!'),
			]
		}
		case '/inventories/update': {
			return [
				param('id').isInt().withMessage('ID must be a number!'),
				body('name').optional().not().isEmpty().isString().withMessage('name is required!'),
				body('description').optional().not().isEmpty().isString().withMessage('description is required!'),
				body('qty').optional().isString().withMessage('qty is required!'),
				body('type')
					.optional()
					.custom((value) => ['IN', 'OUT'].includes(value))
					.withMessage('type can only be IN or OUT!'),
				body('status')
					.optional()
					.custom((value) => ['IN_STOCK', 'OUT_OF_STOCK'].includes(value))
					.withMessage('status can only be IN_STOCK or OUT_OF_STOCK!'),
			]
		}
		case '/users/update': {
			return [
				param('id').isInt().withMessage('ID must be a number!'),
				body('fullName').optional().not().isEmpty().isString().withMessage('fullName is required!'),
				body('phone').optional().not().isEmpty().isString().withMessage('phone is required!'),
				body('role')
					.optional()
					.custom((value) => ['SALES_REP', 'ADMIN', 'STORE'].includes(value))
					.withMessage('role can only be SALES_REP, ADMIN or STORE!'),
				body('status')
					.optional()
					.custom((value) => ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(value))
					.withMessage('status can only be ACTIVE, INACTIVE or SUSPENDED!'),
			]
		}
	}
}
