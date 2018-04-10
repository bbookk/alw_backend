/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const InfoHoliday =sequelize.define('InfoHoliday', {
        holidayId: {
            type: DataTypes.INTEGER,
            field: 'holiday_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        holiday: {
            type: DataTypes.DATEONLY,
            field: 'holiday',
            allowNull: true
        },
        holidayDesc: {
            type: DataTypes.STRING(100),
            field: 'holiday_desc',
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
        tableName: 'info_holiday',
        timestamps: false
    });

    return InfoHoliday
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
