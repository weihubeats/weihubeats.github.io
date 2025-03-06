## 背景

在`spring boot` 2.x我们都知道`spring boot`中想要获取参数名称的解析方式主要有如下几种


参数名|解析方式|特点
:---:|:---:|:---:|
`LocalVariableTableParameterNameDiscoverer`|解析字节码中的局部变量表|不依赖 -parameters，但受编译器优化影响，JDK 9+ 可能失效
`StandardReflectionParameterNameDiscoverer`|基于 -parameters 编译选项|性能好，推荐使用，但需要启用 -parameters 编译选项
`DefaultParameterNameDiscoverer`|优先使用`StandardReflectionParameterNameDiscoverer`，如果失败则使用`LocalVariableTableParameterNameDiscoverer`|默认解析器，优先使用 StandardReflection，失败时回退到字节码解析
`KotlinReflectionParameterNameDiscoverer`|基于 Kotlin 反射 API|Kotlin 项目推荐使用，但不支持 Java 项目
PrioritizedParameterNameDiscoverer|支持多个解析器的优先级组合|灵活性强，适用于自定义解析逻辑。

用的比较多的还是`DefaultParameterNameDiscoverer`和`LocalVariableTableParameterNameDiscoverer`

因为很多人和很多项目都不知道`-parameters`这个编译选项，也不知道如何开启，所以很多项目都是使用`LocalVariableTableParameterNameDiscoverer`来解析参数名称

## 废弃LocalVariableTableParameterNameDiscoverer的前奏

如果我们升级到`spring boot` 3.0相关的版本，我们如果继续使用`LocalVariableTableParameterNameDiscoverer`来解析参数名称，会发现如下的警告

```java
22-11-30 17:39:11.513 WARN [main LocalVariableTableParameterNameDiscoverer.inspectClass:123]Using deprecated '-debug' fallback for parameter name resolution. Compile the affected code with '-parameters' instead or avoid its introspection: org.jasypt.spring31.properties.EncryptablePropertyPlaceholderConfigurer
```

这个警告就是未来会废弃掉基于字节码进行参数名解析，即`LocalVariableTableParameterNameDiscoverer`类，目前是一个过渡版本，还没有删除`LocalVariableTableParameterNameDiscoverer`

如果使用了`LocalVariableTableParameterNameDiscoverer`进行参数名解析需要修改为基于`-parameters`编译选项解析,因为之后的版本会删除`LocalVariableTableParameterNameDiscoverer`


## 何时废弃LocalVariableTableParameterNameDiscoverer

经过[spring-framework-issues-29559](https://github.com/spring-projects/spring-framework/issues/29559)和[spring-framework-pr-29531](https://github.com/spring-projects/spring-framework/pull/29531)的讨论

最终在`spring-framework`-`6.1.0`完全删除掉`LocalVariableTableParameterNameDiscoverer`

## 为什么废弃LocalVariableTableParameterNameDiscoverer

其实早在[issues-29559](https://github.com/spring-projects/spring-framework/issues/29559)就进行过讨论为什么要废弃`LocalVariableTableParameterNameDiscoverer`

主要原因还是因为`LocalVariableTableParameterNameDiscoverer`是因为其依赖字节码实现细节，存在兼容性问题，编译成`Native Image`运行在GraalVM上不起作用

## 如何替换LocalVariableTableParameterNameDiscoverer

由于`LocalVariableTableParameterNameDiscoverer`被删除，所以我们需要使用`StandardReflectionParameterNameDiscoverer`来替换`LocalVariableTableParameterNameDiscoverer`进行参数名解析

`StandardReflectionParameterNameDiscoverer`是基于`-parameters`编译选项的，所以我们需要在`maven`打包工具中添加`-parameters`编译选项

```xml
<build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <compilerArgs>
                        <arg>-parameters</arg>
                    </compilerArgs>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

核心配置是
```xml
                <configuration>
                    <compilerArgs>
                        <arg>-parameters</arg>
                    </compilerArgs>
```

## 如何验证是否生效

验证方式很简单，可以写一个简单的demo进行验证

```java
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

public class ParameterExample {

    public void exampleMethod(String param1, int param2) {
    }

    public static void main(String[] args) {
        Method method = ParameterExample.class.getDeclaredMethods()[1];
        for (Parameter parameter : method.getParameters()) {
            System.out.println("小奏技术 Parameter name: " + parameter.getName());
        }
    }
}
```

- 添加`-parameters`前输出
>小奏技术 Parameter name: arg0
>小奏技术 Parameter name: arg1

可以看到获取不到参数名

- 添加`-parameters`后输出

>小奏技术 Parameter name: param1
>小奏技术 Parameter name: param2


可以看到获取到了真实的参数名

## 总结

`spinrg boot` 3.x高一点点的版本就废弃掉了`LocalVariableTableParameterNameDiscoverer`(基于字节码技术)方式的参数名解析

废弃原因主要是因为`LocalVariableTableParameterNameDiscoverer`是因为其依赖字节码实现细节，存在兼容性问题，编译成`Native Image`运行在`GraalVM`上不起作用

我们在进行替换的时候需要注意，需要在`maven`打包工具中添加`-parameters`编译选项，不然使用`StandardReflectionParameterNameDiscoverer`也是获取不到参数名的