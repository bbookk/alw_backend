/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxAvayaPinDetail = sequelize.define('TxAvayaPinDetail', {
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
                model: 'tx_avaya_pin_header',
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
        aid: {
            type: DataTypes.STRING(20),
            field: 'aid',
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
            tableName: 'tx_avaya_pin_detail',
            timestamps: false
        });
    TxAvayaPinDetail.associate = (models) => {
        TxAvayaPinDetail.belongsTo(models.TxAvayaPinHeader, {
            as: 'Header',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };
    return TxAvayaPinDetail;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxAvayaPinDetail = model.TxAvayaPinDetail;
//     const TxAvayaPinHeader = model.TxAvayaPinHeader;

//     TxAvayaPinDetail.belongsTo(TxAvayaPinHeader, {
//         as: 'Header',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
