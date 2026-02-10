## 核心数据模型 (Data Model)

Prometheus 采用时间序列（Time Series）数据模型。每一条时间序列由“指标名称”和“标签集合”唯一标识。

### 数据格式解构

$$\underbrace{\text{<metric name>}}_{\text{指标名称}}\{\underbrace{\text{<label name>}=\text{"<label value>"}, ...}_{\text{标签集合}}\} \quad \underbrace{\text{value}}_{\text{数值}} \quad \underbrace{\text{timestamp}}_{\text{时间戳}}$$


**示例：**


```
    # HELP http_requests_total 统计各HTTP端点的请求总数，含请求方法、状态码
    # TYPE http_requests_total counter
    http_requests_total{method="GET", status_code="200", endpoint="/api/user"}  1568  1620000000000
```
*   **含义**：在时间戳 `1620000000000`，`/api/user` 接口的 GET 请求（200 OK）累计发生了 1568 次。


## 命名与标签规范

### 指标名称

**作用**：标识监控指标的含义。

*   **规范**：

    *   ✅ **全小写 + 下划线**：如 `http_requests_total`。

    *   ✅ **简洁明了**：避免过度缩写，如使用 `http_requests` 而非 `http_req`。

    *   ❌ **禁止**：大写字母（`HTTP_Requests`）、中划线（`node-cpu`）、空格。

### 标签 (Labels) —— 维度筛选器

**作用**：K-V 键值对，用于精细化筛选（如区分环境、接口、状态码）。

*   **规范**：

    *   ✅ **全小写 + 下划线**：如 `status_code`。

    *   ✅ **数量限制**：单指标标签建议 **< 10 个**。

    *   ✅ **描述性**：如 `env=prod` 清晰表达含义


### 高风险警示：高基数 (High Cardinality) 灾难

**什么是高基数？** 标签的取值（Value）个数非常多。 **❌ 绝对禁止**：在标签值中包含**无界集合**数据，例如：**用户ID (User ID)、订单号 (Order ID)、邮件地址、Trace ID**。

**💥 为什么禁止？** Prometheus 中，每一个 `Key-Value` 组合都会生成一条新的时间序列。标签值的组合呈指数级爆炸（Cartesian Product）：

$$
Total Series=Label_{A}\times Label_{B}\times Label_{C}\times …
$$

> **场景推演：**
>
> *   某指标有 4 个标签：`instance`(100个), `le`(10个), `url`(400个), `method`(5种)。
>
> *   总序列数 =  $100\times 10\times 400\times 5=2,000,000$  (200万条序列)
>
>
> **后果**：直接撑爆 Prometheus 内存，导致服务瘫痪。 **MC服务端限制**：单指标标签数 ≤ 10，单标签值 ≤ 300，超限将自动合并。

## 指标类型 (Metric Types) 与选型

### 3.1 Counter (计数器)

* **含义**：只增不减的累计值（重启归零）。

* **场景**：请求总数、错误总数、支付次数、任务执行次数。

* **查询**：必须结合 `rate()` 函数计算速率



  * $$
    QPS=rate\left(http_requests_total\left[5m\right]\right)
    $$

* **注意**：不要用于统计并发数（并发数会下降，Counter 不能下降）


### 3.2 Gauge (仪表盘)

*   **含义**：可增可减的瞬时值。

*   **场景**：当前内存使用率、CPU 负载、实时在线人数、队列长度。

*   **查询**：直接查询原值，无需 `rate()`。

*   **注意**：Gauge 关注“当前状态”，会丢失历史波动细节。

### 3.3 Histogram (直方图) —— 推荐 🔥

* **含义**：统计数据的分布情况（如耗时、大小），服务端聚合计算分位数。

* **场景**：接口耗时分布（P99/P95）、响应大小分布。

* **关键配置**：**分桶 (Buckets)**。

  *   ✅ **自定义分桶**：必须根据业务定义（如 HTTP 耗时 `{100ms, 200ms, 500ms, 1s, 2s}`）。

  *   ❌ **避免默认分桶**：默认分桶范围可能过大，导致精度丢失。

* **查询 (计算 P95)**：

  $$
  histogram_quantile\left(0.95,sum\left(rate\left(metric_bucket\left[5m\right]\right)\right) by \left(le\right)\right)
  $$

### 3.4 Summary (摘要)

*   **含义**：客户端直接计算分位数（P50/P90/P99）。

*   **场景**：无法在服务端聚合的大规模实例监控，或精度要求极高的场景。

*   **缺点**：无法聚合（即无法计算“所有实例的 P95”），只能看单机数据。

*   **建议**：90% 的场景优先使用 Histogram。