const SERVER_ADDR = "ws://192.168.0.214:8000/chat";
const PW_SALT = "FOOBARCOVID19";

var mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

class ClientUI {
    constructor(client) {
        var _Instance = this;
        this.client = client;

        this.channel_list = document.querySelector('#channel_list');
        this.user_list = document.querySelector('#channel_users');
        this.chat_window = document.querySelector('#chat_content');

        this.show_channels = (localStorage.show_channels=="on"?true:false);
        this.show_users = (localStorage.show_users=="on"?true:false);

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

        document.querySelector('#channel_toggle').addEventListener('click', function() {
            _Instance.showChannelList(!_Instance.show_channels);
        });
        document.querySelector('#user_toggle').addEventListener('click', function() {
            _Instance.showUserList(!_Instance.show_users);
        });

        this.showChannelList(this.show_channels);
        this.showUserList(this.show_users);

        window.addEventListener('resize', function() {
            _Instance.layout();
        });
        this.layout();
        this.chat_box.focus();

    }
    layout() {
        let supersize = mobilecheck();

        let app_el = document.querySelector('#dialog_chat');
        let app_size = {
            x: 0,
            y: 0,
            w: window.innerWidth,
            h: window.innerHeight
        }

        let menu_el = document.querySelector('#menu_bar');
        let menu_size = {
            x: app_size.x,
            y: app_size.y,
            w: app_size.w,
            h: supersize?120:60
        };

        let text_entry_el = document.querySelector('#chat_text');
        let text_entry_size = {
            x: app_size.x,
            y: app_size.y+app_size.h-(supersize?120:60),
            w: app_size.w,
            h: supersize?120:60
        };

        let channel_list_el = document.querySelector('#channel_list');
        let channel_list_size = {
            x: 0, 
            y: app_size.y + menu_size.y + menu_size.h,
            w: 200,
            h: app_size.h - (menu_size.y + menu_size.h + text_entry_size.h)
        }
        if (this.show_channels == false) {
            channel_list_size.w = 0;
        }

        let user_list_el = document.querySelector('#channel_users');
        let user_list_size = {
            x: app_size.w-200, 
            y: app_size.y + menu_size.y + menu_size.h,
            w: 200,
            h: app_size.h - (menu_size.y + menu_size.h + text_entry_size.h)
        }
        if (this.show_users == false) {
            user_list_size.w = 0;
        }

        let chat_window_el = document.querySelector('#chat_content');
        let chat_window_size = {
            x: app_size.x + channel_list_size.x + channel_list_size.w, 
            y: app_size.y + menu_size.y + menu_size.h,
            w: app_size.w - (channel_list_size.w + user_list_size.w),
            h: app_size.h - (menu_size.y + menu_size.h + text_entry_size.h)
        }        
        
        var setCoords = function(el, rect) {
            let style = "position: absolute; top: " + rect.y + "px; left: " + rect.x + "px; width: " + rect.w + "px; height: " + rect.h + "px; ";
            if ((rect.w == 0) || (rect.h == 0)) {
                style = "display: none";
            }
            el.style = style;
        }

        let els = [app_el, menu_el, channel_list_el, user_list_el, chat_window_el, text_entry_el];
        let sizes = [app_size, menu_size, channel_list_size, user_list_size, chat_window_size, text_entry_size];

        for (let i=0; i<els.length; i++) {
            setCoords(els[i], sizes[i]);
        }

        menu_el.style.lineHeight = menu_size.h + "px";
        menu_el.querySelector('#app_channel').style.lineHeight = menu_size.h + "px";
        menu_el.querySelector('#app_channel').style.fontSize = supersize?"300%":"150%";
        menu_el.querySelector('#channel_toggle').style.fontSize = supersize?"200%":"100%";
        menu_el.querySelector('#user_toggle').style.fontSize = supersize?"200%":"100%";

        channel_list_el.style.fontSize = supersize?"200%":"100%";
        user_list_el.style.fontSize = supersize?"200%":"100%";
        chat_window_el.style.fontSize = supersize?"200%":"100%";
        text_entry_el.querySelector('#chat_msg_entry').style.fontSize = supersize?"200%":"100%";

        //console.dir(els);
        console.dir(sizes);
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
        var _Instance = this;

        this.clearChannelList();
        for (let i=0; i<channels.length; i++) {
            let channel_el = document.createElement('div');
            channel_el.className = "channel_list_entry";
            channel_el.innerHTML = channels[i].name||"Unbenannter Channel";

            if (channels[i].name) {
                let cname = channels[i].name;
                channel_el.addEventListener('click', function() {
                    _Instance.client.joinChannel(cname);
                });
            }

            this.channel_list.appendChild(channel_el);
        }        
    }
    clearMessages() {
        while(this.chat_window.hasChildNodes()) {
            this.chat_window.removeChild(this.chat_window.firstChild);
        }
    }
    addTextMessage(msg) {
        let name = msg.name;
        let message = msg.message;

        let el = document.createElement('div');
        el.className = "chat_message";

        let el_user = document.createElement('div');
        let el_text = document.createElement('div');

        el_user.className = "chat_message_user";
        el_text.className = "chat_message_text";

        el_user.innerHTML = name;
        el_text.innerHTML = message;

        el.appendChild(el_user);
        el.appendChild(el_text);

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
    showChannelList(state) {
        this.show_channels = state;
        this.channel_list.style.display = state?"block":"none";

        localStorage.show_channels = state?"on":"off";

        this.layout();
    }
    showUserList(state) {
        this.show_users = state;
        this.user_list.style.display = state?"block":"none";

        localStorage.show_users = state?"on":"off";

        this.layout();
    }
    setChannelName(name) {
        let cname = document.querySelector('#app_channel');
        cname.innerHTML = name;
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
            case "user_join":
                this.userJoin(msg.data);
                break;
            case "user_leave":
                this.userLeave(msg.data);
                break;    
            case "channel_text":
                this.getTextMessage(msg.data);
                break;
            case "channel_name":
                this.ui.setChannelName(msg.data);
                break;
            case "channel_list": 
                this.channel_list = msg.data;
                this.ui.setChannelList(this.channel_list);
                break;
            case "account_token":
                this.setCredentials(msg.data.name, msg.data.token);
                this.ui.modalDialog("");
                this.authWithToken();
                break;
            case "auth_success":
                break;
            case "my_details":
                break;
            case "error_msg":
                alert(msg.data);
                break;
            case "channel_log":
                this.getLog(msg.data);
                break;
            case "auth_failed":
                this.setCredentials("", "");
                this.modalDialog("register");
                break;
            case "keep_alive":
                this.sendMessage('keep_alive', {});
                break;    
            default:
                break;
        }
    }
    chatMessage(message) {
        this.sendMessage('chat_message', message);
    }
    getTextMessage(message) {
        this.ui.addTextMessage(message);
    }
    getLog(log) {
        this.ui.clearMessages();
        for (let i=0; i<log.length; i++) {
            this.getTextMessage(log[i]);
        }
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
    getUserByID(id) {
        let idx = this.getTextMessage(id);
        if (idx != -1) {
            return this.users[i];
        }
        return null;
    }
    getUserIndex(id) {
        for (let i=0; i<this.users.length; i++) {
            if (this.users[i].id == id) {
                return i;
            }
        }
        return -1;
    }
    userJoin(user) {
        this.users.push(user);
        this.ui.setUserList(this.users);
    }
    userLeave(user) {
        let idx = this.getUserIndex(user.id);
        this.users.splice(idx, 1);
        this.ui.setUserList(this.users);
    }
    joinChannel(name) {
        this.sendMessage('join_channel', name);
    }
}

window.addEventListener('load', function() {
    var client = new Client(SERVER_ADDR);
});