## custor rule是什么

使用 AI 编写代码时，开发者常遇到的一个痛点就是 AI 容易“自由发挥”，导致代码风格偏离项目规范或做出不必要的修改。Cursor Rules 就是为了解决这个问题而引入的核心功能。它允许开发者为 AI（如 Cursor Agent 或 Chat）设定明确的行为规范和项目上下文，指导 AI 遵循特定的架构模式、代码风格和工作流，从而提供更可控、更符合预期的编码体验。

## Cursor 支持四种类型的规则

根据规则的作用范围和来源，Cursor 主要支持以下四种类型的规则：

* **项目规则 (Project Rules)：** 存储在特定项目内部，跟随代码库进行版本控制，仅对当前项目生效。
* **用户规则 (User Rules)：** 针对当前用户的全局规则，适用于该开发者在 Cursor 中打开的所有项目。
* **团队规则 (Team Rules)：** 适用于整个团队或组织的规则，便于在团队内统一代码风格和工作流规范。
* **远程规则 (Remote Rules)：** 直接从外部 GitHub 仓库拉取并同步的规则，适合复用开源社区的最佳实践。


## rule如何工作

Cursor Rules 的工作原理是在你与 AI 交互时，将预设的指令、提示词作为“背景设定”自动注入到 AI 的上下文中。当你在对话框中向 AI 提问或要求生成代码时，Cursor 会根据当前激活的文件、路径或触发条件，自动筛选相关的规则。这样，AI 的回答和代码生成就会被这些规则“约束”，严格按照你的要求输出。


## 项目rule

项目规则是日常开发中最常用的类型。它们被集中存放在项目根目录的 `.cursor/rules` 文件夹中。由于这些规则本身就是文件，它们会被 Git 跟踪和版本控制。这意味着整个开发团队都可以共享、修改并共同维护这些规则，确保任何团队成员在使用 AI 时都能得到一致的代码产出。

## 规则结构

每条项目规则实际上是一个包含 `frontmatter`（前置元数据）和正文内容的 Markdown 文件。通过在顶部定义元数据，你可以控制规则的具体触发时机（Rule Type）：

* **Always Apply (始终应用)：** 在该项目的每一个 AI 聊天会话中都会无条件生效。
* **Apply Intelligently (智能应用)：** Cursor Agent 会根据规则的 `description` (描述) 自行判断当前任务是否相关，相关时才会自动应用。
* **Apply to Specific Files (特定文件应用)：** 只有当上下文中的文件匹配指定的全局模式（`globs` 属性）时，规则才会生效。
* **Apply Manually (手动应用)：** 仅在对话中通过 `@` 符号明确提及该规则（例如输入 `@my-rule`）时生效。

```
---
globs:
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```


## 创建规则

在 Cursor 中，有两种非常便捷的方式来创建项目规则：

* **在对话中创建：** 在 Cursor Agent 的对话框中输入 `/create-rule`，然后用自然语言描述你的需求。Agent 会自动帮你生成带有正确 `frontmatter` 的规则文件，并将其保存到 `.cursor/rules` 目录中。
* **在设置中创建：** 打开 `Cursor Settings > Rules, Commands` 面板，点击 `+ Add Rule`。这会在项目中直接创建一个新文件。在该设置面板中，你还可以可视化地查看和管理所有规则的状态。

## 规则文件格式

规则文件是以带有拓展名（如 `.mdc`，代表 Markdown with Cursor）的格式存在的。文件的顶部使用 YAML 格式定义触发条件和属性，下方则是你写给 AI 的具体提示词内容。例如：

```yaml
---
description: 针对 React 组件的编写规范
globs: **/*.tsx
alwaysApply: false
---
```

*(接下来是你对 AI 提出的具体要求，比如“必须使用函数式组件”、“禁止使用内联样式”等)*

## 团队规则

团队规则（Team Rules）的形式相对自由。它们通常是一段纯文本，不需要遵循项目规则那样的特定文件夹结构。团队规则同样支持使用 Glob 模式来按文件范围生效（例如设置 `**/*.py`，则规则仅在 Python 文件出现时生效）。如果没有设置 Glob 模式，该规则将适用于该团队的每一个会话。


## 外部规则导入

为了避免重复造轮子，Cursor 支持直接从你拥有访问权限的任何 GitHub 仓库（公共或私有）直接导入规则。操作步骤如下：

