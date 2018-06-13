
module.exports.Constant = {

    OT: {
        OT: 'OT',
        AutoOT: 'AutoOT',
        OTCom: 'OTCOM',

    },
    LEAVE: [
        { ACTIVITY: 'Business Leave', KEY: 'BL' },
        { ACTIVITY: 'Maternity Leave', KEY: 'BL' },
        { ACTIVITY: 'Military Leave', KEY: 'BL' },
        { ACTIVITY: 'Priesthood Leave', KEY: 'BL' },
        { ACTIVITY: 'Vacation', KEY: 'VL' },
        { ACTIVITY: 'Sick', KEY: 'SL' }
    ],
    PARAM: {
        CRON_TR: '',
        CRON_SL: '',
        CRON_QUOTA: '',
        CRON_ACTIVITY: '',

        OT_BEFORE_ACC: '',
        OT_AFTER_ACC: '',
        OT_BEFORE_SHOP: '',
        OT_AFTER_SHOP: '',

        RDP_DATE_FORMAT: '',
        SUMMARY_DATE_FORMAT: '',
        SUMMARY_TIME_FORMAT: '',
        SUMMARY_HOUR_FORMAT: '',
        APP_DATETIME_FORMAT: '',

        NAS_WFM_PATH: '',
        TR_PATH: '',
        SL_PATH: '',

        SHIFT_TIME: '',
        TRANSPORT_TIME: '',
        STANDARD_WORK: '',

        SHIFT_PAID: '',
        TRANSPORT_PAID: '',
        PERFECT_ATTD: '',
        IMPERFECT_ATTD: '',

        OT_1: '',
        OT_1_5: '',
        OT_3: '',
    },
    API: {
        STATUS_SUCCESS: 'S',
        STATUS_ERROR: 'E',
        STATUS_CODE_INVALID_PARAM: '1001',
        STATUS_CODE_UNKNOWN: '9999'
    },
    SERVICE: {
        ERROR_CODE_CONNECTION_TIMEOUT: '2001',
        ERROR_CODE_CONNECTION_RESET: '2002',
        ERROR_CODE_NOT_AUTHORIZE: '2003',
        ERROR_CODE_UNKNOWN: '2000',
        ERROR_CODE_SUCCESS: '0000',
        ERROR_CODE_NOT_FOUND: '3001',
    }
}

