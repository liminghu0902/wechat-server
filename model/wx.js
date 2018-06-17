const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wx');
const db = mongoose.connection;

db.on('error', function() {
    console.log('wx数据库连接失败!')
})

db.on('open', function() {
    console.log('wx数据库连接成功!')
})

const wxSchema = new mongoose.Schema({
    access_token: String,
    expires_in: {
        type: Number,
        default: Date.now() + 7200 * 1000
    },
    name: {
        type: String,
        default: 'access_token'
    }
})

wxSchema.statics.finds = function(data, cb) {
    this.model('wx').find(data, cb);
}

wxSchema.statics.inserts = function(data, cb) {
    this.model('wx').insertMany(data, cb);
}

wxSchema.statics.updates = function(data, cb) {
    this.model('wx').update(...data, cb);
}

wxSchema.static.removes = function(data, cb) {
    this.model('wx').remove(data, cb);
}


const wx = mongoose.model('wx', wxSchema, 'base');

module.exports = wx;