/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxAvayaPinHeader = sequelize.define('TxAvayaPinHeader', {
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
            tableName: 'tx_avaya_pin_header',
            timestamps: false
        });
    TxAvayaPinHeader.associate = (models) => {
        TxAvayaPinHeader.hasMany(models.TxAvayaPinDetail, {
            as: 'TxAvayaPinDetailHeaderIdFkeys',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };

    return TxAvayaPinHeader;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxAvayaPinHeader = model.TxAvayaPinHeader;
//     const TxAvayaPinDetail = model.TxAvayaPinDetail;

//     TxAvayaPinHeader.hasMany(TxAvayaPinDetail, {
//         as: 'TxAvayaPinDetailHeaderIdFkeys',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
