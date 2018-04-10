/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
 const MstParam =sequelize.define('MstParam', {
        paramId: {
            type: DataTypes.INTEGER,
            field: 'param_id',
            allowNull: false,
            primaryKey: true
        },
        paramName: {
            type: DataTypes.STRING(20),
            field: 'param_name',
            allowNull: false
        },
        paramDesc: {
            type: DataTypes.STRING(100),
            field: 'param_desc',
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
        tableName: 'mst_param',
        timestamps: false
    });

    return MstParam;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
