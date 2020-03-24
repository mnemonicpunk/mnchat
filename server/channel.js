const BOTNAME = "Nanny";

class Channel {
    constructor(name) {
        this.name = name;
        this.users = [];
        this.messages = [];

        this.log = [];
    }
    addUser(user) {
        if (!(user in this.users)) {
            this.users.push(user);
        } else {
            console.log("User tried to join channel twice? o.O");
        }
    }
    addMessage(user_name, msg) {
        this.messages.push({
            name: user_name,
            msg: msg
        });
    }
    getMessages() {
        return this.messages;
    }
    canJoin(user) {
        if (user.account == null) { return false; }
        return true;
    }
    broadcast(type, data) {
        let msg = {
            type: type,
            data: data
        };
        for (let i=0; i<this.users.length; i++) {
            this.users[i].sendMessage(type, data);
        }
    }
    join(user) {
        if (!this.canJoin(user)) {
            return false;
        }
        this.broadcast('user_join', {
            name: user.getName(),
            id: user.id
        });
        this.users.push(user);
        this.sendUserList(user);
        this.sendLog(user);
        this.sendChannelName(user);

        return true;
    }
    leave(user) {
        let idx = this.findUserIndex(user);
        this.users.splice(idx, 1);
        this.broadcast('user_leave', user.id);
    }
    sanitize(text) {
        return text;
    }
    findUserIndex(user) {
        for (let i=0; i<this.users.length; i++) {
            if (this.users[i].id == user.id) {
                return i;
            }
        }
        return -1;
    }
    sendUserList(user) {
        let users = [{
            'name': BOTNAME,
            'id': 0
        }];
        for (let i=0; i<this.users.length; i++) {
            users.push({
                'name': this.users[i].getName(),
                'id': this.users[i].id
            });
        }
        user.sendMessage('user_list', users);
    }
    sendText(user, data) {
        let d = this.sanitize(data);

        if (data == "") { return; }

        let msg = {
            name: user.getName(),
            message: d
        };

        this.broadcast('channel_text', msg);
        this.log.push(msg);
    }
    sendChannelName(user) {
        user.sendMessage('channel_name', this.name);
    }
    sendLog(user) {
        user.sendLog(this.log);
    }
}

module.exports = Channel;