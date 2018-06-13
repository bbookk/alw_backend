var Constant = require('./constant').Constant;

module.exports = class ApiResponse {
    constructor() {
    }

    // response payload
    set response(response) {
        this._response = response;
    }
    get response() {
        return this._response;
    }

    // response name
    set name(name) {
        this._name = name;
    }
    get name() {
        return this._name;
    }

    // response message
    set message(message) {
        this._message = message;
    }
    get message() {
        return this._message;
    }

    // response time
    set responseTime(responseTime) {
        this._responseTime = responseTime;
    }
    get responseTime() {
        return this._responseTime;
    }

    // response status
    set status(status) {
        this._status = status;
    }
    get status() {
        return this._status;
    }

     // response code
     set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    get statusCode() {
        return this._statusCode;
    }

    toJSON() {
        var json = {           
            "header": {
                status: this._status || Constant.API.STATUS_SUCCESS,
                status_code: this._statusCode || '0000',
                message: this._message || '',
                resp_time: this._responseTime || new Date(),
            }
        };

        // add new attribute to json
        if (this._name != null && this._response != null)
        {
            json[this._name] = this._response;
        }

        return json;
    }
}