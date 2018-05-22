const txSummaryDetailController = require('../controllers').txSummaryDetailController;

/**
 * /holiday?start=2018/01/01&end=2018/01/31
 */
module.exports = [
    { 
        method: 'POST', path: '/report/getSummarySupervisor', handler: (request, reply) => {
            txSummaryDetailController.getSummarySupervisor(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryOrganization', handler: (request, reply) => {
            txSummaryDetailController.getSummaryOrganization(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryAdjust', handler: (request, reply) => {
            txSummaryDetailController.getSummaryAdjust(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getApproveAllowanceReport', handler: (request, reply) => {
            txSummaryDetailController.getApproveAllowanceReport(request, reply);
        }
    },
    { 
        method: 'POST', path: '/report/getSummaryDaily', handler: (request, reply) => {
            txSummaryDetailController.getSummaryDaily(request, reply);
        }
    }
];
