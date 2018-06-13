/* eslint new-cap: "off", global-require: "off" */
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const InfoSummaryCheck = sequelize.define('InfoSummaryCheck', {
        summaryCheckId: {
            type: DataTypes.INTEGER,
            field: 'summary_check_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pin: {
            type: DataTypes.STRING(8),
            field: 'pin',
            allowNull: false
        },    
        ssn: {
            type: DataTypes.STRING(8),
            field: 'ssn',
            allowNull: false
        },
        recordDt: {
            type: DataTypes.DATE,
            field: 'record_dt',
            allowNull: false,
            get: function () {
                return moment.utc(this.getDataValue('recordDt')).add(7, 'hours').format('YYYY-MM-DD');
            }
        },
        slFlag: {
            type: DataTypes.CHAR(1),
            field: 'sl_flag',
            allowNull: false
        },
        trFlag: {
            type: DataTypes.CHAR(1),
            field: 'tr_flag',
            allowNull: false
        },
        slHeaderId: {
            type: DataTypes.INTEGER,
            field: 'sl_header_id',
            allowNull: false
        },
        trHeaderId: {
            type: DataTypes.INTEGER,
            field: 'tr_header_id',
            allowNull: false
        },
        genSumFlag: {
            type: DataTypes.CHAR(1),
            field: 'gen_sum_flag',
            allowNull: false
        },
        genSumStartDt: {
            type: DataTypes.DATE,
            field: 'gen_sum_start_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('genSumStartDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        genSumEndDt: {
            type: DataTypes.DATE,
            field: 'gen_sum_end_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('genSumEndDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        managerPin : {
            type: DataTypes.STRING(8),
            field: 'manager_pin',
            allowNull: false
        },
        supervisorPin : {
            type: DataTypes.STRING(8),
            field: 'supervisor_pin',
            allowNull: false
        }
    }, {
            schema: 'public',
            tableName: 'info_summary_check',
            timestamps: false
        });

    return InfoSummaryCheck;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
};
