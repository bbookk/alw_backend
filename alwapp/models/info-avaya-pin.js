/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
    const  InfoAvayaPin =sequelize.define('InfoAvayaPin', {
        avayaPinId: {
            type: DataTypes.INTEGER,
            field: 'avaya_pin_id',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        detailId: {
            type: DataTypes.INTEGER,
            field: 'detail_id',
            allowNull: true
        },
        pin: {
            type: DataTypes.STRING(20),
            field: 'pin',
            allowNull: false
        },
        aid: {
            type: DataTypes.STRING(20),
            field: 'aid',
            allowNull: false
        },
        useFlag: {
            type: DataTypes.CHAR(1),
            field: 'use_flag',
            allowNull: false
        },
        createBy: {
            type: DataTypes.STRING(20),
            field: 'create_by',
            allowNull: false
        },
        createDt: {
            type: DataTypes.DATE,
            field: 'create_dt',
            allowNull: true
        },
        uPDATEDt: {
            type: DataTypes.DATE,
            field: 'UPDATE_DT',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'info_avaya_pin',
        timestamps: false
    });

    return InfoAvayaPin;
};

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
