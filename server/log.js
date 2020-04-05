const LOG_PATH = "./data/log/";

var ServerObject = require('./server_object.js');

class Log extends ServerObject {
    constructor(name, server) {
        super(name, LOG_PATH, "log", {
            name: name,
            log_data: []
        });

        this.server = server;
        this.users = [];
    }
    commitLog(log) {
        let last_commit = 0;
        if (this.data.log_data.length > 0) {
            last_commit = this.data.log_data[this.data.log_data.length];
        }
        for (let i=0; i<log.length; i++) {
            if (new Date(log[i].timestamp) > new Date(last_commit)) {
                this.data.log_data.push(log[i]);
            }
        }
        this.save();
    }
    getLog(num) {
        let l = this.data.log_data;
        if (l.length > num) {
            return l.slice(l.length-num);
        }
        return l;
    }
}

module.exports = Log;