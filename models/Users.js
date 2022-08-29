/*************************************************************************
USERS TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	var Users = sequelize.define(
		'users',
		{
			fullName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				unique: true,
			},
			role: {
				type: Sequelize.ENUM('SALES_REP', 'ADMIN', 'STORE'),
				defaultValue: 'SALES_REP',
			},
			status: {
				type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
				defaultValue: 'ACTIVE',
			},
		},
		{
			freezeTableName: true,
		}
	)

	Users.associate = function (models) {
		models.users.hasMany(models.sales, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'userId' })
		models.users.hasMany(models.inventoryHistories, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'userId' })
		models.users.hasMany(models.products, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'userId' })
		models.users.hasMany(models.inventories, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'userId' })
		models.users.hasMany(models.inventoryHistories, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'userId' })
	}

	return Users
}
