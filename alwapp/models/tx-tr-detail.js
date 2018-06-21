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
            type: DataTypes.DATEONLY,
            field: 'schedule_date',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('scheduleDate')).add(7, 'hours').format('YYYY-MM-DD');
            }
        },
        execDt: {
            type: DataTypes.DATEONLY,
            field: 'exec_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('execDt')).add(7, 'hours').format('YYYY-MM-DD');
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
        isApprove: {
            type: DataTypes.CHAR(1),
            field: 'is_approve',
            allowNull: false,
        },
        isPaid: {
            type: DataTypes.CHAR(1),
            field: 'is_paid',
            allowNull: false,
        },
        duration : {
            type: DataTypes.STRING(5),
            field: 'duration',
            allowNull: false,
        },
        timeSourceCode : {
            type: DataTypes.STRING(5),
            field: 'time_source_code',
            allowNull: false,
        },
        eventType : {
            type: DataTypes.STRING(5),
            field: 'event_type',
            allowNull: false,
        },
        lastUpdateDt :{
            type: DataTypes.DATEONLY,
            field: 'last_update_dt',
            timezone: '+07:00',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('lastUpdateDt')).add(7, 'hours').format('HH:mm');
            }
        },
        lastUpdateTime :{
            type: DataTypes.DATE,
            field: 'last_update_time',
            timezone: '+07:00',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('lastUpdateTime')).add(7, 'hours').format('HH:mm');
            }
        },
        lastUpdateBy :{
            type: DataTypes.STRING(20),
            field: 'last_update_by',
            allowNull: true,
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
