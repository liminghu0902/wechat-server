const MAIN_PATH = 'https://api.weixin.qq.com/cgi-bin';

module.exports = {
    wx: {
        getAccessToken:                 MAIN_PATH + '/token?grant_type=client_credential',      //获取access_token
        menu: {
            createMenus:                MAIN_PATH + '/menu/create',                             //创建自定义菜单
            deleteMenus:                MAIN_PATH + '/menu/delete',                             //删除所有菜单
            getMenus:                   MAIN_PATH + '/menu/get',                                //获取所有菜单
            createConditionalMenus:     MAIN_PATH + '/menu/addconditional',                     //创建个性化菜单
            deleteConditionalMenus:     MAIN_PATH + '/menu/delconditional',                     //删除个性化菜单
        },  
        material: {
            addTemporaryMaterial:       MAIN_PATH + '/media/upload',                            //新增临时素材
            getTemporaryMaterial:       MAIN_PATH + '/media/get',                               //获取临时素材
            addNewsMaterial:            MAIN_PATH + '/media/add_news',                          //新增永久图文素材
            uploadNewsImage:            MAIN_PATH + '/media/uploadimg',                         //上传图文消息内的图片获取URL
            addMaterial:                MAIN_PATH + '/material/add_material',                   //上传除图文外的其他永久素材
            getMaterial:                MAIN_PATH + '/material/get_material',                   //获取永久素材
            deleteMaterial:             MAIN_PATH + '/material/del_material',                   //删除永久素材
            updateNewsMaterial:         MAIN_PATH + '/material/update_news',                    //修改永久图文素材
            getMaterialCount:           MAIN_PATH + '/material/get_materialcount',              //获取永久素材总数
            getMaterialList:            MAIN_PATH + '/material/batchget_material',              //获取永久素材列表
        },
        user: {
            createTag:                  MAIN_PATH + '/tags/create',                             //创建标签
            getTags:                    MAIN_PATH + '/tags/get',                                //获取标签
            updateTag:                  MAIN_PATH + '/tags/update',                             //编辑标签
            deleteTag:                  MAIN_PATH + '/tags/delete',                             //删除标签
            getUserBytag:               MAIN_PATH + '/user/tag/get',                            //获取标签下的用户列表
            playTagWithUser:            MAIN_PATH + '/tags/members/batchtagging',               //批量为用户打标签
            delTagWithUser:             MAIN_PATH + '/tags/members/batchuntagging',             //批量为用户取消标签
            getTagWithUser:             MAIN_PATH + '/tags/getidlist',                          //获取用户身上的标签列表
            setUserRemark:              MAIN_PATH + '/user/info/updateremark',                  //设置用户备注名
            getUserInfo:                MAIN_PATH + '/user/info',                               //获取用户基本信息
            getUserInfos:               MAIN_PATH + '/user/info/batchget',                      //批量获取用户信息
            getUsers:                   MAIN_PATH + '/user/get',                                //获取用户列表
            getBlackUsers:              MAIN_PATH + '/tags/members/getblacklist',               //获取公众号的黑名单列表
            setBlackUsers:              MAIN_PATH + '/tags/members/batchblacklist',             //拉黑用户
            delBlackUsers:              MAIN_PATH + '/tags/members/batchunblacklist',           //取消拉黑用户
        }
    }
}