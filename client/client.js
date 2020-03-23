const SERVER_ADDR = "ws://localhost:8000/chat";

class ClientUI {
    constructor(client) {
        var _Instance = this;
        this.client = client;

        this.channel_list = document.querySelector('#channel_list');
        this.user_list = document.querySelector('#channel_users');
        this.chat_window = document.querySelector('#chat_content');

        this.chat_box = document.querySelector('#chat_msg_entry');
        this.chat_box.addEventListener('keydown', function(e) {
            if (e.keyCode == 13) {
                _Instance.client.chatMessage(_Instance.chat_box.value);
                _Instance.chat_box.value = "";
            }
        });
    }
    clearUserList() {
        while (this.user_list.hasChildNodes()) {
            this.user_list.removeChild(this.user_list.firstChild);
        }
    }
    clearChannelList() {
        while (this.channel_list.hasChildNodes()) {
            this.channel_list.removeChild(this.channel_list.firstChild);
        }
    }    
    setUserList(users) {
        this.clearUserList();
        for (let i=0; i<users.length; i++) {
            let user_el = document.createElement('div');
            user_el.className = "user_list_entry";
            user_el.innerHTML = users[i].name||"Anonymous";
            this.user_list.appendChild(user_el);
        }
    }
    setChannelList(channels) {
        this.clearChannelList();
        for (let i=0; i<channels.length; i++) {
            let channel_el = document.createElement('div');
            channel_el.className = "channel_list_entry";
            channel_el.innerHTML = channels[i].name||"Unbenannter Channel";
            this.channel_list.appendChild(channel_el);
        }        
    }
    addTextMessage(name, message) {
        let el = document.createElement('div');
        el.className = "chat_text_message";
        el.innerHTML = "<b>" + name + ":</b> " + message;
        this.chat_window.appendChild(el);
    }
}

class Client {
    constructor(server_addr) {
        var _Instance = this;
        this.channel_list = [];
        this.users = [];

        this.ui = new ClientUI(this);

        this.socket = new WebSocket(server_addr);
        this.socket.addEventListener('open', function() {
            _Instance.sendMessage('get_user_list', '');
        });
        this.socket.addEventListener('message', function(e) {
            _Instance.handleMessage(JSON.parse(e.data));
        });            
    }
    sendMessage(type, data) {
        let d = {
            type: type,
            data: data
        };
        this.socket.send(JSON.stringify(d));
    }
    handleMessage(msg) {
        switch (msg.type) {
            case "user_list":
                this.users = msg.data;
                this.ui.setUserList(this.users);
                break;
            case "channel_text":
                this.getTextMessage(msg.data.name, msg.data.message);
                break;
            case "channel_list": 
                this.channel_list = msg.data;
                this.ui.setChannelList(this.channel_list);
            default:
                break;
        }
    }
    chatMessage(message) {
        this.sendMessage('chat_message', message);
    }
    getTextMessage(name, message) {
        this.ui.addTextMessage(name, message);
    }
}

window.addEventListener('load', function() {
    var client = new Client(SERVER_ADDR);
});