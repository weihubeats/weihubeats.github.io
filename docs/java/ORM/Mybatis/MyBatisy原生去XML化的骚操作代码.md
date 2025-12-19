
## Mybatis 刻板印象

做 Java 开发这么多年，提到 `MyBatis`，大家脑子里的第一反应通常是：“这题我会！`Mapper` 接口定义方法，XML 里写 SQL。”


无论是最早的 `iBatis` 时代，还是后来流行的 `SSM `框架，甚至是现在的 `Spring Boot` 整合，`Mapper.xml` 似乎成了 `MyBatis` 的标配。我们习惯了在 XML 里用 `<if test="...">` 拼接条件，习惯了被 `OGNL` 表达式折磨，也习惯了在 `Java` 和 `XML` 文件之间反复横跳。

## 你以为的去XML是@Select注解吗

实际上，确实有一些厌倦了 `XML` 的开发者，在遇到简单 SQL 时，会选择使用 `@Select` 注解：

```java
@Select("SELECT * FROM user WHERE id = #{id}")
User selectById(Long id);
```

这种用法在处理单表简单查询时，确实“真香”。但一旦业务逻辑稍微复杂一点，需要动态 SQL 时，噩梦就开始了。

如果在注解里拼接动态 SQL，你可能需要使用`<script>` 标签：

```java
@Select("<script>" +
        "SELECT * FROM user " +
        "<where>" +
        "  <if test='name != null'> AND name = #{name} </if>" +
        "</where>" +
        "</script>")
List<User> selectByName(@Param("name") String name);
```

这简直反人类！ 不仅要手动转义双引号，代码还是一坨字符串，不仅没有语法高亮，可读性和维护性也极差。

所以，绝大多数人在遇到动态 SQL 时，最后还是老老实实回到了 XML 的怀抱：

```xml
<select id="selectUserList" resultType="com.example.User">
    SELECT * FROM user
    <where>
        <if test="name != null and name != ''">
            AND name = #{name}
        </if>
        <if test="age != null">
            AND age > #{age}
        </if>
    </where>
</select>
```

## 发现新大陆：MyBatis 原生 Provider

最近在接收同事的项目时，我发现了一种以前从未注意过的写法——完全使用 `Java` 构建动态 `SQL`，但又不是简单的字符串拼接。

它使用的是 MyBatis 原生的 @SelectProvider 注解

代码长这样：

```java
@SelectProvider(type = UserSqlProvider.class, method = "buildSelectSql")
List<User> selectByCondition(UserRequest req);

// Provider类
public String buildSelectSql(UserRequest req) {
    return new SQL() {{
        SELECT("*");
        FROM("user");
        if (req.getName() != null) WHERE("name = #{name}");
    }}.toString();
}

```

你没看错，像`SQL`、`SELECT`都是`Mybatis`官方提供的


![alt text](images/Mybatis-select-tag.png)


怎么样 这种写法没见过吧


## 现代兵器：MyBatis-Plus (MP)

当然，如果你的目的是“不想写 SQL”，替换`MyBatis`目前的行业标准答案是 `MyBatis-Plus`

对于 80% 的单表查询，MP 的 Lambda 表达式是碾压级的存在

```java
        LambdaQueryWrapper<Object> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(StringUtils.isNotBlank(req.getName()), User::getName, req.getName())
            .gt(req.getAge() != null, User::getAge, req.getAge())
        userMapper.selectList(wrapper);
```

类型安全、无需硬编码字段名、重构方便，这确实是现代开发的利器。

## 灵魂拷问：复杂场景该如何选择

随着技术的发展，像 `MyBatis-Flex` 这样的新兴框架开始支持Java 编程式 Join。

对于简单的连表查询，它看起来确实还不错

```java
QueryWrapper query = QueryWrapper.create()
    .select(ACCOUNT.ID, ACCOUNT.USER_NAME, ROLE.ROLE_NAME)
    .from(ACCOUNT)
    .leftJoin(ROLE).on(ACCOUNT.ROLE_ID.eq(ROLE.ID))
    .where(ACCOUNT.AGE.ge(18));
    
List<AccountDTO> list = accountMapper.selectListByQueryAs(query, AccountDTO.class);
```

但是，一旦业务逻辑升级，涉及到复杂的子查询或嵌套逻辑时，Java 编程式的“可维护性”就会受到挑战。

比如我们要实现这个 SQL： 查询订单总额大于“用户1平均订单额”的所有订单。

原生 SQL 写法（清晰明了）：

```sql
SELECT * FROM tb_order 
WHERE total_price > (
    SELECT AVG(total_price) FROM tb_order WHERE user_id = 1
)
```

Java 编程式写法（MyBatis-Flex）：

```java
// 先构建子查询
QueryWrapper subQuery = QueryWrapper.create()
    .select(avg(ORDER.TOTAL_PRICE))
    .from(ORDER)
    .where(ORDER.USER_ID.eq(1));

// 再构建主查询
QueryWrapper mainQuery = QueryWrapper.create()
    .select(ORDER.ALL_COLUMNS)
    .from(ORDER)
    .where(ORDER.TOTAL_PRICE.gt(subQuery)); // 对象嵌套

List<Order> list = orderMapper.selectListByQuery(mainQuery);
```

虽然 Java 写法做到了类型安全（防手误），但在代码的可读性和逻辑直观性上，它确实不如原生 SQL。

SQL 是声明式语言，一眼就能看出“意图”；而 Java Wrapper 是命令式堆叠，当嵌套层级达到 3 层以上时，维护者需要在大脑里把 Java 对象“翻译”回 SQL 才能理解逻辑，这无疑增加了心智负担

## 总结与建议

如果是在`Mybatis`相似`ORM`框架的技术使用，我还是更偏向于`MyBatis-Plus`，简单查询无需可以编程式实现，复杂SQL只能使用`XML`，可以实现一种强制编码规范

如果是使用`MyBatis-Flex`就可能形成java编程SQL的可维护灾难

其次还要考虑`MyBatis-Flex`框架的稳定性、活跃度等。新框架往往会有更多的坑
