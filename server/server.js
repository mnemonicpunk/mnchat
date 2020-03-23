var User = require('./user.js');
var Channel = require('./channel.js');

var CHANNEL_CFG = require('../config/channels.json');

class Server {
    constructor() {
        this.users = [];
        this.channels = [];

        for (let i=0; i<CHANNEL_CFG.length; i++) {
            let c = new Channel(CHANNEL_CFG[i].name);
            this.channels.push(c);
        }
        this.system_channel = this.channels[0];

        console.dir(CHANNEL_CFG);

        //console.log(this.createUniqueID());
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
            console.dir({
                name: user.name,
                id: user.id
            });
            return;
        }
        this.users.splice(idx, 1);
    }
    createUniqueID() {
        let length = 16;

        var genString = function(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;    
        }

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
}

module.exports = Server;