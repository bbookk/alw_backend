/**
 * Mst-paramController
 *
 * @description :: Server-side logic for managing mst-params
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const mstParam = require('../models').MstParam;
module.exports = {



  /**
   * `Mst-paramController.list()`
   */
  list: function (req, res) {
    return mstParam
      .findAll({
        // where:[],  //getall
       // where: ['1=1'],  //getempty
       where: {
        paramId:{}
       }, 
        include: [{
          all: true

        }],
        order: [
          ['createDt', 'DESC'],
        ],
      })
      .then((todos) => res.status(200).send(todos))
      .catch((error) => res.status(400).send(error));
  },


  /**
   * `Mst-paramController.show()`
   */
  show: function (req, res) {
    return res.json({
      todo: 'show() is not implemented yet!'
    });
  },


  /**
   * `Mst-paramController.create()`
   */
  create: function (req, res) {
    return res.json({
      todo: 'create() is not implemented yet!'
    });
  },


  /**
   * `Mst-paramController.update()`
   */
  update: function (req, res) {
    return res.json({
      todo: 'update() is not implemented yet!'
    });
  },


  /**
   * `Mst-paramController.remove()`
   */
  remove: function (req, res) {
    return res.json({
      todo: 'remove() is not implemented yet!'
    });
  }
};

