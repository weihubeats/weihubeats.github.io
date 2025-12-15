## Sa token框架是什么

Sa-Token 是一个轻量级 Java 权限认证框架，主要解决：登录认证、权限认证、单点登录、OAuth2.0、分布式Session会话、微服务网关鉴权 等一系列权限相关问题。


## 表结构设计


- 用户表

```sql
CREATE TABLE sys_user (
    id            BIGINT AUTO_INCREMENT COMMENT '主键ID' PRIMARY KEY,
    username      VARCHAR(50)                        NOT NULL COMMENT '用户名',
    password      VARCHAR(100)                       NOT NULL COMMENT '密码(加密)',
    avatar        VARCHAR(255)                       NULL COMMENT '头像',
    sys_id        INT                                NULL COMMENT '所属系统/租户ID',
    status        TINYINT  DEFAULT 1                 NOT NULL COMMENT '状态 1:正常 2:禁用',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT uk_username UNIQUE (username)
) COMMENT '系统用户表';
```

- 角色表

```sql
create table sys_role
(
    id          bigint auto_increment
        primary key,
    role_type   varchar(12)                        not null comment '角色类型',
    role_name   varchar(40)                        not null comment '角色名称',
    create_time datetime default CURRENT_TIMESTAMP not null,
    update_time datetime default CURRENT_TIMESTAMP not null
)
```

- 用户-角色关联表

```sql
CREATE TABLE sys_user_role (
    id          BIGINT AUTO_INCREMENT COMMENT '主键ID' PRIMARY KEY,
    user_id     BIGINT NOT NULL COMMENT '用户ID',
    role_id     BIGINT NOT NULL COMMENT '角色ID',
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
) COMMENT '用户-角色关联表';
```

- 权限/菜单表

```sql
CREATE TABLE sys_privilege (
    id                     BIGINT AUTO_INCREMENT COMMENT '自增ID' PRIMARY KEY,
    privilege_code         VARCHAR(100)                       NULL COMMENT '权限标识Code (如: user:add)',
    privilege_name         VARCHAR(100)                       NOT NULL COMMENT '权限名称',
    privilege_type         INT                                NOT NULL COMMENT '类型，0:目录、10:菜单、20:tab页、30:按钮',
    path                   VARCHAR(100)                       NULL COMMENT '后端请求路径 (如: /api/user/add)',
    method                 VARCHAR(10)                        NULL COMMENT '请求方法 (GET/POST)',
    desensitization_labels VARCHAR(100)                       NULL COMMENT '数据脱敏标签',
    parent_id              BIGINT   DEFAULT 0                 NOT NULL COMMENT '父级ID',
    system_id              INT                                NULL COMMENT '归属系统ID',
    is_hidden              INT      DEFAULT 0                 NOT NULL COMMENT '是否隐藏',
    create_time            DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time            DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT uk_privilege_system UNIQUE (privilege_code, system_id)
) COMMENT '权限资源表';
```

- 角色权限表

```sql
create table sys_role_privilege
(
    id                     bigint auto_increment comment '自增ID'
        primary key,
    role_id                bigint                             not null comment '角色ID',
    privilege_code         varchar(100)                       not null comment '权限code',
    desensitization_labels varchar(100)                       null comment '脱敏标签',
    is_delete              tinyint  default 0                 not null comment '是否删除',
    create_time            datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time            datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint sys_admin_resource__index_user_resource
        unique (role_id, privilege_code)
)
    comment '角色-权限，对应关系表';
```

## 代码实现

### 依赖

```xml
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot-starter</artifactId>
    <version>1.37.0</version>
</dependency>
```

### 鉴权核心逻辑服务 (SysAdminSecurityService)

