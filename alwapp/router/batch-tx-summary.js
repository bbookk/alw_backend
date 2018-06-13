const summaryService = require('../service/summary-service');

/**
 * /batchSummary/start
 */
module.exports = [
    { 
        method: 'GET', path: '/batchSummary/start', handler: async function (request, reply) {
            await summaryService.processSummaryDetail(request, reply);
        }
    },
];
