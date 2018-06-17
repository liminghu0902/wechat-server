const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const heredoc = require('heredoc');
const api = require('../api');
const config = require('../config');
const replyConfig = require('../config/reply');
const menuConfig = require('../config/menu');
const wxDB = require('../model/wx');


class WX {

    constructor() {
        this.appID = config.wx.appID;
        this.appSecret = config.wx.appSecret;
        this.token = config.wx.token;
    }

    //获取access_token
    updateAccessToken(data) {
        const url = `${api.wx.getAccessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        return new Promise((resolve, reject) => {
            //调用微信接口获取access_token
            request(url, (err, res, body) => {
                body = JSON.parse(body);
                const newdata = {
                    access_token: body['access_token'],
                    expires_in: Date.now() + parseInt(body['expires_in'])*1000
                }
                //如果数据库存在access_token就更新，否则就插入数据库
                if(data && data.length && data[0].access_token) {
                    wxDB.updates([data[0], newdata], (err, result) => {
                        if(err) {
                            console.log(err);
                        }
                        console.log(`更新access_token成功!`);
                        resolve(data);
                    })
                } else {
                    wxDB.inserts([newdata], (err, result) => {
                        if(err) {
                            console.log(err);
                        }
                        console.log('插入access_token成功!');
                        resolve(result[0]);
                    })
                }
            })
        })
    }

    //验证access_token
    checkAccessToken() {
        const curTime = Date.now();
        return new Promise((resolve, reject) => {
            wxDB.finds({name: 'access_token'}, async (err, result) => {
                if(err) {
                    console.log(err);
                }
                if(!result.length || !result[0].expires_in || !result[0].access_token || curTime > result[0].expires_in ) {
                    const res = await this.updateAccessToken(result);
                    resolve(res);
                } else {
                    resolve(result[0]);
                }
            })
        })
    }

    //回复消息
    async reply(data) {
        if(!data) return 'success';
        //获取回复消息模板
        const template = require('./tmp.js');
        //判断是否是事件推送
        if(data.MsgType === 'event') {
            switch(data.Event) {
                //关注事件
                case 'subscribe':
                    //扫描带参数二维码事件
                    if(data.EventKey && data.EventKey.indexOf('qrscene_') !== -1) {
                        console.log('扫描带参数二维码事件');
                    }
                    const obj = replyConfig.event[data.Event];

                    if(obj && obj.toString() === '[object Object]' && JSON.stringify(obj) !== '{}') {

                        Object.keys(obj).forEach(key => data[key] = obj[key])
                    } else {
                        return 'success';
                    }
                    break;
                //取消关注事件
                case 'unsubscribe':
                    console.log('取消关注事件');
                    break;
                //上报地理位置事件
                case 'LOCATION':
                    console.log('上报地理位置事件');
                    break;
                //点击菜单拉取消息时的事件推送
                case 'CLICK':
                    console.log('点击菜单拉取消息时的事件推送');
                    data.MsgType = 'text';
                    data.Content = '您点击了菜单拉取消息';
                    break;
                //点击菜单跳转链接时的事件推送
                case 'VIEW':
                    console.log('点击菜单跳转链接时的事件推送');
                    data.MsgType = 'text';
                    data.Content = '您点击了菜单跳转链接';
                    break;
            }

        } else if(data.MsgType === 'text') {

            switch(data.Content) {
                case '1':
                    data.Content = '天下第一/:,@-D';
                    break;
                case '2':
                    const material = await this.addTemporaryMaterial('image', __dirname + '/../public/images/c.jpg');
                    data.MsgType = 'image';
                    try {
                        data.MediaId = JSON.parse(material).media_id;
                    } catch (error) {
                        return 'success';
                    }
                    break;
                default:
                    return 'success';
                    break;
            }
        }
        return ejs.render(template, data);
    }
    /**************************************** 菜单管理 *****************************************/
    //创建自定义菜单
    createMenus() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.menu.createMenus}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: menuConfig
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //删除所有菜单(包括自定义和个性化菜单)
    deleteMenus() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.menu.deleteMenus}?access_token=${res.access_token}`;
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取所有菜单(包括自定义和个性化菜单)
    getMenus() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.menu.getMenus}?access_token=${res.access_token}`;
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //创建个性化菜单
    createConditionalMenus() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.menu.createConditionalMenus}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: menuConfig
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //删除个性化菜单
    deleteConditionalMenus() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.menu.deleteConditionalMenus}?access_token=${res.access_token}`,
                    method: 'POST',
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    /**************************************** 素材管理 *****************************************/
    //新增临时素材
    addTemporaryMaterial(type, filePath) {
        const formData = {
            media: fs.createReadStream(filePath)
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.addTemporaryMaterial}?access_token=${res.access_token}&type=${type}`,
                    method: 'POST',
                    formData: formData
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //通过mediaId获取临时素材
    getTemporaryMaterial(mediaId) {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.material.getTemporaryMaterial}?access_token=${res.access_token}&media_id=${mediaId}`;
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
        
    }
    
