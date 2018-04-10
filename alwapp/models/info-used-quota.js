/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const InfoUsedQuota = sequelize.define('InfoUsedQuota', {
        usedQuotaId: {
            type: DataTypes.INTEGER,
            field: 'used_quota_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        detailId: {
            type: DataTypes.INTEGER,
            field: 'detail_id',
            allowNull: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: false
        },
        used: {
            type: DataTypes.STRING(20),
            field: 'used',
            allowNull: false
        },
        quota: {
            type: DataTypes.STRING(20),
            field: 'quota',
            allowNull: false
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
        },
        updateDt: {
            type: DataTypes.DATE,
            field: 'update_dt',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'info_used_quota',
        timestamps: false
    });

    return InfoUsedQuota
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
