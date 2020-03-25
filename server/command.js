class Command {
    constructor(user) {
        this.user = user;
    }
    parseCommand(command_string) {
        let segment = command_string.split(" ");
        let cmd = segment[0];
        switch(cmd) {
            case "/groups":
                this.cmdGroups();
                break;
            case "/users":
                this.cmdUsers();
                break;    
            case "/add_to_group":
                this.cmdAddToGroup(segment[1], segment[2]);
                break;
            case "/add_to_group_admins":
                this.cmdAddToGroupAdmin(segment[1], segment[2]);
                break;    
            case "/remove_from_group":
                this.cmdRemoveFromGroup(segment[1], segment[2]);
                break;    
            case "/remove_from_group_admins":
                this.cmdRemoveFromGroupAdmin(segment[1], segment[2]);
                break;        
            default:
                break;
        }
    }
    cmdGroups() {
        let user = this.user;
        let reply = "Die Gruppen auf diesem Server sind:<br>";
        for (let i=0; i<user.server.groups.length; i++) {
            reply += user.server.groups[i].getName() + "<br>";
        }
        user.receiveBotMessage(reply);
    }
    cmdUsers() {
        let user = this.user;
        let reply = "Auf diesem Server aktuell online sind:<br>Nanny (Bot)<br>";
        for (let i=0; i<user.server.users.length; i++) {
            reply += user.server.users[i].getName() + "<br>";
        }
        user.receiveBotMessage(reply);
    }
    cmdAddToGroup(account_name, group_name) {
        let user = this.user;
        let acc = account_name;
        let g = group_name;

        // sanity checks
        if (!user.server.existsAccount(acc)) { 
            user.receiveBotMessage('Der Account ' + acc + ' existiert nicht.');
            return; 
        }
        if (!user.server.existsGroup(g)) { 
            user.receiveBotMessage('Die Gruppe ' + g + ' existiert nicht.');
            return; 
        }

        // privilege checks
        let group = user.server.getGroup(g);
        if (!(group.isAdmin(user) || user.isAdmin())) { 
            user.receiveBotMessage('Du hast nicht die Berechtigung, jemanden zu ' + g + ' hinzuzufügen.');
            return; 
        }
        group.addMember(acc);
        user.receiveBotMessage('Erledigt.');
    }
    cmdAddToGroupAdmin(account_name, group_name) {
        let user = this.user;
        let acc = account_name;
        let g = group_name;

        // sanity checks
        if (!user.server.existsAccount(acc)) { 
            user.receiveBotMessage('Der Account ' + acc + ' existiert nicht.');
            return; 
        }
        if (!user.server.existsGroup(g)) { 
            user.receiveBotMessage('Die Gruppe ' + g + ' existiert nicht.');
            return; 
        }

        // privilege checks
        let group = user.server.getGroup(g);
        if (!(group.isAdmin(user) || user.isAdmin())) { 
            user.receiveBotMessage('Du hast nicht die Berechtigung, jemanden bei ' + g + ' als Admin zu setzen.');
            return; 
        }
        group.addAdmin(acc);
        user.receiveBotMessage('Erledigt.');
    }
    cmdRemoveFromGroup(account_name, group_name) {
        let user = this.user;
        let acc = account_name;
        let g = group_name;

        // sanity checks
        if (!user.server.existsAccount(acc)) { 
            user.receiveBotMessage('Der Account ' + acc + ' existiert nicht.');
            return; 
        }
        if (!user.server.existsGroup(g)) { 
            user.receiveBotMessage('Die Gruppe ' + g + ' existiert nicht.');
            return; 
        }

        // privilege checks
        let group = user.server.getGroup(g);
        if (!(group.isAdmin(user) || user.isAdmin())) { 
            user.receiveBotMessage('Du hast nicht die Berechtigung, jemanden aus ' + g + ' zu entfernen.');
            return; 
        }
        group.removeMember(acc);
        user.receiveBotMessage('Erledigt.');
    }
    cmdRemoveFromGroupAdmin(account_name, group_name) {
        let user = this.user;
        let acc = account_name;
        let g = group_name;

        // sanity checks
        if (!user.server.existsAccount(acc)) { 
            user.receiveBotMessage('Der Account ' + acc + ' existiert nicht.');
            return; 
        }
        if (!user.server.existsGroup(g)) { 
            user.receiveBotMessage('Die Gruppe ' + g + ' existiert nicht.');
            return; 
        }

        // privilege checks
        let group = user.server.getGroup(g);
        if (!(group.isAdmin(user) || user.isAdmin())) { 
            user.receiveBotMessage('Du hast nicht die Berechtigung, jemanden bei ' + g + ' als Admin zu entfernen.');
            return; 
        }
        group.removeAdmin(acc);
        user.receiveBotMessage('Erledigt.');
    }     
}

module.exports = Command;