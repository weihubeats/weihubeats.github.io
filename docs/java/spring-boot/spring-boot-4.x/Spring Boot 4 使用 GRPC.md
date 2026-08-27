## spring boot 官方支持GRPC

使用方式

## 项目整体依赖


```xml

    <properties>
        <java.version>21</java.version>
        <spring-boot.version>4.1.0</spring-boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <plugin>
                <groupId>io.github.ascopes</groupId>
                <artifactId>protobuf-maven-plugin</artifactId>
                <version>2.11.0</version>
            </plugin>
        </plugins>
    </build>

```

## 模块

- spring-boot-4x-grpc
    - spring-boot-4x-grpc-server
    - spring-boot-4x-grpc-client


