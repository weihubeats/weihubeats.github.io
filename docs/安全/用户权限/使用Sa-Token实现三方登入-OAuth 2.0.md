## 添加依赖

```xml
<!-- Sa-Token 权限认证 -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot-starter</artifactId>
    <version>1.37.0</version>
</dependency>

<!-- Sa-Token 整合 OAuth2.0 -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-oauth2</artifactId>
    <version>1.37.0</version>
</dependency>
```


## 配置 OAuth2.0 客户端信息

```yaml
sa-token:
  # OAuth2.0 配置
  oauth2: 
    is-http: false    # 是否开启 http 校验（本地环境可开启true，生产环境必须false）
    client:
      wechat:  # 微信登录配置
        client-id: ${wechat.client-id}       # 应用ID
        client-secret: ${wechat.client-secret} # 应用密钥
        authorization-url: https://open.weixin.qq.com/connect/oauth2/authorize  # 授权地址
        access-token-url: https://api.weixin.qq.com/sns/oauth2/access_token     # 取令牌地址
        user-info-url: https://api.weixin.qq.com/sns/userinfo                   # 取用户信息地址
        redirect-uri: http://你的域名/oauth/wechat/callback  # 回调地址
```

## 编写接口

```java
@RestController
public class OAuth2Controller {

    // 第一步：生成微信登录授权地址，并跳转
    @RequestMapping("/oauth/wechat/login")
    public SaResult wechatLogin() {
        // 直接使用 SaOAuth2Handle 来简化流程
        return SaOAuth2Handle.provider("wechat").doLogin();
        
        // 或者手动构建授权URL（更灵活）
        // String authUrl = SaOAuth2Handle.provider("wechat").getAuthorizeUrl();
        // return SaResult.data(authUrl);
    }

    // 第二步：处理微信回调
    @RequestMapping("/oauth/wechat/callback")
    public SaResult wechatCallback(String code, String state) {
        try {
            // 1. 通过 code 获取 access_token
            String accessToken = SaOAuth2Handle.provider("wechat").getAccessToken(code);
            
            // 2. 使用 access_token 获取用户信息
            SaOAuth2User user = SaOAuth2Handle.provider("wechat").getUserInfo(accessToken);
            
            // 3. 处理用户信息（核心业务逻辑）
            return handleOAuth2User(user);
            
        } catch (SaOAuth2Exception e) {
            return SaResult.error("第三方登录失败: " + e.getMessage());
        }
    }

    /**
     * 处理第三方登录成功的用户信息
     */
    private SaResult handleOAuth2User(SaOAuth2User user) {
        // 用户的唯一标识（微信是openid）
        String openId = user.getUserId();
        String nickname = user.getNickname();
        String avatar = user.getAvatar();
        
        // ========== 核心业务逻辑开始 ==========
        // 1. 查询本地数据库中是否已存在该微信用户
        User localUser = userService.findByWechatOpenId(openId);
        
        if (localUser == null) {
            // 2. 如果不存在，自动注册新用户
            localUser = new User();
            localUser.setWechatOpenId(openId);
            localUser.setNickname(nickname);
            localUser.setAvatar(avatar);
            localUser.setCreateTime(new Date());
            userService.save(localUser);
        } else {
            // 3. 如果已存在，更新用户信息（可选）
            localUser.setNickname(nickname);
            localUser.setAvatar(avatar);
            localUser.setLastLoginTime(new Date());
            userService.updateById(localUser);
        }
        
        // 4. 在 Sa-Token 中登录这个用户
        StpUtil.login(localUser.getId());
        
        // 5. 返回登录成功信息和 token
        return SaResult.data(StpUtil.getTokenInfo());
        // ========== 核心业务逻辑结束 ==========
    }
}
```