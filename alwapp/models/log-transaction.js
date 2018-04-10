/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const LogTransaction= sequelize.define('LogTransaction', {
        transactionId: {
            type: DataTypes.INTEGER,
            field: 'transaction_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        api: {
            type: DataTypes.STRING(20),
            field: 'api',
            allowNull: false
        },
        apiDesc: {
            type: DataTypes.STRING(100),
            field: 'api_desc',
            allowNull: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(10),
            field: 'status',
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
        }
    }, {
        schema: 'public',
        tableName: 'log_transaction',
        timestamps: false
    });

    return LogTransaction;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
