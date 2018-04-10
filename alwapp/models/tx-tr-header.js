/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxTrHeader = sequelize.define('TxTrHeader', {
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
            allowNull: false
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
            allowNull: false
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
            tableName: 'tx_tr_header',
            timestamps: false
        });
    TxTrHeader.associate = (models) => {
        TxTrHeader.hasMany(models.TxTrDetail, {
            as: 'TxTrDetailHeaderIdFkeys',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };

    return TxTrHeader;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxTrHeader = model.TxTrHeader;
//     const TxTrDetail = model.TxTrDetail;

//     TxTrHeader.hasMany(TxTrDetail, {
//         as: 'TxTrDetailHeaderIdFkeys',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
