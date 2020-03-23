const SERVER_ADDR = "ws://localhost:8000/chat";

class ClientUI {
    constructor() {
        this.user_list = document.querySelector('#channel_users');
    }
    clearUserList() {
        while (this.user_list.hasChildNodes()) {
            this.user_list.removeChild(this.user_list.firstChild);
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
}

class Client {
    constructor(server_addr) {
        var _Instance = this;

        this.ui = new ClientUI();

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
        console.dir(msg);
        switch (msg.type) {
            case "user_list":
                this.users = msg.data;
                this.ui.setUserList(msg.data);
                break;
            default:
                break;
        }
    }
}

window.addEventListener('load', function() {
    var client = new Client(SERVER_ADDR);
});