const ACCOUNT_PATH = "./data/account/";
const ACCESS_LEVELS = {
    USER: 0,
    ADMIN: 10
}

var ServerObject = require('./server_object.js');

class Account extends ServerObject{
    constructor(name) {
        super(name, ACCOUNT_PATH, "account", {
            name: "Anonymous",
            pw_hash: "",
            access: ACCESS_LEVELS.USER
        });
    }
    existsAccount(name) {
        return this.existsObject(name);
    }
    isAdmin() {
        return this.data.access >= ACCESS_LEVELS.ADMIN;
    }
    getAccountNameFromString(text) {
        return super.toFilename(text);
    }
    getAccountName() {
        return this.getAccountNameFromString(this.data.name);
    }
    getAccessLevel() {
        return this.data.access;
    }
}

module.exports = Account;