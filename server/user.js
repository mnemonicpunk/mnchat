class User {
    constructor(ws, server) {
        var _Instance = this;

        this.id = -1;
        this.name = "Anonymous";
        this.server = server;

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
        console.dir(msg);
        this.socket.send(JSON.stringify(msg));
    }
    sendMessage(type, data) {
        this.send({
            type: type,
            data: data
        });
    }
    handleMessage(type, data) {
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
            default: 
                break;
        }
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
            console.log("Attempted to send chat text without being in a channel: " + data);
        }
    }
}

module.exports = User;