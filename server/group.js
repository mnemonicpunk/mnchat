const GROUP_PATH = "./data/group/";
const ACCESS_LEVELS = {
    USER: 0,
    ADMIN: 10
}

var fs = require('fs');

class Group {
    constructor(name) {
        let n = this.getGroupNameFromString(name);
        let fn = GROUP_PATH + n + ".group";

        this.data = {
            name: name,
            admins: [],
            members: []
        }
        if (this.existsGroup(name)) { 
            this.data = JSON.parse(fs.readFileSync(fn).toString('utf8'));
        }
    }
    save() {
        let n = this.getGroupNameFromString(this.data.name);
        let fn = GROUP_PATH + n + ".group";

        fs.writeFileSync(fn, JSON.stringify(this.data), { flag: 'w'});
    }   
    existsGroup(name) {
        let n = this.getGroupNameFromString(name);
        return fs.existsSync(GROUP_PATH + n + ".group");
    }    
    getGroupNameFromString(text) {
        let valid_characters = "abcdefghijklmnopqrstuvwxyz1234567890";
        let ctext = "";

        for (let i=0; i<text.length; i++) {
            let c = text[i].toLowerCase();
            for (let j = 0; j<valid_characters.length; j++) {
                if (c == valid_characters[j]) {
                    ctext += c;
                }
            }
        }

        return ctext;
    }
    getName() {
        return this.data.name;
    }
    getMembers() {
        return this.data.members;
    }
    isMember(user) {
        let name = user.account.getAccountName();
        for (let i=0; i<this.data.members.length; i++) {
            if (this.data.members[i] == name) {
                return true;
            }
        }
        return false;
    }
    addMember(name) {
        if (!(name in this.data.members)) {
            this.data.members.push(name);
        }
        this.save();
    }
    removeMember(name) {
        let idx = -1;
        for (let i=0; i<this.data.members.length; i++) {
            if (this.data.members[i] == name) {
                idx = i;
            }
        }
        this.data.members.splice(idx, 1);
        this.save();
    }
    getAdmins() {
        return this.data.admins;
    }
    isAdmin(user) {
        let name = user.account.getAccountName();
        for (let i=0; i<this.data.admins.length; i++) {
            if (this.data.admins[i] == name) {
                return true;
            }
        }
        return false;
    }
    addAdmin(name) {
        if (!(name in this.data.admins)) {
            this.data.admins.push(name);
        }
        this.save();
    }
    removeAdmin(name) {
        let idx = -1;
        for (let i=0; i<this.data.admins.length; i++) {
            if (this.data.admins[i] == name) {
                idx = i;
            }
        }
        this.data.admins.splice(idx, 1);
        this.save();
    }    
}

module.exports = Group;