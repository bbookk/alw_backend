const modelAccessInfo = require('../models').InfoAccess;
module.exports = {
    stampAccessLog: function (req, res) {
        console.log('service')
        
        let firstLogin = true
        if(firstLogin){
            console.log('insert')
             create(req, res)
            // modelAccessInfo.createx(req, res,modelAccessInfo.InfoAccess)
        }else{
            console.log('update')
            update(req, res)
        }

        return modelAccessInfo;
    }
}


function create(req, res) {
    modelAccessInfo.create({
        accessInfoId: req.body.accessInfoId,
        pin: req.body.pin,
        userName: req.body.userName,
        lastLoginDt: req.body.lastLoginDt,
        firstLoginDt: req.body.firstLoginDt,
        createBy: req.body.createBy,
        createDt: req.body.createDt,
        updateBy: req.body.updateBy,
        updateDt: req.body.updateDt,
    }).then(todo => res.status(201).send(todo))
        .catch(error => res.status(400).send(error));
}

function update(req, res) {
    return modelAccessInfo
        .findById(req.body.pin, {
            include: [{
                // model: TodoItem,
                // as: 'todoItems',
                all: true
            }],
        })
        .then(todo => {
            if (!todo) {
                return res.status(404).send({
                    message: 'Todo Not Found',
                });
            }
            return todo
                .update({
                   // title: req.body.title || todo.title,
                    pin: req.body.pin,
                    userName: req.body.userName,
                    lastLoginDt: req.body.lastLoginDt,
                    firstLoginDt: req.body.firstLoginDt,
                    createBy: req.body.createBy,
                    createDt: req.body.createDt,
                    updateBy: req.body.updateBy,
                    updateDt: req.body.updateDt,
                })
                .then(() => res.status(200).send(todo))
                .catch((error) => res.status(400).send(error));
        })
        .catch((error) => res.status(400).send(error));
}