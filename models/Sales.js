/*************************************************************************
SALES TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	const Sales = sequelize.define(
		'sales',
		{
			saleNumber: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			amount: {
				type: Sequelize.DOUBLE.UNSIGNED,
				allowNull: false,
			},
			amountPaid: {
				type: Sequelize.DOUBLE.UNSIGNED,
				allowNull: false,
			},
			balance: {
				type: Sequelize.DOUBLE.UNSIGNED,
				allowNull: false,
			},
			products: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			subTotal: {
				type: Sequelize.DOUBLE.UNSIGNED,
				allowNull: false,
			},
			discount: {
				type: Sequelize.DOUBLE.UNSIGNED,
				allowNull: false,
			},
			mode: {
				type: Sequelize.ENUM('CASH', 'POS', 'TRANSFER', 'COMPLEMENTATY'),
				defaultValue: 'CASH',
			},
			status: {
				type: Sequelize.ENUM('PAID'),
				defaultValue: 'PAID',
			},
		},
		{
			freezeTableName: true,
		}
	)

	Sales.associate = function (models) {
		models.sales.belongsTo(models.users, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'userId' })
		models.sales.belongsTo(models.servers, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'serverId' })
	}

	return Sales
}
