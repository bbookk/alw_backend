
/**
   * log Controller
   */
const batchLogController = require('./log-batch');
const transactionLogController = require('./log-transaction');
const serviceLogController = require('./log-service');

/**
   * MST Controller
   */
const mstDDlController = require('./mst-ddl');
const mstObjectController = require('./mst-object');
const mstParamController = require('./mst-param');
const mstRoleController = require('./mst-role');


/**
     * TX Controller
     */
const txSLHeaderController = require('./tx-sl-header');
const txSLDetailController = require('./tx-sl-detail');
const txTRHeaderController = require('./tx-tr-header');
const txTRDetailController = require('./tx-tr-detail');
const txUsedQuotaDetailController = require('./tx-used-quota-detail');
const txUsedQuotaHeaderController = require('./tx-used-quota-header');
const txSummaryDetailController = require('./tx-summary-detail');
const txAvayaPinDetailController = require('./tx-avaya-pin-detail');
const txAvayaPinHeaderController = require('./tx-avaya-pin-header');
const txActivityDetailController = require('./tx-activity-detail');
const txActivityHeaderController = require('./tx-activity-header');

/**
     * Info
     */

const infoAccessController = require('./info-access');
const infoAvayaPinController = require('./info-avaya-pin');
const infoHolidayController = require('./info-holiday');
const infoRoleObjectController = require('./info-role-object');
const infoScheduleController = require('./info-schedule');
const infoUsedQuotaController = require('./info-used-quota');
const infoActivityController = require('./info-activity');

module.exports = {
  /**
   * Info Controller
   */
  infoAccessController,
  infoAvayaPinController,
  infoHolidayController,
  infoRoleObjectController,
  infoScheduleController,
  infoUsedQuotaController,
  infoActivityController,
  /**
     * log Controller
     */
  transactionLogController,
  batchLogController,
  serviceLogController,

  /**
     * MST Controller
     */
  mstDDlController,
  mstObjectController,
  mstParamController,
  mstRoleController,

  /**
     * TX Controller
     */
  txSLHeaderController,
  txSLDetailController,
  txTRHeaderController,
  txTRDetailController,
  txUsedQuotaDetailController,
  txUsedQuotaHeaderController,
  txSummaryDetailController,
  txAvayaPinDetailController,
  txAvayaPinHeaderController,
  txActivityDetailController,
  txActivityHeaderController,
};