```java
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import jakarta.servlet.http.HttpServletRequest; // SpringBoot 3.x
import java.util.List;

@Slf4j
@Service
public class SysAdminSecurityService {

    // 假设注入了您的数据库Service
    // private final SysPrivilegeService privilegeService; 
    // private final SysUserService userService;

    /**
     * 拦截器入口方法
     */
    public void checkInterceptor(HttpServletRequest request, SystemID systemID) {
        String requestURI = request.getRequestURI();
        log.info("鉴权检查: URI={}, SystemID={}", requestURI, systemID);

        // 1. 检查是否登录
        checkLogin();

        // 2. 检查用户状态及系统归属 (SaaS检查)
        checkForbid(systemID);

        // 3. 检查URL对应的资源权限
        checkResource(requestURI, systemID);
        
        // 4. 其他检查 (如分页参数防注入等)
        // pageSizeParamsCheck(request); 
    }

    /**
     * 检查登录状态
     */
    public void checkLogin() {
        StpUtil.checkLogin();
    }

    /**
     * 检查账号状态（是否被封禁，是否属于当前SystemID）
     */
    public void checkForbid(SystemID systemID) {
        // 从Session获取当前用户信息
        SysUser user = (SysUser) StpUtil.getSession().get("user_info");
        
        if (user == null) {
             // 极端情况，Session丢失但Token还在
            throw new NotLoginException("用户信息丢失", StpUtil.getLoginType(), StpUtil.getTokenValue());
        }

        if (user.getStatus() != 1) { // 1为正常
            throw new RuntimeException("账号已被封禁");
        }

        // SaaS 租户隔离检查
        if (user.getSysId() == null || (systemID != null && !user.getSysId().equals(systemID.getValue()))) {
            throw new RuntimeException("非法访问：用户不属于当前系统");
        }
    }

    /**
     * 核心资源鉴权：URL -> Privilege Code -> User Permissions
     */
    public void checkResource(String requestURI, SystemID systemID) {
        // 超级管理员放行
        if (StpUtil.hasRole("SUPER_ADMIN")) return;

        // 1. 根据 URL 查询该路径需要的权限 Code 列表
        // 注意：这里需要查数据库 sys_privilege 表，找到 path = requestURI 的记录
        // 示例：/api/user/add -> 需要 "user:add" 权限
        List<String> requiredPermissions = queryPrivilegeCodesByPath(requestURI);

        log.info("请求路径: {}, 需要权限: {}", requestURI, requiredPermissions);

        if (CollectionUtils.isEmpty(requiredPermissions)) {
             // 如果URL在数据库没配置权限，策略：
             // A. 抛出资源未找到（严格模式）
             // B. 直接放行（宽松模式，公共接口）
             // 这里采用您的逻辑，抛出异常
            throw new RuntimeException("资源未配置或不存在: " + requestURI);
        }

        // 2. 检查忽略的权限
        if (requiredPermissions.contains("IGNORE_auth")) {
            return;
        }

        // 3. 校验用户是否拥有上述权限的其中之一
        // StpUtil.hasPermission 默认是 AND，这里我们需要自行判断 OR 逻辑
        boolean hasAuth = false;
        for (String perm : requiredPermissions) {
            if (StpUtil.hasPermission(perm)) {
                hasAuth = true;
                break;
            }
        }

        if (!hasAuth) {
            throw new NotPermissionException(String.join(",", requiredPermissions));
        }
        
        // 4. 处理脱敏字段 (ThreadLocal 存储，供 Controller/Serializer 使用)
        // loadDesensitizeFields(requiredPermissions);
    }
    
    // 模拟数据库查询方法
    private List<String> queryPrivilegeCodesByPath(String path) {
        // TODO: 实现 select privilege_code from sys_privilege where path = #{path}
        return List.of(); 
    }
}
```

### 拦截器实现 (SaSaasInterceptor)

```java
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.spring.SpringMVCUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SaSaasInterceptor implements HandlerInterceptor {

    @Autowired
    private SysAdminSecurityService sysAdminSecurityService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 处理 OPTIONS 请求 (跨域预检)
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 获取 Header 中的 SystemID
        String sysIdStr = request.getHeader("X-System-ID");
        SystemID systemID = (sysIdStr != null) ? new SystemID(Integer.parseInt(sysIdStr)) : null;

        // 执行鉴权逻辑
        try {
            sysAdminSecurityService.checkInterceptor(request, systemID);
            return true;
        } catch (Exception e) {
            // 可以在这里直接 response 输出 JSON，或者抛出异常由全局异常处理器捕获（推荐后者）
            throw e;
        }
    }
}
```

### 全局权限加载 (StpInterfaceImpl)

```java
import cn.dev33.satoken.stp.StpInterface;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * 自定义权限验证接口扩展
 */
@Component
public class StpInterfaceImpl implements StpInterface {

    /**
     * 返回一个账号所拥有的权限码集合 
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        // 1. 根据 userId (loginId) 查 sys_user_role 表拿到 role_id
        // 2. 根据 role_id 查 sys_role_privilege 表拿到 privilege_code
        // 3. 返回 List<String>
        return List.of("user:add", "user:update"); // 模拟数据
    }

    /**
     * 返回一个账号所拥有的角色标识集合
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        // 1. 根据 userId 查 sys_user_role
        // 2. 查 sys_role 表拿到 role_type 或 role_name
        return List.of("admin"); // 模拟数据
    }
}
```

### 拦截器配置 (WebMvcConfig)


```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    @Autowired
    private SaSaasInterceptor saSaasInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 路由拦截器
        registry.addInterceptor(saSaasInterceptor)
                .addPathPatterns("/**")
                // 排除不需要鉴权的接口（如登录、注册、静态资源）
                .excludePathPatterns("/v1/admin/login", "/favicon.ico", "/doc.html");
    }
}
```