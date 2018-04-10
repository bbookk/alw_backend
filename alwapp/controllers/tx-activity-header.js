// const headerActivity = require('../models').HeaderActivity;

// module.exports = {
//     create(req, res) {
//         return headerActivity.create({
//             headerId: req.body.headerId,
//             fileName: req.body.fileName,
//             recSuccess: req.body.recSuccess,
//             recFail: req.body.recFail,
//             status: req.body.status,
//             errorMsg: req.body.errorMsg,
//             createDt: req.body.createDt,
//             createBy: req.body.createBy,
//         })
//             .then(todo => res.status(201).send(todo))
//             .catch(error => res.status(400).send(error));
//     },
// };