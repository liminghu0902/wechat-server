const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const sha1 = require('sha1');
const formidable = require('formidable');
const userDB = require('../model/user');

const secret = fs.readFileSync(__dirname +'/../id_rsa');

router.post('/api/login', function(req, res) {
    const data = {
        username: req.body.username,
        password: sha1(req.body.password)
    };
    let stateDesc = '';
    let success = true;
    userDB.finds({username: data.username}, function(err, result) {
        if(err) {
            console.log(err)
        }
        if(!result.length) {
            success = false;
            stateDesc = '用户名不存在';
        };
        if(result.length && result[0].password !== data.password) {
            success = false;
            stateDesc = '密码错误';
        };
        const token = jwt.sign({
            username: data.username,
            password: data.password,
            exp: Math.floor(Date.now()/1000) + 60 * 60 * 24
        }, secret);
        res.json({
            success: success,
            stateDesc: stateDesc,
            data: result[0],
            token: token,
            timeStamp: Date.now()
        });
    })
})

module.exports = router;