
## 工程结构建议

建议将项目拆分为三个核心部分：

- `user-api` (通用 API 包)：存放 DTO、Enum、Exception 和 Base Interface


- `user-service` (服务提供者)：引入 `user-api`，Controller 实现 Base Interface



```java
// user-api 模块
@RequestMapping("/v1/users")
public interface UserServiceApi {

    @GetMapping("/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @PostMapping
    UserDTO createUser(@RequestBody UserDTO userDTO);
}
```


```java
// user-service 模块
@RestController
public class UserController implements UserServiceApi {

    @Override
    public UserDTO getUserById(Long id) {
        // 业务逻辑...
        return new UserDTO(id, "小奏技术");
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        // 业务逻辑...
        return userDTO;
    }
}
```

```java
// order-service 模块 (消费者)
@FeignClient(name = "user-service", path = "/v1/users", contextId = "userFeignClient")
public interface UserFeignClient extends UserServiceApi {
    // 这里什么都不用写，直接继承父接口的方法和注解
}
```