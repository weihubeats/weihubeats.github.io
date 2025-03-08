## 背景

最近线上的缓存出现了问题。

有小伙伴反应，新增了数据，但是缓存的数据没有更新。

随后在本地排查看是否是缓存清理有bug，没有进行缓存清理。本地测试发现缓存清理是正常的，没有bug

线上随后也进行了测试，发现也没问题

凭借多年的缓存使用经验，怀疑应该是出现了缓存污染。

## 什么是缓存污染

缓存污染是指缓存中的数据不是最新的数据，而是过期的数据。

## 为什么会出现缓存污染

现在的业务流程是这样的

新增数据 -> 清理缓存 -> 提交事务

其实很多人在使用`spring cache`的时候是不知道`@CacheEvict`注解的清理过程是在事务提交前还是提交后

在使用的时候也不会注意到这个问题

假设`spring cache`是先清理缓存再提交事务，那么就会出现缓存污染。

我们来看看整个过程

1. A线程-新增数据
2. A线程-清理缓存 随后B线程-查询数据(事务未提交，数据库没有新增，缓存旧值，导致缓存污染)
3. 提交事务，更新数据库

## spring cache 是在事务提交前还是提交后清理缓存

spring cache的核心切面处理主要在`org.springframework.cache.interceptor.CacheAspectSupport.execute(org.springframework.cache.interceptor.CacheOperationInvoker, java.lang.Object, java.lang.reflect.Method, java.lang.Object[])`

我们来看看源码

```java
	private Object execute(final CacheOperationInvoker invoker, Method method, CacheOperationContexts contexts) {
		// Special handling of synchronized invocation
		if (contexts.isSynchronized()) {
			CacheOperationContext context = contexts.get(CacheableOperation.class).iterator().next();
			if (isConditionPassing(context, CacheOperationExpressionEvaluator.NO_RESULT)) {
				Object key = generateKey(context, CacheOperationExpressionEvaluator.NO_RESULT);
				Cache cache = context.getCaches().iterator().next();
				try {
					return wrapCacheValue(method, handleSynchronizedGet(invoker, key, cache));
				}
				catch (Cache.ValueRetrievalException ex) {
					// Directly propagate ThrowableWrapper from the invoker,
					// or potentially also an IllegalArgumentException etc.
					ReflectionUtils.rethrowRuntimeException(ex.getCause());
				}
			}
			else {
				// No caching required, only call the underlying method
				return invokeOperation(invoker);
			}
		}


		// Process any early evictions
		processCacheEvicts(contexts.get(CacheEvictOperation.class), true,
				CacheOperationExpressionEvaluator.NO_RESULT);

		// Check if we have a cached item matching the conditions
		Cache.ValueWrapper cacheHit = findCachedItem(contexts.get(CacheableOperation.class));

		// Collect puts from any @Cacheable miss, if no cached item is found
		List<CachePutRequest> cachePutRequests = new ArrayList<>();
		if (cacheHit == null) {
			collectPutRequests(contexts.get(CacheableOperation.class),
					CacheOperationExpressionEvaluator.NO_RESULT, cachePutRequests);
		}

		Object cacheValue;
		Object returnValue;

		if (cacheHit != null && !hasCachePut(contexts)) {
			// If there are no put requests, just use the cache hit
			cacheValue = cacheHit.get();
			returnValue = wrapCacheValue(method, cacheValue);
		}
		else {
			// Invoke the method if we don't have a cache hit
			returnValue = invokeOperation(invoker);
			cacheValue = unwrapReturnValue(returnValue);
		}

		// Collect any explicit @CachePuts
		collectPutRequests(contexts.get(CachePutOperation.class), cacheValue, cachePutRequests);

		// Process any collected put requests, either from @CachePut or a @Cacheable miss
		for (CachePutRequest cachePutRequest : cachePutRequests) {
			cachePutRequest.apply(cacheValue);
		}

		// Process any late evictions
		processCacheEvicts(contexts.get(CacheEvictOperation.class), false, cacheValue);

		return returnValue;
	}
```

源码比较长，但是核心的逻辑就两行

1. 在目标方法执行前执行
```java
// Process any early evictions
processCacheEvicts(contexts.get(CacheEvictOperation.class), true,
        CacheOperationExpressionEvaluator.NO_RESULT);
```

2. 在目标方法执行后执行
```java
processCacheEvicts(contexts.get(CacheEvictOperation.class), false, cacheValue);
```

虽然`processCacheEvicts`是在目标方法执行后执行，但是仍然是在事务提交前执行的。执行的顺序如下

1. 目标方法执行（invokeOperation(invoker)）。
2. 目标方法执行结束后，late evictions 执行（processCacheEvicts）。
3. 事务提交。

验证方式也很简单，
比如我们有一个简单的save方法
```java
@CacheEvict(value = "user", key = "#user.id")
@Transactional(rollbackFor = Exception.class)
public User save(User user) {
    return userRepository.save(user);
}


```
我们对`org.springframework.cache.interceptor.CacheAspectSupport.execute(org.springframework.cache.interceptor.CacheOperationInvoker, java.lang.Object, java.lang.reflect.Method, java.lang.Object[])`方法进行`debug`

会发现即使执行`returnValue = invokeOperation(invoker);`我们去数据库查询任然查询不到我们新增的数据

所以这里可以确认是在事务提交前执行的缓存清理


## 事务感知缓存

如果我们要解决缓存污染问题，我们需要使用事务感知缓存

spring boot 提供了`事务感知缓存`类即`TransactionAwareCacheManagerProxy`

事务感知缓存可以保证事务中缓存的一致性，比如数据库事务被回滚了，相关的缓存也能回滚，同时支持事务提交后删除缓存

虽然使用的是`TransactionAwareCacheManagerProxy`，但核心的实现类是`TransactionAwareCacheDecorator`

我们可以看看`TransactionAwareCacheDecorator`的源码

```java
	@Override
	public void evict(final Object key) {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					TransactionAwareCacheDecorator.this.targetCache.evict(key);
				}
			});
		}
		else {
			this.targetCache.evict(key);
		}
	}

	@Override
	public boolean evictIfPresent(Object key) {
		return this.targetCache.evictIfPresent(key);
	}

	@Override
	public void clear() {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					targetCache.clear();
				}
			});
		}
		else {
			this.targetCache.clear();
		}
	}
```

可以看到缓存的相关操作都被封装在`TransactionSynchronizationManager.registerSynchronization`中

即事务提交后才进行缓存的操作

## 使用事务感知缓存

使用的话也很简单，比如我们的`caffeine`要使用事务感知缓存

```java
@Bean
public CacheManager cacheManager() {

  var caffeine = Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(Duration.ofMinutes(5));
  var cacheManager = new CaffeineCacheManager();
  cacheManager.setCaffeine(caffeine);
  return new TransactionAwareCacheManagerProxy(cacheManager);
}
```

## 总结

我们在使用`spring cache` + `事务`的时候，需要注意`spring cache`的清理缓存是在事务提交前执行的

容易出现缓存污染，如果要解决缓存污染问题，需要使用`事务感知缓存`，保证事务中缓存的一致性

这里顺带推荐一个好用的多级缓存框架[fluxcache](https://github.com/weihubeats/fluxcache)

## 参考
- https://howtodoinjava.com/spring-boot/spring-transaction-aware-caching/