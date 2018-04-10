/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const InfoRoleObject = sequelize.define('InfoRoleObject', {
        roleObjectId: {
            type: DataTypes.INTEGER,
            field: 'role_object_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id',
            allowNull: true
        },
        objectId: {
            type: DataTypes.INTEGER,
            field: 'object_id',
            allowNull: true
        },
        createBy: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: true
        },
        updateDt: {
            type: DataTypes.DATE,
            field: 'update_dt',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'info_role_object',
        timestamps: false
    });

    return InfoRoleObject;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
