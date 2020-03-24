const ACCOUNT_PATH = "./data/account/";
const TOKEN_PATH = "./data/token/";

var fs = require('fs');
var User = require('./user.js');
var Channel = require('./channel.js');
var Account = require('./account.js');

var CHANNEL_CFG = require('../config/channels.json');

var genString = function(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;    
}

class Server {
    constructor() {
        this.users = [];
        this.channels = [];

        for (let i=0; i<CHANNEL_CFG.length; i++) {
            let c = new Channel(CHANNEL_CFG[i].name);
            this.channels.push(c);
        }
        this.system_channel = this.channels[0];

        let n = "joshua";
        let pwh = "12345";
        let a = null;
        if (this.authWithToken(n, this.loginAccount(n, pwh))) {
            a = new Account(n);
        }
        console.dir(a);
    }
    connectUser(ws) {
        var u = new User(ws, this);
        u.id = this.createUniqueID();
        
        this.users.push(u);
        u.joinChannel(this.system_channel);
        this.sendChannelList(u);
    }
    disconnectUser(user) {
        let idx = -1;
        for (let i=0; i<this.users.length; i++) {
            if (this.users[i].id == user.id) {
                idx = i;
            }
        }
        if (idx == -1) {
            console.log("Tried to disconnect user that does not exist: ");
            return;
        }
        this.users.splice(idx, 1);
    }
    createUniqueID() {
        let length = 16;
        let unique_id = false;
        let id = genString(length);
        while (unique_id == false) {
            unique_id = true;
            let id = genString(length);
            for (let i=0; i<this.users.length; i++) {
                if (this.users[i].id == id) {
                    unique_id = false;
                }
            }
        }   
        return id;
    }
    sendChannelList(user) {
        let l = [];
        for (let i=0; i<this.channels.length; i++) {
            l.push({
                name: this.channels[i].name
            });
        }
        user.sendMessage('channel_list', l);
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
    registerAccount(name, pw_hash) {
        let n = this.getAccountNameFromString(name);
        let fn = ACCOUNT_PATH + n + ".account";

        let data = {
            name: name,
            pw_hash: pw_hash
        }

        if (!this.existsAccount(n)) {
            fs.writeFileSync(fn, JSON.stringify(data), { flag: 'w'});
            return true;
        }
        return false;
    }
    loginAccount(name, pw_hash) {
        let n = this.getAccountNameFromString(name);
        let fn = ACCOUNT_PATH + n + ".account";

        if (!this.existsAccount(name)) { return null; }

        let a = JSON.parse(fs.readFileSync(fn).toString('utf8'));
        if (a.pw_hash != pw_hash) { return null; }

        let token = this.getAccountToken(name, true);
        return token;
    }
    existsAccount(name) {
        let n = this.getAccountNameFromString(name);
        return fs.existsSync(ACCOUNT_PATH + n + ".account");
    }
    createAccountToken(name) {
        let n = this.getAccountNameFromString(name);
        let fn = TOKEN_PATH + n + ".token";
        let length = 128;

        let token = genString(length);
        let data = {
            name: n,
            token: token
        };
        fs.writeFileSync(fn, JSON.stringify(data));
    }
    getAccountToken(name, create_if_needed) {
        let n = this.getAccountNameFromString(name);
        let fn = TOKEN_PATH + n + ".token";

        if (!fs.existsSync(TOKEN_PATH + n + ".token")) {
            if (create_if_needed) {
                this.createAccountToken(name);
            } else {
                return null;
            }
            
        }

        let token = JSON.parse(fs.readFileSync(fn).toString('utf8'));
        return token;
    }
    authWithToken(name, token) {
        let compare_token = this.getAccountToken(name, false);
        if (token == null) { return false; }
        if (compare_token == null) { return false; }

        if (token.token == compare_token.token) {
            return true;
        }

        return false;
    }
}

module.exports = Server;