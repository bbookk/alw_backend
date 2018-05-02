/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxSlDetail = sequelize.define('TxSlDetail', {
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
                model: 'tx_sl_header',
                key: 'header_id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        emp_id: {
            type: DataTypes.STRING(10),
            field: 'emp_id',
            allowNull: false
        },
        ssn: {
            type: DataTypes.STRING(10),
            field: 'ssn',
            allowNull: true
        },
        activity: {
            type: DataTypes.STRING(20),
            field: 'activity',
            allowNull: true
        },
        scheduleDate: {
            type: DataTypes.DATE,
            field: 'schedule_date',
            allowNull: true,
        },
        time_zone: {
            type: DataTypes.STRING(20),
            field: 'time_zone',
            allowNull: true
        },
        startDt: {
            type: DataTypes.DATE,
            field: 'start_dt',
            // timezone: '+07:00',
            allowNull: true
        },
        stopDt: {
            type: DataTypes.DATE,
            field: 'stop_dt',
            // timezone: '+07:00',
            allowNull: true
        },
        execDate: {
            type: DataTypes.DATEONLY,
            field: 'exec_date',
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
        },
    }, {
            schema: 'public',
            tableName: 'tx_sl_detail',
            timestamps: false
        });
    TxSlDetail.associate = (models) => {
        TxSlDetail.belongsTo(models.TxSlHeader, {
            as: 'Header',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };
    return TxSlDetail;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxSlDetail = model.TxSlDetail;
//     const TxSlHeader = model.TxSlHeader;

//     TxSlDetail.belongsTo(TxSlHeader, {
//         as: 'Header',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
