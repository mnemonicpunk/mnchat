const ACCOUNT_PATH = "./data/account/";
const TOKEN_PATH = "./data/token/";
const ACCESS_LEVELS = {
    USER: 0,
    ADMIN: 10
}

var fs = require('fs');

class Account {
    constructor(name) {
        let n = this.getAccountNameFromString(name);
        let fn = ACCOUNT_PATH + n + ".account";

        this.data = {
            name: "Anonymous",
            pw_hash: "",
            access: ACCESS_LEVELS.USER
        }
        if (this.existsAccount(name)) { 
            this.data = JSON.parse(fs.readFileSync(fn).toString('utf8'));

            // zero out the pw hash, we'll never need it past login
            this.data.pw_hash = "";
        }
    }
    existsAccount(name) {
        let n = this.getAccountNameFromString(name);
        return fs.existsSync(ACCOUNT_PATH + n + ".account");
    }
    save() {
        let n = this.getAccountNameFromString(this.data.name);
        let fn = ACCOUNT_PATH + n + ".account";

        fs.writeFileSync(fn, JSON.stringify(this.data), { flag: 'w'});
    }    
    isAdmin() {
        return this.data.access >= ACCESS_LEVELS.ADMIN;
    }
    getAccountNameFromString(text) {
        let valid_characters = "abcdefghijklmnopqrstuvwxyz1234567890";
        let ctext = "";

        for (let i=0; i<text.length; i++) {
            let c = text[i].toLowerCase();
            for (let j = 0; j<valid_characters.length; j++) {
                if (c == valid_characters[j]) {
                    ctext += c;
                }
            }
        }

        return ctext;
    }
    getAccessLevel() {
        return this.data.access;
    }
    getGroups() {
        return this.data.groups;
    }
}

module.exports = Account;