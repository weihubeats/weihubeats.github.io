## 背景

在接口开发中我们还是要有一个接口规范，不然设计接口就会各种乱七八糟的接口

比如


```java
@RestController
@RequestMapping("/order/v1")
public class UserAdminNewController {

    @DeleteMapping("/deleteOrder")
    public ActionEnum deleteOrder(Long id) {
    }
}
```

```java
@RestController
@RequestMapping("/order/v1")
public class UserAdminNewController {

    @DeleteMapping("/delete-order")
    public ActionEnum deleteOrder(Long id) {
    }
}
```

```java
@RestController
@RequestMapping("/v1/order")
public class UserAdminNewController {

    @DeleteMapping("/delete-order")
    public ActionEnum deleteOrder(Long id) {
    }
}
```

```java
@RestController
@RequestMapping("/order/v1")
public class UserAdminNewController {

    @DeleteMapping("")
    public ActionEnum deleteOrder(Long id) {
    }
}
```

```java
@RestController
@RequestMapping("order/v1")
public class UserAdminNewController {

    @DeleteMapping("/{id}")
    public ActionEnum deleteOrder(@PathVariable Long id) {
    }
}
```



可以风格乱七八糟

不管什么东西，混乱就意味着难以维护和管理，所以我们非常有必要遵循某种风格，来统一我们的接口设计

而风格，最好是大家都认可的风格，而API设计`RESTful API`就是一种互联网应用中很成熟的API设计，我们基于`RESTful API`设计规范出一份属于我们自己的`API`规范


## 规范

首先我们服务都会有一个统一的对外域名，比如网关，假设这里我们的对外网关服务域名为

```
www.xiaozou.apisix/
```

### URL结构规范

```
/appName/{version}/{resources}/{resourceId}/{subResources}/{subResourceId}
```

- appName 服务名，比如订单服务就是`order`
- version 代表版本号 比如`v1`
- resources 代表资源，资源命名的风格应该遵循如下风格
    - 使用名词复数形式表示资源集合 比如使用`orders`而不是`order`
    - 使用小写字母、连字符（-）分隔多个单词
    - 资源路径应具有层次结构


### HTTP动词

GET（SELECT）：从服务器取出资源（一项或多项）。
POST（CREATE）：在服务器新建一个资源。
PUT（UPDATE）：在服务器更新资源（客户端提供改变后的完整资源）。
PATCH（UPDATE）：在服务器更新资源（客户端提供改变的属性）。
DELETE（DELETE）：从服务器删除资源。

## 具体演示


```java
@RestController
@RequestMapping("/user/v1/users")
public class UserController {

    // 分页获取用户
    @GetMapping("/paged")
    public Page<UserVO> getUsers(){

    }

    // 获取单个用户
    @GetMapping("/{id}")
    public UserVO getUserById(@PathVariable Long id) {

    }

    // 创建用户
    @PostMapping
    public ActionEnum createUser(@Valid @RequestBody UserCreateDTO userDTO) {

    }

    // 更新用户
    @PutMapping("/{id}")
    public ActionEnum updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserUpdateDTO userDTO) {
    }

    // 删除用户
    @DeleteMapping("/{id}")
    public ActionEnum deleteUser(@PathVariable Long id) {

    }
    
}

```