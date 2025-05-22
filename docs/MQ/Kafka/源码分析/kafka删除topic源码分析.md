
## 入口

kafka的所有`client`请求都在`kafka.server.KafkaApis`这个类进行分发

`kafka.server.KafkaApis` 这个类用的不是java语言实现的，主要用的是`scala`



请求类型基于`scala`强大的模式匹配语法进行分发的



![alt text](images/kafka-apis-delete-topics.png)