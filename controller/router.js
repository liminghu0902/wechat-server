const WX = require('../module/wx');
const config = require('../config');
const sha1 = require('sha1');

//接入微信，判断请求是否来自微信
exports.checkWx = function(req, res, next) {
    const query = req.query;
    const token = config.wx.token;
    const {signature, echostr, timestamp, nonce} = query;
    const str = [token, timestamp, nonce].sort().join('');
    const str_sha1 = sha1(str);
    if(str_sha1 === signature) {
        res.send(echostr);
    } else {
        res.send('not from wechat');
    }
}

