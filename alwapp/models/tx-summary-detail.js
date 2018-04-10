/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const TxSummaryDetail = sequelize.define('TxSummaryDetail', {
        summary_detail_id: {
            type: DataTypes.INTEGER,
            field: 'summary_detail_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tx_detail_sl_id: {
            type: DataTypes.INTEGER,
            field: 'tx_detail_sl_id',
            allowNull: true
        },
        tx_detail_tr_id: {
            type: DataTypes.INTEGER,
            field: 'tx_detail_tr_id',
            allowNull: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: true
        },
        schedule_start_dt: {
            type: DataTypes.DATE,
            field: 'schedule_start_dt',
            allowNull: true
        },
        schedule_end_dt: {
            type: DataTypes.DATE,
            field: 'schedule_end_dt',
            allowNull: true
        },
        ot_start_dt: {
            type: DataTypes.DATE,
            field: 'ot_start_dt',
            allowNull: true
        },
        ot_end_dt: {
            type: DataTypes.DATE,
            field: 'ot_end_dt',
            allowNull: true
        },
        actual_clockin_dt: {
            type: DataTypes.DATE,
            field: 'actual_clockin_dt',
            allowNull: true
        },
        actual_clockout_dt: {
            type: DataTypes.DATE,
            field: 'actual_clockout_dt',
            allowNull: true
        },
        record_type: {
            type: DataTypes.STRING(50),
            field: 'record_type',
            allowNull: true
        },
        shift_flag: {
            type: DataTypes.CHAR(1),
            field: 'shift_flag',
            allowNull: true
        },
        transport_flag: {
            type: DataTypes.CHAR(1),
            field: 'transport_flag',
            allowNull: true
        },
        ot_1_0: {
            type: DataTypes.FLOAT(53),
            field: 'ot_1_0',
            allowNull: true
        },
        ot_1_5: {
            type: DataTypes.FLOAT(53),
            field: 'ot_1_5',
            allowNull: true
        },
        ot_3_0: {
            type: DataTypes.FLOAT(53),
            field: 'ot_3_0',
            allowNull: true
        },
        record_date: {
            type: DataTypes.DATEONLY,
            field: 'record_date',
            allowNull: true
        },
        record_month: {
            type: DataTypes.CHAR(6),
            field: 'record_month',
            allowNull: false
        },
        remark: {
            type: DataTypes.STRING(100),
            field: 'remark',
            allowNull: true
        },
        use_flag: {
            type: DataTypes.CHAR(1),
            field: 'use_flag',
            allowNull: true
        },
        create_by: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        },
        create_dt: {
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
