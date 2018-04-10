/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const InfoActivity = sequelize.define('InfoActivity', {
        activityId: {
            type: DataTypes.INTEGER,
            field: 'activity_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        detailId: {
            type: DataTypes.INTEGER,
            field: 'detail_id',
            allowNull: true
        },
        activityName: {
            type: DataTypes.STRING(20),
            field: 'activity_name',
            allowNull: false
        },
        activityDesc: {
            type: DataTypes.STRING(100),
            field: 'activity_desc',
            allowNull: true
        },
        groupType: {
            type: DataTypes.STRING(20),
            field: 'group_type',
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
            tableName: 'info_activity',
            timestamps: false
        });

        return InfoActivity;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