1. 打开 `Cursor Settings -> Rules, Commands`。
2. 点击 `Project Rules` 旁边的 `+ Add Rule`。
3. 选择 `Remote Rule (GitHub)`。
4. 粘贴包含该规则的 GitHub 仓库 URL。
5. Cursor 会自动拉取该规则并将其同步到你的项目中。


## AGENTS

如果你觉得 `.cursor/rules` 目录过于复杂，或者你的项目需求非常简单直接，你可以使用 `AGENTS.md`。这是一个放在项目根目录中的简单 Markdown 文件，用于直接定义全局的 Agent 指令。它可以作为 `.cursor/rules` 的轻量级替代方案。


## 用户规则

用户规则是绑定到你个人本地环境的设定。无论你切换到哪个项目，这些规则都会生效。这非常适合用来设定你私人的 AI 交互偏好，比如“请始终用中文回复我”、“解释代码时尽量简短”等无需随项目共享的个人习惯。

在 Cursor Settings → Rules 中定义的全局首选项


## 最佳实践

* **保持规则模块化：** 尽量将规则拆分为单一职责的小文件（比如单独的“数据库规则”、“React 组件规则”、“测试编写规则”），而不是写一个臃肿的全局文件。
* **精准配置触发条件：** 为规则提供清晰的 `description` 和精准的 `globs`，确保 AI 只有在真正需要时才加载它们，防止污染 AI 的上下文，从而节省 Token 并提高回答准确率。
* **提供正反面示例：** 在规则正文中，给出明确的示例（Good Code / Bad Code），这比纯粹的文字描述更能让 AI 精准理解你的意图。

- 将规则控制在 500 行以内

## 一份java开发rule

这里给一份java开发的rule作为参考

### spring-boot-jdk21.mdc

`.cursor/rules/spring-boot-jdk21.mdc` 放在项目根目录

```yaml
---
description: Java, Spring Boot 3.x 与 JDK 21 开发规范与最佳实践
globs: **/*.java
alwaysApply: false
---
# Java + Spring Boot + JDK 21 开发规范

你是一个资深的 Java 架构师和 Spring Boot 专家。在生成、修改或审查代码时，请严格遵守以下开发规范：

## 1. 核心技术栈与版本
- **语言版本**: Java 21
- **框架版本**: Spring Boot 3.x
- **构建工具**: Maven / Gradle (根据项目已有文件自动判断)

## 2. 充分利用 JDK 21 新特性
- **DTO/VO 实体**: 强制使用 `record` 关键字来声明不可变的数据传输对象，避免冗余的 Getters/Setters 或过度依赖 Lombok 的 `@Data`。
- **模式匹配**: 在使用 `switch` 语句或 `instanceof` 判断时，必须使用 Java 21 的模式匹配语法（Pattern Matching），避免手动的强制类型转换。
- **并发编程**: 优先考虑使用**虚拟线程 (Virtual Threads)** 来处理高并发的 I/O 密集型任务，而不是传统的线程池。
- **集合操作**: 优先使用较新的 API（如 `List.of()`, `Map.of()`）和 Stream API 提升代码简洁度。

## 3. Spring Boot 最佳实践
- **依赖注入**: **严禁**在字段上直接使用 `@Autowired`。必须使用**构造器注入**（推荐直接写 `final` 字段结合 Lombok 的 `@RequiredArgsConstructor`，或者手写构造函数）。
- **架构分层**: 保持 Controller 层极度轻量，只处理 HTTP 路由、参数校验和响应封装；将核心业务逻辑完全下沉到 `@Service` 层。
- **配置属性**: 优先使用 `@ConfigurationProperties` 将配置文件映射为类型安全的 Record 或类，避免在代码中散落大量的 `@Value`。
- **RESTful API**: 严格遵循 RESTful 规范（使用正确的 HTTP 方法 GET/POST/PUT/DELETE；URI 使用名词复数；正确返回 HTTP 状态码）。

## 4. 代码风格与规范
- **响应结构**: API 返回结果必须统一包装（例如使用统一的 `Result<T>` 或 `ApiResponse<T>` 泛型类）。
- **异常处理**: 禁止在业务代码中到处 `try-catch`。直接抛出自定义的业务异常，并交由全局异常处理器（`@RestControllerAdvice` + `@ExceptionHandler`）统一捕获并返回标准 JSON 结构。
- **日志记录**: 使用 SLF4J 进行日志记录。避免过度日志，确保包含足够的上下文（如 Trace ID 或关键业务 ID）。

## 5. 示例对比 (Good vs Bad)

### Bad Code (过时的写法)
```java
@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/createUser") // 不规范的 URI
    public Map<String, Object> create(@RequestBody UserDto user) {
        // 缺少校验，直接返回 Map
        userService.save(user);
        Map<String, Object> map = new HashMap<>();
        map.put("code", 200);
        return map;
    }
}
```
### mybatis-plus.mdc

`.cursor/rules/mybatis-plus.mdc`

```yaml
---
description: MyBatis-Plus 持久层开发规范与最佳实践
globs: **/*.java, **/*.xml
alwaysApply: false
---
# MyBatis-Plus 数据库持久层规范

