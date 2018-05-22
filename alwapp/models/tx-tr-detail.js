/* eslint new-cap: "off", global-require: "off" */
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const TxTrDetail = sequelize.define('TxTrDetail', {
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
                model: 'tx_tr_header',
                key: 'header_id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        modify:{
            type: DataTypes.STRING(20),
            field: 'modify',
            allowNull: false
        },
        ssn:{
            type: DataTypes.STRING(10),
            field: 'ssn',
            allowNull: false
        },
        organizeName: {
            type: DataTypes.STRING(100),
            field: 'organize_name',
            allowNull: false
        },
        agentName: {
            type: DataTypes.STRING(100),
            field: 'agent_name',
            allowNull: false
        },
        scheduleDate: {
            type: DataTypes.DATE,
            field: 'schedule_date',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('scheduleDate')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        time_zone: {
            type: DataTypes.STRING(50),
            field: 'time_zone',
            allowNull: true
        },
        activity: {
            type: DataTypes.STRING(100),
            field: 'activity',
            allowNull: false
        },
        startDt: {
            type: DataTypes.DATE,
            field: 'start_dt',
            timezone: '+07:00',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('startDt')).add(7, 'hours').format('HH:mm');
            }
        },
        stopDt: {
            type: DataTypes.DATE,
            field: 'stop_dt',
            timezone: '+07:00',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('stopDt')).add(7, 'hours').format('HH:mm');
            }
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('createDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        createBy: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        }
    }, {
            schema: 'public',
            tableName: 'tx_tr_detail',
            timestamps: false
        });
    TxTrDetail.associate = (models) => {
        TxTrDetail.belongsTo(models.TxTrHeader, {
            as: 'Header',
            foreignKey: 'header_id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    };

    return TxTrDetail;
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

//     const model = require('../index');
//     const TxTrDetail = model.TxTrDetail;
//     const TxTrHeader = model.TxTrHeader;

//     TxTrDetail.belongsTo(TxTrHeader, {
//         as: 'Header',
//         foreignKey: 'header_id',
//         onDelete: 'NO ACTION',
//         onUpdate: 'NO ACTION'
//     });

// };
