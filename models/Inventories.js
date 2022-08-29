/*************************************************************************
INVENTORIES TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	var Inventories = sequelize.define(
		'inventories',
		{
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			qty: {
				type: Sequelize.INTEGER,
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

	Inventories.associate = function (models) {
		models.inventories.hasMany(models.inventoryHistories, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'inventoryId' })
		models.inventories.belongsTo(models.users, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'userId' })
	}

	return Inventories
}
