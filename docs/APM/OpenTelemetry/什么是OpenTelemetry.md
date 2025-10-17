OpenTelemetry 是一个可观测性框架和工具包， 旨在创建和管理遥测数据，如链路、 指标和日志。 重要的是，OpenTelemetry 对供应商和工具是中立的，这意味着它可以与各种可观测性后端一起使用， 包括 Jaeger 和 Prometheus 这类开源工具以及商业化产品。

OpenTelemetry 不是像 Jaeger、Prometheus 或其他商业供应商那样的可观测性后端。 OpenTelemetry 专注于遥测数据的生成、采集、管理和导出。 OpenTelemetry 的一个主要目标是， 无论应用程序或系统采用何种编程语言、基础设施或运行时环境，你都可以轻松地将其仪表化。 重要的是，遥测数据的存储和可视化是有意留给其他工具处理的