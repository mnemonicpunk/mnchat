const SERVER_ADDR = "ws://localhost:8000/chat";
const PW_SALT = "FOOBARCOVID19";

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

        let dialog_register = document.querySelector("#dialog_register");
        let dialog_login = document.querySelector("#dialog_login");

        dialog_register.querySelector("#switch_to_login").addEventListener('click', function() {
            _Instance.modalDialog("login");
        });
        dialog_login.querySelector("#switch_to_register").addEventListener('click', function() {
            _Instance.modalDialog("register");
        });        

        dialog_register.querySelector("#register_confirm_btn").addEventListener('click', function() {
            _Instance.doRegister();
        });
        dialog_login.querySelector("#login_confirm_btn").addEventListener('click', function() {
            _Instance.doLogin();
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
    modalDialog(name) {
        let dialog_register = document.querySelector("#dialog_register");
        let dialog_login = document.querySelector("#dialog_login");

        dialog_register.style = "display: none;";
        dialog_login.style = "display: none;";

        switch (name) {
            case "register":
                dialog_register.style = "display: block;";
                break;
            case "login":
                dialog_login.style = "display: block;";
                break;    
            default: 
                break;
        }
    }
    doRegister() {
        let dialog_register = document.querySelector("#dialog_register");
        let uname = dialog_register.querySelector("#reg_uname").value;
        let pw1 = dialog_register.querySelector("#reg_pw1").value;
        let pw2 = dialog_register.querySelector("#reg_pw2").value;

        if (pw1 != pw2) {
            alert("Die Passwörter sind nicht gleich!");
        }

        this.client.doRegister(uname, pw1);
    }
    doLogin() {
        let dialog_login = document.querySelector("#dialog_login");
        let uname = dialog_login.querySelector("#log_uname").value;
        let pw1 = dialog_login.querySelector("#log_pw1").value;

        this.client.doLogin(uname, pw1);
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
            _Instance.authWithToken();
        });
        this.socket.addEventListener('message', function(e) {
            _Instance.handleMessage(JSON.parse(e.data));
        });
        
        console.dir(this.token());
    }
    authWithToken() {
        let token = this.token();
        if ((token.token == "") || (token.token == "")) {
            this.ui.modalDialog("register");
        }

        this.sendMessage('auth', token);
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
                break;
            case "account_token":
                this.setCredentials(msg.data.name, msg.data.token);
                break;
            case "auth_success":
                console.log("Authenticated!");
                break;
            case "my_details":
                console.dir(msg.data);
                break;
            case "error_msg":
                alert(msg.data);
                break;
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
    doRegister(username, password) {
        let uname = username;
        let pw = md5(password + PW_SALT);

        this.sendMessage('register_account', {
            name: uname,
            pw_hash: pw
        });        
    }
    doLogin(username, password) {
        let uname = username;
        let pw = md5(password + PW_SALT);

        this.sendMessage('obtain_token', {
            name: uname,
            pw_hash: pw
        });
    }
    setCredentials(name, token) {
        console.dir({
            name: name,
            token: token
        });
        localStorage.account_name = name;
        localStorage.account_token = token;
    }
    token() {
        let uname = localStorage.account_name || "";
        let token = localStorage.account_token || "";

        return {
            name: uname,
            token: token
        };
    } 
}

window.addEventListener('load', function() {
    var client = new Client(SERVER_ADDR);
});