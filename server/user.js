var Account = require('./account.js');

class User {
    constructor(ws, server) {
        var _Instance = this;

        this.id = -1;
        this.name = "Anonymous";
        this.server = server;
        this.account = null;
        this.channel = null;
        this.socket = ws;
        this.socket.on('message', function(e) {
            let d = JSON.parse(e);
            _Instance.handleMessage(d.type, d.data);
        });
        this.socket.on('close', function(e) {
            _Instance.leaveChannel();
            _Instance.server.disconnectUser(this);
            console.log("User " + _Instance.id + " has disconnected.");
        });
    }
    send(msg) {
        this.socket.send(JSON.stringify(msg));
    }
    sendMessage(type, data) {
        this.send({
            type: type,
            data: data
        });
    }
    handleMessage(type, data) {
        try {
            switch(type) {
                case "get_user_list":
                    if (this.c != null) {
                        this.send({
                            type: 'user_list',
                            data: this.c.getUserList()
                        });
                    }
                    break;
                case "chat_message":
                    this.sendTextToChannel(data);
                    break;
                case "auth":
                    this.doAuth(data);
                    break;
                case "obtain_token":
                    this.doLogin(data.name, data.pw_hash);
                    break;                    
                case "register_account":
                    this.doRegister(data.name, data.pw_hash);
                    break;
                default: 
                    console.log(type);
                    console.dir(data);
                    break;
            }    
        } catch(e) {
            console.dir(e);
        }
    }
    errorMessage(message) {
        this.sendMessage('error_msg', message);
    }
    getName() {
        if (this.account == null) { return "Anonymous"; }
        return (this.account.data.name);
    }
    joinChannel(c) {
        if (c.join(this)) {
            this.channel = c;
        }
    }
    leaveChannel() {
        if (this.channel != null) {
            this.channel.leave(this);
            this.channel = null;
        }
    }
    sendTextToChannel(data) {
        if (this.channel != null) {
            this.channel.sendText(this, data);
        } else {
            this.errorMessage("Um Nachrichten senden zu können musst du dich in einem Channel befinden.");
        }
    }
    doRegister(name, pw_hash) {
        let state = this.server.registerAccount(name, pw_hash);
        if (state == true) {
            this.doLogin(name, pw_hash);
        } else {
            this.errorMessage("Dieser Name ist bereits vergeben.");
        }
    }
    doLogin(name, pw_hash) {
        let token = this.server.loginAccount(name, pw_hash);
        this.sendMessage('account_token', token);
    }
    doAuth(token) {
        if ((token.name =="") || (token.token =="")) {
            return;
        }

        let auth_success = this.server.authWithToken(token.name, token);
        if (auth_success == true) {
            this.account = new Account(token.name);
            this.sendMessage('my_details', {
                name: this.getName()
            });
        }

        this.joinChannel(this.server.system_channel);
    }
}

module.exports = User;