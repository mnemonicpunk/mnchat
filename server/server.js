const ACCOUNT_PATH = "./data/account/";
const TOKEN_PATH = "./data/token/";
const GROUP_PATH = "./data/group/";
const CHANNEL_PATH = "./data/channel/";

const ACCESS_LEVELS = {
    USER: 0,
    ADMIN: 10
}

const FLUSH_AFTER = 10;

var fs = require('fs');
var User = require('./user.js');
var Channel = require('./channel.js');
var Account = require('./account.js');
var Group = require('./group.js');

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
        this.groups = [];
        this.tick_counter = 0;

        // assert that the required directories exist
        let dirs = ['account', 'channel', 'group', 'log', 'token'];
        let prefix = "./data/";
        for (let i=0; i<dirs.length; i++) {
            let p = prefix + dirs[i];
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p);
                console.log("Data directory '" + p + "' has been created.");
            }
        }

        // end assert

        console.log("Loading channels...");
        let load_channels = fs.readdirSync(CHANNEL_PATH);
        for (let i=0; i<load_channels.length; i++) {
            let n = load_channels[i].split('.');
            let c = new Channel(n[0], this);
            this.channels.push(c);
        }
        this.system_channel = this.channels[0];
        console.log("Channels loaded.");


        console.log("Loading groups...");
        let load_groups = fs.readdirSync(GROUP_PATH);
        for (let i=0; i<load_groups.length; i++) {
            let n = load_groups[i].split('.');
            let g = new Group(n[0]);
            this.groups.push(g);
        }
        console.log("Groups loaded.");

        var _Instance = this;
        var _tick = function() {
            _Instance.tick();
            setTimeout(_tick, 1000);
        };
        _tick();
    }
    tick() {
        for (let i=0; i<this.users.length; i++) {
            this.users[i].tick();
        }
        this.tick_counter++;
        if (this.tick_counter >= FLUSH_AFTER) {
            this.flush();
            this.tick_counter = 0;
        }
    }
    connectUser(ws) {
        var u = new User(ws, this);
        u.id = this.createUniqueID();
        
        this.users.push(u);
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
            console.log("Tried to disconnect user that does not exist: " + user.id + " // " + user.name);
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
    getChannelByName(name) {
        for (let i=0; i<this.channels.length; i++) {
            if (this.channels[i].data.name == name) {
                return this.channels[i];
            }
        }
        return null;
    }
    sendChannelList(user) {
        let l = [];
        for (let i=0; i<this.channels.length; i++) {
            l.push({
                name: this.channels[i].data.name,
                id: i
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
            pw_hash: pw_hash,
            access: ACCESS_LEVELS.USER
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
    getGroup(name) {
        for (let i=0; i<this.groups.length; i++) {
            if (this.groups[i].name == name) {
                return this.groups[i];
            }
            if (this.groups[i].getName() == name) {
                return this.groups[i];
            }
        }
        return null;
    }
    existsGroup(name) {
        return (this.getGroup(name) != null);
    }
    flush() {
        for (let i=0; i<this.channels.length; i++) {
            this.channels[i].commitLog();
        }
    }
}

module.exports = Server;