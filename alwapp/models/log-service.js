/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const LogService= sequelize.define('LogService', {
        serviceId: {
            type: DataTypes.INTEGER,
            field: 'service_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        serviceName: {
            type: DataTypes.STRING(20),
            field: 'service_name',
            allowNull: false
        },
        reqMsg: {
            type: DataTypes.STRING(100),
            field: 'req_msg',
            allowNull: true
        },
        resMsg: {
            type: DataTypes.STRING(100),
            field: 'res_msg',
            allowNull: true
        },
        status: {
            type: DataTypes.CHAR(1),
            field: 'status',
            allowNull: false
        },
        errorMsg: {
            type: DataTypes.STRING(100),
            field: 'error_msg',
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
        }
    }, {
        schema: 'public',
        tableName: 'log_service',
        timestamps: false
    });
    return LogService;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