    //新增永久图文素材
    addNewsMaterial(data) {
        // console.log(data)
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.addNewsMaterial}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //上传图文消息内的图片获取URL
    uploadNewsImgMaterial(filePath) {
        const formData = {
            media: fs.createReadStream(filePath)
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.uploadNewsImage}?access_token=${res.access_token}`,
                    method: 'POST',
                    formData: formData
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //新增除了图文之外的永久素材
    addMaterial(type, filePath, data) {
        const formData = {
            media: fs.createReadStream(filePath)
        };
        if(type === 'video' && data) {
            Object.assign(formData, {
                description: {
                    title: data.title,
                    introduction: data.introduction
                }
            });
        }
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.addMaterial}?access_token=${res.access_token}&type=${type}`,
                    method: 'POST',
                    formData: formData
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body)
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //通过mediaId获取永久素材
    getMaterial(mediaId) {
        const data = {
            media_id: mediaId
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.getMaterial}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //通过mediaId删除永久素材
    deleteMaterial(mediaId) {
        const data = {
            media_id: mediaId
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.deleteMaterial}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //修改永久图文素材
    updateNewsMaterial(data) {
        const _data = {
            media_id: data.media_id,
            index: data.index || 0,
            articles: {
                title: data.title,
                thumb_media_id: data.thumb_media_id,
                author: data.author,
                digest: data.digest,
                show_cover_pic: data.show_cover_pic || 1,
                content: data.content,
                content_source_url: data.content_source_url
            }
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.updateNewsMaterial}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取永久素材总数
    getMaterialCount() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.material.getMaterialCount}?access_token=${res.access_token}`;
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取永久素材列表
    getMaterialList(data) {
        const _data = {
            type: data.type,
            offset: data.offset || 0,
            count: data.count || 20
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.material.getMaterialList}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    /**************************************** 用户管理 *****************************************/
    //创建标签
    createTag(tagName) {
        const data = {
            tag: {
                name: tagName || ''
            }
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.createTag}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取标签
    getTags() {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.user.getTags}?access_token=${res.access_token}`;
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //编辑标签
    updateTag(data) {
        const _data = {
            tag: {
                id: data.id,
                name: data.name
            }
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.updateTag}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //删除标签
    deleteTag(tagId) {
        const _data = {
            tag: {
                id: tagId
            }
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.deleteTag}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取标签下的粉丝列表
    getUserByTag(tagId, openId) {
        const _data = {
            tagId: tagId,
            next_openid: openId || ""
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.getUserBytag}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }    

    //批量为用户打标签获取消标签
    handleTagWithUser(users, tagId, isPlay) {
        const _data = {
            openid_list: users,
            tagid: tagId
        };
        const url = isPlay ? api.wx.user.playTagWithUser : api.wx.user.delTagWithUser;
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${url}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取用户身上的标签列表
    getTagWithUser(openId) {
        const _data = {
            openid: openId
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.getTagWithUser}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //设置用户备注名
    setUserRemark(openId, remark) {
        const _data = {
            openid: openId,
            remark: remark
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.setUserRemark}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取用户基本信息
    getUserInfo(openid) {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.user.getUserInfo}?access_token=${res.access_token}&openid=${openid}&lang=zh_CN`
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //批量获取用户基本信息
    getUserInfos(data) {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.getUserInfos}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
        })
    }

    //获取用户列表
    getUsers(next_openid) {
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                const url = `${api.wx.user.getUsers}?access_token=${res.access_token}`
                            + (next_openid ? `&next_openid=${next_openid}` : '');
                request(url, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //获取公众号的黑名单列表
    getBlackUsers() {
        const _data = {
            begin_openid: ''
        };
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${api.wx.user.getBlackUsers}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }

    //拉黑用户
    handleBlackUsers(openIdList, isSetBlackUser) {
        const _data = {
            openid_list: openIdList || []
        };
        const url = isSetBlackUser ? api.wx.user.setBlackUsers : api.wx.user.delBlackUsers;
        return new Promise(resolve => {
            this.checkAccessToken()
            .then(res => {
                request({
                    url: `${url}?access_token=${res.access_token}`,
                    method: 'POST',
                    json: true,
                    body: _data
                }, (err, res, body) => {
                    if(err) throw err;
                    resolve(body);
                })
            })
            .catch(err => {
                throw err;
            })
        })
    }


}

module.exports = new WX();