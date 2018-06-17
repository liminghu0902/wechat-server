const mongoose = require('mongoose');
const config = require('../config');
const db = mongoose.connection;

mongoose.connect(`mongodb://${config.db.loc}/user`);

db.on('open', function() {
    console.log('user数据库连接成功!')
})

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.statics.finds = function(data, cb) {
    this.model('user').find(data, cb);
}

userSchema.statics.inserts = function(data, cb) {
    this.model('user').insertMany(data, cb);
}

userSchema.statics.updates = function(data, cb) {
    this.model('user').update(...data, cb);
}

userSchema.static.removes = function(data, cb) {
    this.model('user').remove(data, cb);
}

const user = mongoose.model('user', userSchema, 'base');

module.exports = user;