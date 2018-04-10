/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxUsedQuotaDetail = sequelize.define('TxUsedQuotaDetail', {
        detailId: {
            type: DataTypes.INTEGER,
            field: 'detail_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        headerId: {
            type: DataTypes.INTEGER,
            field: 'header_id',
            allowNull: true,
            references: {
                model: 'tx_used_quota_header',
                key: 'header_id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
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
            tableName: 'tx_used_quota_detail',
            timestamps: false
        });
    TxUsedQuotaDetail.associate = (models) => {
        TxUsedQuotaDetail.belongsTo(models.TxUsedQuotaHeader, {
            as: 'Header',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };
    return TxUsedQuotaDetail;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxUsedQuotaDetail = model.TxUsedQuotaDetail;
//     const TxUsedQuotaHeader = model.TxUsedQuotaHeader;

//     TxUsedQuotaDetail.belongsTo(TxUsedQuotaHeader, {
//         as: 'Header',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
