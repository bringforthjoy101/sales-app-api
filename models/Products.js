/*************************************************************************
PRODUCTS TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	var Products = sequelize.define(
		'products',
		{
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			price: {
				type: Sequelize.DOUBLE.UNSIGNED,
				defaultValue: 0.0,
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM('IN_STOCK', 'OUT_OF_STOCK'),
				defaultValue: 'IN_STOCK',
			},
		},
		{
			freezeTableName: true,
		}
	)

	Products.associate = function (models) {
		models.products.belongsTo(models.users, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'userId' })
	}

	return Products
}
