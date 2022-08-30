/*************************************************************************
SERVERS TABLE
*************************************************************************/

module.exports = function (sequelize, Sequelize) {
	var Servers = sequelize.define(
		'servers',
		{
			fullName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				unique: true,
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

	Servers.associate = function (models) {
		models.servers.hasMany(models.sales, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'serverId' })
	}

	return Servers
}
