/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxSummaryDetail112017 = sequelize.define('TxSummaryDetail112017', {
        summaryDetailId: {
            type: DataTypes.INTEGER,
            field: 'summary_detail_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        txDetailSLId: {
            type: DataTypes.INTEGER,
            field: 'tx_detail_sl_id',
            allowNull: true
        },
        txDetailTRId: {
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
        lateTime: {
            type: DataTypes.STRING(6),
            field: 'late_time',
            allowNull: true
        },
        lostTime: {
            type: DataTypes.STRING(6),
            field: 'lost_time',
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
        },
        managerPin: {
            type: DataTypes.STRING(8),
            field: 'manager_pin',
            allowNull: true
        },
        superPin: {
            type: DataTypes.STRING(8),
            field: 'supervisor_pin',
            allowNull: true
        },
        cmpy: {
            type: DataTypes.STRING(30),
            field: 'company',
            allowNull: true
        },
        bu: {
            type: DataTypes.STRING(30),
            field: 'bu',
            allowNull: true
        },
        fn: {
            type: DataTypes.STRING(30),
            field: 'fn',
            allowNull: true
        },
        dp: {
            type: DataTypes.STRING(30),
            field: 'department',
            allowNull: true
        },
        section: {
            type: DataTypes.STRING(30),
            field: 'section',
            allowNull: true
        },
    }, {
            schema: 'public',
            tableName: 'tx_summary_detail_112017',
            timestamps: false
        });

    return TxSummaryDetail112017;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
