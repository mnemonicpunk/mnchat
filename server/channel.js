class Channel {
    constructor(name) {
        this.name = name;
        this.users = [];
        this.messages = [];
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
        this.broadcast('user_join', {
            'user_name': user.name,
            'user_id': user.id
        });
        this.users.push(user);
        this.sendUserList(user);

        return true;
    }
    leave(user) {
        let idx = this.findUserIndex(user);
        this.users.splice(idx, 1);
        this.broadcast('user_leave', user.id);
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
            'name': 'James-Bot',
            'id': 0
        }];
        for (let i=0; i<this.users.length; i++) {
            users.push({
                'name': this.users[i].name,
                'id': this.users[i].id
            });
        }
        user.sendMessage('user_list', users);
    }
}

module.exports = Channel;