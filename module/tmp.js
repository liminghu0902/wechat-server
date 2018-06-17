//消息回复模板

module.exports = `<xml>
                    <ToUserName><![CDATA[<%= ToUserName %>]]></ToUserName>
                    <FromUserName><![CDATA[<%= FromUserName %>]]></FromUserName>
                    <CreateTime><%= Date.now() %></CreateTime>
                    <MsgType><![CDATA[<%= MsgType %>]]></MsgType>
                    <% if(MsgType === 'text') { %>
                        <Content><![CDATA[<%= Content %>]]></Content>
                    <% } else if(MsgType === 'image') { %>
                        <Image><MediaId><![CDATA[<%= MediaId %>]]></MediaId></Image>
                    <% } else if(MsgType === 'voice') { %>
                        <Voice><MediaId><![CDATA[<%= MediaId %>]]></MediaId></Voice>
                    <% } else if(MsgType === 'video') { %>
                        <Video>
                            <MediaId><![CDATA[<%= MediaId %>]]></MediaId>
                            <Title><![CDATA[<%= Title %>]]></Title>
                            <Description><![CDATA[<%= Description %>]]></Description>
                        </Video>
                    <% } else if(MsgType === 'music') { %>
                        <Music>
                            <Title><![CDATA[<%= Title %>]]></Title>
                            <Description><![CDATA[<%= Description %>]]></Description>
                            <MusicUrl><![CDATA[<%= MusicUrl %>]]></MusicUrl>
                            <HQMusicUrl><![CDATA[<%= HQMusicUrl %>]]></HQMusicUrl>
                            <ThumbMediaId><![CDATA[<%= ThumbMediaId %>]]></ThumbMediaId>
                        </Music>
                    <% } else if(MsgType === 'news') { %>
                        <ArticleCount><%= Articles.length %></ArticleCount>
                        <Articles>
                            <% Articles.forEach(function(item) { %>
                                <item>
                                    <Title><![CDATA[<%= item.Title %>]]></Title>
                                    <Description><![CDATA[<%= item.Description %>]]></Description>
                                    <PicUrl><![CDATA[<%= item.PicUrl %>]]></PicUrl>
                                    <Url><![CDATA[<%= item.Url %>]]></Url>
                                </item>
                            <% }) %>    
                        </Articles>
                    <% } %>
                </xml>`;