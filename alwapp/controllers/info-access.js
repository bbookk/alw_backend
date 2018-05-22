const infoAccess = require('../models').InfoAccess;
const txSlDetail = require('../models').TxSlDetail;
const serviceAccessInfo = require('../service/login-service')
const pg = require('pg')
const pgFormat = require('pg-format');
const Pool = require('pg-pool')
const config = {
  database: "alwsdb",
  user: "alwsdbuser",
  password: "ais@1234",
  host: "10.138.47.138",
  port: 5432,
  max: 5, // set pool max size to 5 
  min: 0, // set min pool size to 0 
  idleTimeoutMillis: 30000, // close idle clients after 1 second 
};

const pool = new Pool(config);

module.exports = {


  create(req, res) {
    serviceAccessInfo.stampAccessLog(req, res)
  },
  list(req, res) {
    // return infoAccess
    //   .findAll({
    //     include: [{
    //       all:true

    //     }],
    //     order: [
    //       ['createDt', 'DESC'],
    //     ],
    //   })
    //   .then((todos) => res.status(200).send(todos))
    //   .catch((error) => res.status(400).send(error));


    return txSlDetail
      .find({
        where: [{
          emp_id: '539453'

        }], include: [{
          all: true
        }], raw: false
        // order: [
        //   ['createDt', 'DESC'],
        // ],
      })
      .then((todos) => { console.log(todos);console.log('xxxx', todos.get('scheduleDate')); res.status(200).send(todos) })
      .catch((error) => res.status(400).send(error));

    // let find = pgFormat("select * from tx_sl_detail where  emp_id='539453'");
    // (async () => {
    //     var client = await pool.connect()
    //     try {
    //         var result = await client.query(find)

    //         console.log('xxx')
    //         res.status(200).send(result)
    //     } finally {
    //         client.release()
    //     }
    // })().catch(e => console.error(e.message, e.stack))
  },

};