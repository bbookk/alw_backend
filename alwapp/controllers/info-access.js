const infoAccess = require('../models').InfoAccess;
const serviceAccessInfo = require('../service/login-service')
module.exports = {

  
  create(req, res) {
    serviceAccessInfo.stampAccessLog(req,res)
  },
  list(req, res) {
    return infoAccess
      .findAll({
        include: [{
          all:true

        }],
        order: [
          ['createDt', 'DESC'],
        ],
      })
      .then((todos) => res.status(200).send(todos))
      .catch((error) => res.status(400).send(error));
  },

};