/* eslint new-cap: "off", global-require: "off" */
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const InfoAccess = sequelize.define('InfoAccess', {
        accessInfoId: {
            type: DataTypes.INTEGER,
            field: 'access_info_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: false
        },
        userName: {
            type: DataTypes.STRING(20),
            field: 'user_name',
            allowNull: false
        },
        lastLoginDt: {
            type: DataTypes.DATE,
            field: 'last_login_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('lastLoginDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        firstLoginDt: {
            type: DataTypes.DATE,
            field: 'first_login_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('firstLoginDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        createBy: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: false,
            get: function () {
                return moment.utc(this.getDataValue('createDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        },
        updateBy: {
            type: DataTypes.STRING(20),
            field: 'update_by',
            allowNull: true
        },
        updateDt: {
            type: DataTypes.DATE,
            field: 'update_dt',
            allowNull: true,
            get: function () {
                return moment.utc(this.getDataValue('updateDt')).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
            }
        }
    }, {
            schema: 'public',
            tableName: 'info_access',
            timestamps: false
        });
    return InfoAccess
};

// module.exports.initRelations = () => {
//     delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

// };

module.exports.createx = (req, res, model) => {
    console.log('xxxx')
    console.log(model)
    console.log(req.body)
    model.create({
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

};
