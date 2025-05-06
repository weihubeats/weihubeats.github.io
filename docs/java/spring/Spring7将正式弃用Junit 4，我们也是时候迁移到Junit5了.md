## 背景

就在最近`Spring Framework` 官方宣布准备废弃`Junit4`


## 原因

`Junit4`已经不在活跃维护，上一个维护版本还是2021年2月的`JUnit 4.13.2`版本

- [JUnit 4.13.2](https://github.com/junit-team/junit4/releases/tag/r4.13.2)

并且`Junit4`最低支持jdk版本为1.5


早在2017年Spring Framework 5.0 官方就引入了对`JUnit Jupiter` （JUnit 5） 的支持

`JUnit Jupiter` 最初于 2017 年 9 月与 `JUnit 5.0` 一起发布


`JUnit Jupiter`以`java8`为最低版本


`JUnit Jupiter`现在是长期活跃维护的项目。

上一个维护版本是2025年4月11号


此外JUnit团队计划今年晚点发布以`Java 17`为最低版本的 `JUnit 6.0`

> https://github.com/junit-team/junit5/issues/4246


鉴于这些情况，`Spring Framework` 打算淘汰对` JUnit 4`的支持

打算在`Spring Framework` 7.0 中弃用它，在 7.1 或 7.2 中 "删除 "它

## 项目注意事项

随着`Spring Framework`不再支持`JUnit4`，我们最好也进行`JUnit4`的迁移，不要再使用`JUnit4`相关的API进行测试编写


测试尽量使用`org.junit.jupiter`相关的API

不要使用`Junit4`中`org.junit`相关的API

个人项目中的单测迁移主要是一些断言的迁移比如早期`Junit4`使用的是

```java
        Assert.assertEquals("numbers " + 1 + " and " + 2 + " are not equal", 1, 2);

```

`Junit5`可能就变成了`Assertions`

```java
        Assertions.assertEquals(1, 2, () -> "numbers " + 1 + " and " + 2 + " are not equal");

```




想要从`Junit4`迁移到`Junit 5`的详细文档可以参考[Migrating From JUnit 4 to JUnit 5: A Definitive Guide
](https://www.arhohuttunen.com/junit-5-migration/): https://www.arhohuttunen.com/junit-5-migration/



## 总结



随着`Spring Framework`对`Junit4`的废弃，以及`Junit4`不再活跃维护。

我们个人项目以后编写单测也不推荐再使用`Junit4`。如果项目中还有使用`Junit4`，推荐也随`Spring Framework`一起废弃掉`Junit4`

## 参考
- https://www.arhohuttunen.com/junit-5-migration/
- https://github.com/junit-team/junit5/issues/4246
- https://github.com/junit-team/junit4/blob/HEAD/doc/ReleaseNotes4.13.2.md
- https://github.com/spring-projects/spring-framework/issues/34794