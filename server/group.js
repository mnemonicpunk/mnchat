const GROUP_PATH = "./data/group/";
const ACCESS_LEVELS = {
    USER: 0,
    ADMIN: 10
}

var ServerObject = require('./server_object.js');

class Group extends ServerObject {
    constructor(name) {
        super(name, GROUP_PATH, 'group', {
            name: name,
            admins: [],
            members: []
        });
    }
    existsGroup(name) {
        return super.existsObject(name);
    }    
    getGroupNameFromString(text) {
        return super.toFilename(text);
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