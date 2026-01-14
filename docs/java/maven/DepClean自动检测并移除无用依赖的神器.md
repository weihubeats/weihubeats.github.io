## 背景

在 Java 开发中，随着项目的迭代，`pom.xml` 里的依赖往往会越堆越多。很多时候，我们引入了一个庞大的库，却只用到了其中一两个工具类

或者随着代码重构，某些曾经需要的依赖现在已经不再使用了，但它们依然躺在 `pom.xml` 里，甚至通过传递依赖（Transitive Dependencies）引入了更多无关的 Jar 包。

这种“依赖膨胀”会导致什么问题？

构建变慢：下载和解析依赖需要时间。

包体积过大：打出来的 Fat Jar 动辄几百 MB。

安全隐患：无用的依赖可能包含已知的安全漏洞（CVE），无端增加了攻击面。

类路径地狱：版本冲突的风险指数级上升。

今天给大家推荐一款由瑞典皇家理工学院（KTH）科研团队开源的工具——`DepClean`


## 什么是 DepClean？

`DepClean` 是一个 `Maven` 插件，它通过静态分析项目的字节码，自动检测并移除 pom.xml 中声明但未使用的依赖项。

与简单的“检查声明但未使用的依赖”不同，DepClean 更加深入和智能：

-  全方位检测：不仅能查出直接声明的无用依赖，还能搞定传递依赖和从父 POM 继承下来的无用依赖。

- 生成净化版 POM：它能自动生成一个名为 `pom-debloated.xml` 的文件，这是一个清理后的、干净的 POM 文件。

- 支持现代 Java：完全支持 `Java 21` 及以上版本的字节码分析。

- CI/CD 集成：可以配置为“发现无用依赖即构建失败”，强制保持代码洁癖

> DepClean 不会修改你的源代码或原始`pom.xml` 文件，只会生成一个新的纯粹的`pom-debloated.xml`

## 工作原理

`DepClean` 的工作原理非常硬核。它不会只看你 import 了什么，而是在 `Maven` 的 `package`阶段之前运行：

- 静态收集：它会扫描项目自身的所有类，以及所有依赖包里的类。

- 字节码分析：它分析你编译后的字节码，找出实际被引用的类成员。

- 对比与构建：它将实际使用的类与依赖树进行对比，标记出哪些 Jar 包完全没有被触碰过。

- 重构依赖树：它可以将“被使用的传递依赖”提升为“直接依赖”，并移除那些“未使用的直接/传递依赖”

## 使用

### 方式一：命令行直接运行

不需要修改任何代码，只需要在你的 Maven 项目根目录下运行以下命令

```shell
cd {PATH_TO_MAVEN_PROJECT}
mvn compile
mvn compiler:testCompile
mvn se.kth.castor:depclean-maven-plugin:2.2.0-SNAPSHOT:depclean
```

### 方式二：集成到 pom.xml（推荐）

如果你希望长期治理项目依赖，建议将其加入到 plugins 中：

```xml
<plugin>
  <groupId>se.kth.castor</groupId>
  <artifactId>depclean-maven-plugin</artifactId>
  <version>2.2.0-SNAPSHOT</version>
  <executions>
    <execution>
      <goals>
        <goal>depclean</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

### 效果

运行结束后，`DepClean` 会在控制台输出一份详细的报告，告诉你：

- Used direct dependencies（正在使用的直接依赖）

- Used transitive dependencies（正在使用的传递依赖）

- Potentially unused direct dependencies（声明了但没用的直接依赖 -> 重点关注！）

同时，它会在项目根目录生成一个 `pom-debloated.xml`

你可以对比一下原版 `pom.xml`，你会发现原本几十个依赖可能被精简到了十几个，且项目依然能正常编译运行！

此外，在 target 目录下还会生成可视化的 JSON 报告 `depclean-results.json`，方便进行二次分析

## 高级配置：守住代码质量的底线

DepClean 非常适合集成到 Jenkins 或 GitLab CI 中。你可以配置它在发现无用依赖时直接报错，防止开发人员随意引入 Jar 包

```xml
<configuration>
    <failIfUnusedDirect>true</failIfUnusedDirect>
    <ignoreScopes>provided,test</ignoreScopes>
    <ignoreDependencies>
        <ignoreDependency>com.example.legacy:.*</ignoreDependency>
    </ignoreDependencies>
</configuration>
```

## 注意事项

虽然 DepClean 非常强大，但基于静态分析的工具都有一个通病：反射（Reflection）。

如果你的项目中使用了大量的反射（例如 Class.forName("com.mysql.jdbc.Driver")），或者过度依赖 Spring 的自动装配机制，DepClean 可能会误判某些库是“无用”的

### 解决方案：

DepClean 已经内置了一些对 Spring 等框架的支持。

如果不放心，可以使用 `<ignoreDependencies>` 配置项，手动将核心框架包排除在清理名单之外。

永远在删除依赖后运行全量单元测试

## 总结
`DepClean` 是一款专注于“做减法”的工具。在微服务和云原生时代，保持应用的轻量化至关重要。如果你正在维护一个历史悠久的“屎山”项目，或者想优化 Docker 镜像的体积，不妨试试 DepClean

## 参考

- https://github.com/ASSERT-KTH/depclean
- https://link.springer.com/article/10.1007/s10664-020-09914-8