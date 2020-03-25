var fs = require('fs');

class ServerObject {
    constructor(name, path, extension, default_object) {
        this.name = name;
        this.path = path;
        this.extension = extension;
        this.data = default_object;

        this.load(this.name);
    }
    existsObject(name) {
        return fs.existsSync(this.toFullpath(name));
    }
    load(name) {
        let fn = this.toFullpath(name);
        if (this.existsObject(name)) { 
            this.data = JSON.parse(fs.readFileSync(fn).toString('utf8'));
        }
    }
    save() {
        let fn = this.toFullpath(this.name);
        fs.writeFileSync(fn, JSON.stringify(this.data), { flag: 'w'});
    }    
    toFullpath(name) {
        let n = this.toFilename(name);
        let fn = this.path + n + "." + this.extension;
        return fn;
    }
    toFilename(text) {
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
}

module.exports = ServerObject;