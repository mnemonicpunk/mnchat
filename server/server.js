var User = require('./user.js');
var Channel = require('./channel.js');

class Server {
    constructor() {
        this.users = [];
        this.channels = [];

        this.system_channel = new Channel("System");
        this.channels.push(this.system_channel);

        //console.log(this.createUniqueID());
    }
    connectUser(ws) {
        var u = new User(ws);
        this.users.push(u);

        u.id = this.createUniqueID();
        u.joinChannel(this.system_channel);
        
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
}

module.exports = Server;