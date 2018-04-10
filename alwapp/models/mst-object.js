/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const MstObject = sequelize.define('MstObject', {
        objectId: {
            type: DataTypes.INTEGER,
            field: 'object_id',
            allowNull: false,
            primaryKey: true
        },
        roleName: {
            type: DataTypes.STRING(20),
            field: 'role_name',
            allowNull: false
        },
        roleDesc: {
            type: DataTypes.STRING(100),
            field: 'role_desc',
            allowNull: true
        },
        key: {
            type: DataTypes.STRING(20),
            field: 'key',
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(20),
            field: 'value',
            allowNull: false
        },
        useFlag: {
            type: DataTypes.CHAR(1),
            field: 'use_flag',
            allowNull: false
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
        tableName: 'mst_object',
        timestamps: false
    });

    return MstObject;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
