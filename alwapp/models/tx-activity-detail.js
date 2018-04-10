/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxActivityDetail = sequelize.define('TxActivityDetail', {
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
                model: 'tx_activity_header',
                key: 'header_id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
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
            tableName: 'tx_activity_detail',
            timestamps: false
        });
    TxActivityDetail.associate = (models) => {
        TxActivityDetail.belongsTo(models.TxActivityHeader, {
            as: 'Header',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };

    return TxActivityDetail;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxActivityDetail = model.TxActivityDetail;
//     const TxActivityHeader = model.TxActivityHeader;

//     TxActivityDetail.belongsTo(TxActivityHeader, {
//         as: 'Header',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
