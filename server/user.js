var Account = require('./account.js');
var Command = require('./command.js');

const KEEP_ALIVE_PING = 10;
const KEEP_ALIVE_TIMEOUT = 30;

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
            _Instance.server.disconnectUser(_Instance);
        });
        this.socket.on('error', function(e) {
            _Instance.leaveChannel();
            _Instance.server.disconnectUser(_Instance);
        });        

        this.keep_alive = 0;
    }
    tick() {
        this.keep_alive++;
        if (this.keep_alive > KEEP_ALIVE_PING) {
            this.keepAlive();
        }
        if (this.keep_alive > KEEP_ALIVE_TIMEOUT) {
            this.socket.close();
        }
    }
    send(msg) {
        try {
            this.socket.send(JSON.stringify(msg));
        } catch(e) {
            console.dir(e);
        }
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
                case "keep_alive":
                    break;    
                case "join_channel":
                    let channel = this.server.getChannelByName(data);
                    if (channel != null) {
                        this.joinChannel(channel);
                    }
                    break;        
                default: 
                    console.log(type);
                    console.dir(data);
                    break;
            }    
            this.keep_alive = 0;
        } catch(e) {
            console.dir(e);
        }
    }
    keepAlive() {
        this.sendMessage('keep_alive', {});
    }
    errorMessage(message) {
        this.sendMessage('error_msg', message);
    }
    getName() {
        if (this.account == null) { return "Anonymous"; }
        return (this.account.data.name);
    }
    isAdmin() {
        if (this.account == null) { return false; }
        return this.account.isAdmin();
    }
    joinChannel(c) {
        if (c.canJoin(this)) {
            this.leaveChannel();
            if (c.join(this)) {
                this.channel = c;
            }
        } else {
            this.receiveBotMessage("Du hast nicht die Berechtigung, den Raum " + c.data.name + " zu betreten.");
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
            if (data[0] == "/") {
                this.parseCommand(data);
            } else {
                if (this.channel.checkPermission(this, "text")) {
                    this.channel.sendText(this, data);
                } else {
                    this.receiveBotMessage("Du hast nicht die Berechtigung, im Raum " + this.channel.data.name + " zu schreiben.");
                }
            }
        } else {
            this.errorMessage("Um Nachrichten senden zu können musst du dich in einem Channel befinden.");
        }
    }
    parseCommand(text) {
        let cmd = new Command(this);
        cmd.parseCommand(text);
    }
    receiveBotMessage(message) {
        this.receivePrivateMessage({
            name: "Nanny"
        }, message);
    }
    receivePrivateMessage(sender, message) {
        this.sendMessage('private_message', {
            sender: sender,
            message: message
        });
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
            this.authFailed();
            return;
        }

        let auth_success = this.server.authWithToken(token.name, token);
        if (auth_success == true) {
            this.account = new Account(token.name);
            this.sendMessage('my_details', {
                name: this.getName()
            });
            this.joinChannel(this.server.system_channel);
        } else {
            this.authFailed();
        }
    }
    sendLog(log) {
        this.sendMessage('channel_log', log);
    }
    authFailed() {
        this.sendMessage('auth_failed', {});
    }
}

module.exports = User;