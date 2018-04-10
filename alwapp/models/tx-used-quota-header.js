/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxUsedQuotaHeader = sequelize.define('TxUsedQuotaHeader', {
        headerId: {
            type: DataTypes.INTEGER,
            field: 'header_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        fileName: {
            type: DataTypes.STRING(20),
            field: 'file_name',
            allowNull: true
        },
        recSuccess: {
            type: DataTypes.STRING(10),
            field: 'rec_success',
            allowNull: true
        },
        recFail: {
            type: DataTypes.STRING(10),
            field: 'rec_fail',
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(10),
            field: 'status',
            allowNull: true
        },
        errorMsg: {
            type: DataTypes.STRING(100),
            field: 'error_msg',
            allowNull: true
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: true
        },
        createBy: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        }
    }, {
            schema: 'public',
            tableName: 'tx_used_quota_header',
            timestamps: false
        });
    TxUsedQuotaHeader.associate = (models) => {
        TxUsedQuotaHeader.hasMany(models.TxUsedQuotaDetail, {
            as: 'TxUsedQuotaDetailHeaderIdFkeys',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };

    
    return TxUsedQuotaHeader;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxUsedQuotaHeader = model.TxUsedQuotaHeader;
//     const TxUsedQuotaDetail = model.TxUsedQuotaDetail;

//     TxUsedQuotaHeader.hasMany(TxUsedQuotaDetail, {
//         as: 'TxUsedQuotaDetailHeaderIdFkeys',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
