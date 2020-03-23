class User {
    constructor(ws, server) {
        var _Instance = this;

        this.channel = null;
        this.socket = ws;
        this.socket.on('message', function(e) {
            let d = JSON.parse(e);
            _Instance.handleMessage(d.type, d.data);
        });
        this.socket.on('close', function(e) {
            
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
                console.log("User requested user list");
                if (this.c != null) {
                    this.send({
                        type: 'user_list',
                        data: this.c.getUserList()
                    });
                }
                break;
        }
    }
    joinChannel(c) {
        if (c.join(this)) {
            this.channel = c;
        }
    }
    leaveChannel() {
        if (this.c != null) {
            this.c.leave(this);
            this.c = null;
        }
    }
}

module.exports = User;