const jwt = require('jsonwebtoken');
const fs = require('fs');

const secret = fs.readFileSync(__dirname +'/../id_rsa');

module.exports = {
    checkToken(req, res, next) {
        const token = req.body.token || req.query.token || req.get('Authorization');
        if(!token) {
            res.status(403).json({
                success: false,
                stateDesc: '没有token',
                data: null,
                token: null,
                timeStamp: Date.now()
            });
            return;
        };
        jwt.verify(token, secret, (err, decoded) => {
            if(err) {
                console.log(err)
                res.status(401).json({
                    success: false,
                    stateDesc: '无效的token',
                    data: null,
                    token: null,
                    timeStamp: Date.now()
                });
                return;
            };
            req.body.user = decoded;
            next();
        });
    }
}