const txSummaryDetailController = require('../controllers').txSummaryDetailController;
/**
 * /holiday?start=2018/01/01&end=2018/01/31
 */
module.exports = [
    { 
        method: 'POST', path: '/report/getSummaryMonthly', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getSummaryMonthly(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummarySupervisor', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getSummarySupervisor(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryOrganization', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getSummaryOrganization(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryAdjust', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getSummaryAdjust(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getApproveAllowanceReport', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getApproveAllowanceReport(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryDaily', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getSummaryDaily(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getDetail', config: { auth: false }, handler: (request, reply) => {
            return txSummaryDetailController.getDailyDetail(request, reply);
        }
    }
];
