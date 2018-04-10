/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const InfoSchedule = sequelize.define('InfoSchedule', {
        scheduleId: {
            type: DataTypes.INTEGER,
            field: 'schedule_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        batchName: {
            type: DataTypes.STRING(20),
            field: 'batch_name',
            allowNull: false
        },
        runtime: {
            type: DataTypes.DATE,
            field: 'runtime',
            allowNull: true
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
        tableName: 'info_schedule',
        timestamps: false
    });

    return InfoSchedule;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
