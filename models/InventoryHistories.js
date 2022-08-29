/*************************************************************************
INVENTORY HISTORIES TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	var InventoryHistories = sequelize.define(
		'inventoryHistories',
		{
			department: {
				type: Sequelize.STRING,
			},
			qty: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			type: {
				type: Sequelize.ENUM('IN', 'OUT'),
				allowNull: false,
			},
			newQty: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING,
			},
		},
		{
			freezeTableName: true,
		}
	)

	InventoryHistories.associate = function (models) {
		models.inventoryHistories.belongsTo(models.inventories, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'inventoryId' })
		models.inventoryHistories.belongsTo(models.users, { onDelete: 'CASCADE', targetKey: 'id', foreignKey: 'userId' })
	}

	return InventoryHistories
}
