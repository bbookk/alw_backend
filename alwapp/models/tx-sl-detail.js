/* eslint new-cap: "off", global-require: "off" */
const moment = require('moment');
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
            get: function () {
                return moment.utc(this.getDataValue('scheduleDate')).add(7, 'hours').format('MM/DD/YYYY');
            }
        },
        time_zone: {
            type: DataTypes.STRING(20),
            field: 'time_zone',
            allowNull: true
        },
        startDt: {
            type: DataTypes.DATE,
            field: 'start_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('startDt')).add(7, 'hours').format('HH:mm');
            }
        },
        stopDt: {
            type: DataTypes.DATE,
            field: 'stop_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('stopDt')).add(7, 'hours').format('HH:mm');
            }
        },
        execDate: {
            type: DataTypes.DATEONLY,
            field: 'exec_date',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('execDate')).add(7, 'hours').format('MM/DD/YYYY');
            }

        },
        isPaid :{
            type: DataTypes.CHAR(1),
            field: 'is_paid',
            allowNull: false
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('createDt')).add(7, 'hours').format('MM/DD/YYYY HH:mm:ss');
            }
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