你是一个精通 MyBatis-Plus 框架的高级 Java 开发工程师。在处理数据库交互、生成 Mapper、Service 或 Entity 代码时，请严格遵守以下规范：

## 1. 实体类 (Entity) 与 DTO 区分
- **Entity (POJO)**: 数据库映射对象必须是普通的 Class，并使用 Lombok 注解（`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`）。**不要**对数据库 Entity 使用 Java 21 的 `record`，因为 MyBatis 反射实例化需要无参构造和可变属性。
- **映射注解**: 必须明确指定 `@TableName("表名")`。主键必须使用 `@TableId(type = IdType.AUTO/ASSIGN_ID)`。
- **自动填充与逻辑删除**: 推荐对审计字段（如创建时间、更新时间）使用 `@TableField(fill = FieldFill.INSERT/INSERT_UPDATE)`。如果是软删除字段，必须添加 `@TableLogic`。
- **DTO/VO**: 从数据库查出 Entity 后，如果需要向前端返回或跨层传输，必须转换为 Java 21 的 `record`。

## 2. Mapper 层规范
- **继承体系**: 所有的 Mapper 接口必须继承 `BaseMapper<T>`。
- **注解要求**: 确保 Mapper 接口上有 `@Mapper` 注解（或者在配置类中统一开启了 `@MapperScan`，默认给接口加 `@Mapper` 增强可读性）。
- **避免写死 SQL**: 尽量使用 MyBatis-Plus 提供的内置方法。如果必须手写复杂 SQL，优先写在与 Mapper 接口同名的 XML 文件中，避免在注解里写大段的 `@Select` / `@Update` 字符串。

## 3. Service 层规范
- **继承体系**: 业务接口继承 `IService<T>`，实现类继承 `ServiceImpl<M, T>` 并实现自定义的业务接口。
- **事务管理**: 涉及到增删改的复杂业务逻辑方法，必须加上 `@Transactional(rollbackFor = Exception.class)`。
- **依赖注入**: 即使继承了 `ServiceImpl`，如果需要注入其他 Mapper，依然必须使用 **构造器注入**（`@RequiredArgsConstructor` + `private final`），严禁使用 `@Autowired`。

## 4. 查询条件 (Wrapper) 最佳实践（极度重要）
- **强制使用 Lambda 语法**: 在构建查询条件时，**绝对禁止**使用普通的 `QueryWrapper` 和硬编码的数据库字段名（如 `eq("user_name", name)`）。
- **必须使用**: `LambdaQueryWrapper<T>` 或 `Wrappers.<T>lambdaQuery()`，通过方法引用（如 `User::getUserName`）来保证类型安全和重构安全。
- **链式调用**: 推荐使用 MyBatis-Plus 3.x 提供的链式查询 API：`lambdaQuery().eq(...).list()`。

## 5. 分页查询
- 使用 MyBatis-Plus 原生的 `Page<T>` 对象进行分页。
- 确保分页参数传递正确，且返回给前端时，需转换为统一的分页响应格式（如包含 `total`, `records`, `current`, `size` 的 DTO）。

---

## 6. 示例对比 (Good vs Bad)

### Bad Code (魔法字符串，类型不安全，易报错)
```java
// 错误示范：使用了硬编码字段名，极易在重构或改字段名时引发 Bug
public List<User> getActiveUsers(String role) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.eq("status", 1)
           .eq("role_name", role);
    return userMapper.selectList(wrapper);
}
```


### spring-boot-testing.mdc


`.cursor/rules/spring-boot-testing.mdc`

