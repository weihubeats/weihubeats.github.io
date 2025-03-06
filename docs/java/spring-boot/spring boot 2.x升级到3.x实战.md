## 背景

最近有一些项目想升级升级项目的`spring boot`到3.x相关的版本，所以我这边的公共`sdk`项目需要进行`spring boot` 3.x相关的支持，所以打算踩坑试试


## 升级

`spring boot`官方有一份升级文档，升级前可以大致过一遍[Spring-Boot-3.0-Migration-Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)

### jdk升级
都知道`spring boot` 3.x需要的最低版本是`jdk17`，所以首先修改jdk版本

1. 修改maven jdk compile配置

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.10.1</version>
    <configuration>
        <source>17</source>
        <target>17</target>
    </configuration>
</plugin>
```
 `source`和`target`都改成`17`
 

2. 修改properties中maven jdk版本

```xml
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
```

### spring boot依赖升级

这里直接修改`dependencyManagement`中的版本控制

```xml
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>3.4.1</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
```


### 启动

升级完成后直接启动看报错，然后根据报错信息一个一个解决

### javax.servlet:javax.servlet-api迁移

启动直接编译报错

`javax.servlet:javax.servlet-api`相关的依赖全部迁移到`jakarta.servlet:jakarta.servlet-api`

所以一些类需要修改包路径，全局替换即可。这里列举我遇到的一些类

- `import javax.servlet.http.HttpServletRequest;` -> `import jakarta.servlet.http.HttpServletRequest;`
- `import javax.servlet.http.HttpServletResponse;` -> `import jakarta.servlet.http.HttpServletResponse;`
- `import javax.servlet.http.HttpSession;` -> `import jakarta.servlet.http.HttpSession;`
- `import javax.servlet.http.Cookie;` -> `import jakarta.servlet.http.Cookie;`
- `import javax.annotation.PostConstruct;` -> `import jakarta.annotation.PostConstruct;`

### LocalVariableTableParameterNameDiscoverer删除

Spring Framework 6 和 Spring Boot 3.0 对字节码解析和参数名称发现机制进行了重构。为了替代 LocalVariableTableParameterNameDiscoverer，可以使用 DefaultParameterNameDiscoverer，它结合了多种参数名称发现策略（如 ASM、Kotlin 反射等）

所以使用`LocalVariableTableParameterNameDiscoverer`的地方需要替换成`DefaultParameterNameDiscoverer`

### java.lang.NoClassDefFoundError: com/google/gson/Strictness

遇到这个问题手动添加`gson`依赖即可解决问题，这个问题是使用`spring boot` 3.6.0遇到的问题

```xml
            <dependency>
                <groupId>com.google.code.gson</groupId>
                <artifactId>gson</artifactId>
                <version>2.11.0</version>
            </dependency>
```

参考
- https://github.com/spring-projects/spring-boot/issues/43442
- https://github.com/AxonFramework/extension-spring-aot/pull/206

### mybatis plus升级

mybatis plus spring boot 3.x的依赖`artifactId`也变了，所以最好全局替换一下

`mybatis-plus-boot-starter`替换为`mybatis-plus-spring-boot3-starter`

完整坐标

```xml
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>3.5.9</version>
        </dependency>
```

`mybatis plus` 3.x不支持 `dao.list(null)`，编译会报错，也需要修改成`dao.list()`

### 手动引入依赖mybatis-spring-boot-autoconfigure

注意`mybaits plus`没有自动引入`mybatis-spring-boot-autoconfigure`依赖没如果不手动引入会报错

```java
java.lang.IllegalArgumentException: Could not find class [org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration]
        at org.springframework.util.ClassUtils.resolveClassName(ClassUtils.java:341) ~[spring-core-6.0.21.jar:6.0.21]
```


```xml
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-autoconfigure</artifactId>
                <version>3.0.4</version>
            </dependency>
```


### pagehelper 不支持3.x版本需要排除掉pagehelper中mybatis相关依赖

如果使用了`pagehelper`分页插件，先手动排查掉`pagehelper`中的`mybatis`相关依赖

相关讨论参考[issues](https://github.com/pagehelper/pagehelper-spring-boot/issues/172):https://github.com/pagehelper/pagehelper-spring-boot/issues/172

```xml
            <dependency>
                <groupId>com.github.pagehelper</groupId>
                <artifactId>pagehelper-spring-boot-starter</artifactId>
                <version>2.1.0</version>
                <exclusions>
                    <exclusion>
                        <groupId>org.mybatis</groupId>
                        <artifactId>mybatis</artifactId>
                    </exclusion>
                    <exclusion>
                        <groupId>org.mybatis</groupId>
                        <artifactId>mybatis-spring</artifactId>
                    </exclusion>
                    <exclusion>
                        <groupId>org.mybatis.spring.boot</groupId>
                        <artifactId>mybatis-spring-boot-starter</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>
```

### bean注入异常

`spring boot` 3.x删除了原先`src/main/resources/META-INF/spring.factories`自动装配方式，改成了`src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`自动装配方式

所以如果使用了`spring.factories`自动装配方式，需要改成`AutoConfiguration.imports`方式

比如原先是这样
- `src/main/resources/META-INF/spring.factories`

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.nebula.web.boot.error.NebulaRestExceptionHandler,\
  com.nebula.web.boot.config.BaseWebMvcConfig
```

修改后很简单
- `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
```
com.nebula.web.boot.error.NebulaRestExceptionHandler
com.nebula.web.boot.config.BaseWebMvcConfig
```

### spring cloud 版本升级适配
如果使用了`spring cloud`,`spring cloud`相关版本也要进行升级适配`spring boot`版本，这里给一个官方推荐的版本

![spring-cloud-dependencies.png](./images/spring-cloud-dependencies.png)

我这里直接升级到`spring cloud` 2024.0.0版本

```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2024.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
```


## 总结

总的来说升级起来还是有一些小坑，一些冷门维护不频繁的三方sdk可能暂不支持`spring boot` `3.x`,需要自己考虑如何绕开或者手动二开

其他的主要还是对一些三方sdk做适配性升级，比如`mybatis plus`等

## 参考

- [Spring-Boot-3.0-Migration-Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- [pagehelper](https://github.com/pagehelper/pagehelper-spring-boot/issues/172):https://github.com/pagehelper/pagehelper-spring-boot/issues/172
- https://github.com/spring-projects/spring-boot/issues/43442
- https://github.com/AxonFramework/extension-spring-aot/pull/206
- https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
- https://github.com/baomidou/mybatis-plus/issues/5747
- https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
- https://spring.io/projects/spring-cloud#overview

