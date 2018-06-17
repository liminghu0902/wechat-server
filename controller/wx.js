const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const wx = require('../module/wx');

router.post('/', async function(req, res) {
    const data = req.body.xml;
    res.status(200);
    res.set('Content-Type', 'application/xml');
    const msg = await wx.reply(Object.assign(data, {
        ToUserName: data.FromUserName,
        FromUserName: data.ToUserName
    }));
    res.send(msg);
})

router.use(middleware.checkToken);

//获取用户列表
router.get('/api/wx/user/get', function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 10;
    wx.getUsers()
    .then(response => {
        const openids = JSON.parse(response).data.openid;
        if(openids && openids[(page-1)*count]) {
            return openids.splice((page-1)*count, page*count);
        }
        return [];
    })
    .then(openids => {
        let user_list = [];
        openids.forEach(openid => {
            user_list.push({
                openid: openid,
                lang: 'zh_CN'
            })
        });
        wx.getUserInfos({user_list: user_list})
        .then(response => {
            res.json({
                success: true,
                stateDesc: '',
                data: response,
                timeStamp: Date.now()
            });
        }, err => {
            console.log(err);
            res.json({
                success: false,
                stateDesc: `获取用户信息失败`,
                data: null,
                timeStamp: Date.now()
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.json({
            success: false,
            stateDesc: '获取用户列表失败',
            data: null,
            timeStamp: Date.now()
        })
    })
})

module.exports = router;