```yaml
---
description: Spring Boot 3 单元测试规范 (JUnit 5, Mockito, AssertJ)
globs: src/test/**/*.java, **/*Test.java
alwaysApply: false
---
# 单元测试开发规范

你是一个对代码质量有极高要求的 Java 测试专家。在编写和修改测试代码时，必须严格遵守以下规范：

## 1. 测试技术栈 (仅限最新版本)
- **核心框架**: 绝对禁止使用 JUnit 4！必须使用 **JUnit 5 (Jupiter)**。所有 `@Test` 注解必须来自 `org.junit.jupiter.api.Test`。
- **Mock 框架**: 使用 **Mockito** 配合 `@ExtendWith(MockitoExtension.class)`。
- **断言库**: 绝对禁止使用 JUnit 原生的 `assertEquals`！必须统一使用 **AssertJ** 的 `assertThat()` 提供流畅的断言体验。

## 2. 命名规范与结构
- **方法命名**: 测试方法名必须清晰表达意图。推荐使用 `should_ExpectedBehavior_when_StateUnderTest` 格式（如 `should_return_user_when_id_exists`），或使用 `@DisplayName` 注解配合中文描述。
- **代码结构**: 必须严格遵循 **Given-When-Then**（或 Arrange-Act-Assert）结构，并且在代码中使用空行隔开这三个阶段。

## 3. Mock 最佳实践 (BDD 风格)
- 严禁使用传统的 `when().thenReturn()`！
- 强制使用 BDDMockito 风格：准备数据使用 `given().willReturn()`；验证行为使用 `then().should()`。这在语义上与 Given-When-Then 完美契合。

## 4. 示例对比 (Good vs Bad)

### Bad Code (过时、混乱的写法)
```java
// 错误：使用了 JUnit 4 风格，原生断言，缺乏结构，方法名不知所云
@RunWith(MockitoJUnitRunner.class) 
public class UserServiceTest {
    @Mock UserService userService;
    
    @Test
    public void testGetUser() {
        User user = new User();
        user.setId(1L);
        when(userMapper.selectById(1L)).thenReturn(user); // 非 BDD 风格
        
        User result = userService.getUser(1L);
        Assert.assertEquals(1L, result.getId().longValue()); // 过时的断言
    }
}
```

### spring-redis.mdc

`.cursor/rules/spring-redis.mdc`

```yaml
---
description: Spring Boot Redis 缓存开发规范与 Key 设计
globs: **/*Cache*.java, **/*Redis*.java, **/*Service.java
alwaysApply: false
---
# Redis 缓存与使用规范

你是一个高性能系统架构师。在编写涉及 Redis 交互或 Spring Cache 的代码时，请遵循以下原则：

## 1. 缓存 Key 的设计规范 (极度重要)
- 绝对禁止使用散乱的字符串拼接做 Key！
- Key 必须使用**冒号分隔**的命名空间格式：`项目名:模块名:实体名:业务唯一标识`。
  - 例如：`myapp:user:info:1001`
- 建议在一个专门的 `RedisKeyConstants` 接口或类中集中维护 Key 的前缀，或者在声明 Cacheable 时使用标准的前缀。

## 2. Spring Cache 注解规范
- 优先使用 Spring Cache 注解 (`@Cacheable`, `@CachePut`, `@CacheEvict`) 来处理标准 CRUD 的缓存逻辑，保持业务代码整洁。
- 使用 `@Cacheable` 时，必须指定 `value` (或 `cacheNames`) 和 `key`。`key` 推荐使用 SpEL 表达式，如 `#id` 或 `#request.userId`。
- 对于批量删除或更新，务必正确使用 `@CacheEvict(allEntries = true)` 或批量剔除逻辑。

## 3. RedisTemplate 规范
- 如果需要手动操作复杂数据结构（Hash, Set, ZSet），使用 `StringRedisTemplate` 或配置了 `Jackson2JsonRedisSerializer` 的 `RedisTemplate<String, Object>`。
- **严禁**使用未经配置序列化器的默认 `RedisTemplate`（会导致 JDK 原生序列化产生的 `\xAC\xED\x00\x05t\x00\x05` 乱码问题）。

## 4. 缓存一致性与过期时间
- 所有的缓存数据**必须设置 TTL（过期时间）**，严禁产生永久不过期的脏数据（除非是字典表）。如果 AI 生成了 Redis 操作代码，必须同时设置 expiration。

## 5. 示例 (Good vs Bad)

### Bad Code (硬编码拼接，缺乏过期时间设置)
```java
public void saveUser(User user) {
    // 错误：Key 格式不规范，且没有设置过期时间
    redisTemplate.opsForValue().set("user_" + user.getId(), user); 
}
```

## 参考

- https://cursor.com/cn/docs/rules