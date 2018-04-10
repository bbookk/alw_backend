// const txActivityDetail = require('../models').TxActivityDetail;

// module.exports = {

//     create(req, res) {
//           console.log(txActivityDetail);
//         return txActivityDetail.create({
//             headerId: req.body.headerId,
//             activityName: req.body.activityName,
//             activityDesc: req.body.activityDesc,
//             createBy: req.body.createBy,
//             createDt: req.body.createDt,
//         })
//             .then(todo => res.status(201).send(todo))
//             .catch(error => res.status(400).send(error));
//     },
// }; 