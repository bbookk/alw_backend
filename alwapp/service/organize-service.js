const HashMap = require('hashmap');
var env = process.env.NODE_ENV || 'local';
const appConfig = require('../config/app-config.json')[env];
var omService = require('../service/om-service');
var OrganizeInfo = require('../class/organize-info');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
    /**
     * Return organizeInfo according to provided orgCode
     * if orgCode = null, return all company from app-config.json (allowed_company_code)
     * 
     * org chart as below
     * Employee Type < FC < SC < DP < BU < Company
     */
    getOrganizeInfoByOrgCode: async function (orgCode) {
        try {
            logService.debug("Start: organize-service.getOrganizeInfoByOrgCode");

            if (logService.isDebugEnabled()) {
                logService.debug("orgCode = " + orgCode);
            }

            var coList = [],buList = [],dpList = [],scList = [],fcList = [];
            var organizeInfoList;
            
            if (orgCode) {
                await omService.getLowerOrganizeInfoListByOrgCode(orgCode, 1)
                .then(_organizeInfoList => {
                    organizeInfoList = _organizeInfoList;
                })
                .catch(err => {
                    throw err;
                });
            } else {
                // return configured company
                await omService.getAllCompany()
                .then(_organizeInfoList => {
                    organizeInfoList = _organizeInfoList;
                })
                .catch( err => {
                    throw err;
                });
            }
            
            // filter only allow company in config to be used
            // use allowed_company_name to check company name
            var allowedCompanyList = appConfig.allowed_company_code;

            if (logService.isDebugEnabled())
            {
                logService.debug("allowed_company_code = " + allowedCompanyList);
            }

            await organizeInfoList.forEach (function(organizeInfo)  {
                // if ORGLEVEL is undefined, default is CO
                if ((organizeInfo.orgLevel || "CO") == "CO" && allowedCompanyList.indexOf(organizeInfo.orgCode) > -1){
                    coList.push(organizeInfo);
                } else if (organizeInfo.orgLevel == "BU") {
                    buList.push(organizeInfo);
                } else if (organizeInfo.orgLevel == "DP") {
                    dpList.push(organizeInfo);
                } else if (organizeInfo.orgLevel == "SC") {
                    scList.push(organizeInfo);
                } else if (organizeInfo.orgLevel == "FC") {
                    fcList.push(organizeInfo);
                }
            });

            if (logService.isTraceEnabled())
            {
                logService.trace("coList = " + coList);
                logService.trace("buList = " + buList);
                logService.trace("dpList = " + dpList);
                logService.trace("scList = " + scList);
                logService.trace("fcList = " + fcList);
            }

            return {
                co_list: coList,
                bu_list: buList,
                dp_list: dpList,
                sc_list: scList,
                fc_list: fcList
            };                
        } finally {
            logService.debug("End: organize-service.getOrganizeInfoByOrgCode");
        }
    }
}
