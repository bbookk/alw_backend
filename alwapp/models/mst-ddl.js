/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const MstDdl= sequelize.define('MstDdl', {
        ddlId: {
            type: DataTypes.INTEGER,
            field: 'ddl_id',
            allowNull: false,
            primaryKey: true
        },
        ddlName: {
            type: DataTypes.STRING(20),
            field: 'ddl_name',
            allowNull: false
        },
        ddlDesc: {
            type: DataTypes.STRING(100),
            field: 'ddl_desc',
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
        tableName: 'mst_ddl',
        timestamps: false
    });

    return MstDdl;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
