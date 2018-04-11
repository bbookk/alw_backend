/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxSummaryDetail = sequelize.define('TxSummaryDetail', {
        summaryDetailId: {
            type: DataTypes.INTEGER,
            field: 'summary_detail_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        txDetailSlId: {
            type: DataTypes.INTEGER,
            field: 'tx_detail_sl_id',
            allowNull: true
        },
        txDetailTrId: {
            type: DataTypes.INTEGER,
            field: 'tx_detail_tr_id',
            allowNull: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: true
        },
        scheduleStartDt: {
            type: DataTypes.DATE,
            field: 'schedule_start_dt',
            allowNull: true
        },
        scheduleEndDt: {
            type: DataTypes.DATE,
            field: 'schedule_end_dt',
            allowNull: true
        },
        otStartDt: {
            type: DataTypes.DATE,
            field: 'ot_start_dt',
            allowNull: true
        },
        otEndDt: {
            type: DataTypes.DATE,
            field: 'ot_end_dt',
            allowNull: true
        },
        actualClockinDt: {
            type: DataTypes.DATE,
            field: 'actual_clockin_dt',
            allowNull: true
        },
        actualClockoutDt: {
            type: DataTypes.DATE,
            field: 'actual_clockout_dt',
            allowNull: true
        },
        recordType: {
            type: DataTypes.STRING(50),
            field: 'record_type',
            allowNull: true
        },
        shiftFlag: {
            type: DataTypes.CHAR(1),
            field: 'shift_flag',
            allowNull: true
        },
        transportFlag: {
            type: DataTypes.CHAR(1),
            field: 'transport_flag',
            allowNull: true
        },
        ot10: {
            type: DataTypes.FLOAT(53),
            field: 'ot_1_0',
            allowNull: true
        },
        ot15: {
            type: DataTypes.FLOAT(53),
            field: 'ot_1_5',
            allowNull: true
        },
        ot30: {
            type: DataTypes.FLOAT(53),
            field: 'ot_3_0',
            allowNull: true
        },
        recordDate: {
            type: DataTypes.DATEONLY,
            field: 'record_date',
            allowNull: true
        },
        recordMonth: {
            type: DataTypes.CHAR(6),
            field: 'record_month',
            allowNull: false
        },
        remark: {
            type: DataTypes.STRING(100),
            field: 'remark',
            allowNull: true
        },
        useFlag: {
            type: DataTypes.CHAR(1),
            field: 'use_flag',
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
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'tx_summary_detail',
        timestamps: false
    });
    

    return TxSummaryDetail;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
