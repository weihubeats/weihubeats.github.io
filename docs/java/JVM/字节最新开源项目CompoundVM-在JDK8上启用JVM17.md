
>大家好，这里是**小奏**,觉得文章不错可以关注公众号**小奏技术**


## 背景

对于许多旧版 `Java` 应用程序（例如使用 `Java 8`），将应用程序升级到更高版本的 JDK 通常需要昂贵且耗时的项目迁移。


那么有没有一种方案在不升级JDK版本的情况下使用最新的`JVM`，获取到高版本JVM的性能提升呢？

答案就是字节最新开源的`CompoundVM`


## CompoundVM

CompoundVM （CVM） 是一个旨在为较低版本`JDK`带来更高版本`JVM`性能的项目。


现在，您可以使用高级`JVM`功能运行应用程序，而升级项目的成本几乎为零。


- [CompoundVM](https://github.com/bytedance/CompoundVM): https://github.com/bytedance/CompoundVM


## 支持版本及平台

目前`CompoundVM`版本为`CVM-8+17`,意味可在`JDK 8` 上启用`JVM 17`

目前支持的平台仅有`Linux/x86_64`，其他操作系统都暂不支持

`CVM`与上游 `OpenJDK` 项目采用相同的许可证开发。


## 特性与优势

更高版本的`JVM` 带来了垃圾收集、`JIT` 等的增强。

- 生产就绪型低延迟 ZGC
- 增强的 ParallelGC 和 G1GC，具有更高的吞吐量、更低的延迟和更少的内存占用
- 增强的内部函数
- 直接替代现有 JDK，易于升级和回滚


## 使用

目前提供的使用方式主要是基于源码的构建方式

```shell
git clone https://github.com/bytedance/CompoundVM.git

make -f cvm.mk cvm8default17
```

下载完源码并构建后我们输入

```shell
java -version
```

会输出如下信息

```shell
openjdk version "1.8.0_382"
OpenJDK Runtime Environment (build 1.8.0_382-cvm-b00)
OpenJDK 64-Bit Server VM (CompoundVM 8.0.0) (build 17.0.8+0, mixed mode)
```

这说明`JVM 17` 已在 `JDK 8` 中启用

## 测试方式

目前没在实际项目中测试过

但是感觉可以从几个方面来评估

1. 使用`CVM`后的内存占用情况
2. 使用`CVM`后进行压测看看吞吐是否有提升
3. 使用`CVM`修改JVM垃圾收集器`ZGC`看看效果


## 总结

`CompoundVM`主要是针对老项目不容易升级`JDK`版本项目的性能提升

老项目想要高版本 JVM 性能可以尝试使用该项目

如果是有条件升级`JDK`版本的项目还是推荐升级`JDK`

毕竟目前来看只是做了性能上的优化，语法层面应该没有提升。

其次只支持`JDK 17` 目前最新`JDK`已经升级到`21`了