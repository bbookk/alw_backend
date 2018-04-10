/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const LogBatch= sequelize.define('LogBatch', {
        batchId: {
            type: DataTypes.INTEGER,
            field: 'batch_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        batchName: {
            type: DataTypes.STRING(20),
            field: 'batch_name',
            allowNull: false
        },
        batchDesc: {
            type: DataTypes.STRING(100),
            field: 'batch_desc',
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(10),
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
        tableName: 'log_batch',
        timestamps: false
    });

    return LogBatch;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
