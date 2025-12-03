

## 自定义响应解码器

实现`Decoder`接口即可

```java
import feign.Request;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;

@Component
public class CustomFeignErrorDecoder implements ErrorDecoder {
    
    private static final Logger log = LoggerFactory.getLogger(CustomFeignErrorDecoder.class);
    private final ErrorDecoder defaultDecoder = new Default();
    
    @Override
    public Exception decode(String methodKey, Response response) {
        // 记录请求信息
        Request request = response.request();
        logErrorRequest(methodKey, request);
        
        // 记录响应信息
        logErrorResponse(methodKey, response);

                if (byte[].class.equals(type)) {
            try {
                return IoUtil.readBytes(body.asInputStream());
            } catch (IOException e) {
                log.error(ExceptionLogUtil.getMessage(e));
                throw UserCenterException.wrap(e);
            }
        }

                try {
            final String str = IoUtil.read(body.asInputStream(), Charset.defaultCharset());
            try {
                final TypedResult<?> result = ObjectMapperHolder.getInstance().readValue(str, TypedResult.class);
                                if (TypedResult.isSuccess(result.getCode())) {
                    final Object data = result.getData();
                    final JavaType javaType = TypeFactory.defaultInstance().constructType(type);
                           return ObjectMapperHolder.getInstance().convertValue(data, javaType);
                } else {
                    throw new UserCenterException(result.getCode(), result.getMsg());
                }
                            } catch (MismatchedInputException e) {
                log.error("MismatchedInputException: {} ", e.getMessage());
                return ObjectMapperHolder.getInstance().readValue(str, TypeFactory.defaultInstance().constructType(type));
            }
                    } catch (Exception e) {
            log.error(ExceptionLogUtil.getMessage(e), e);
            throw UserCenterException.wrap(e);
        }
    }
    
    private void logErrorRequest(String methodKey, Request request) {
        try {
            log.error("Feign调用异常 - 方法: {}", methodKey);
            log.error("请求URL: {} {}", request.httpMethod(), request.url());
            log.error("请求头: {}", request.headers());
            
            if (request.body() != null && request.body().length > 0) {
                String body = new String(request.body(), StandardCharsets.UTF_8);
                log.error("请求参数: {}", body);
            }
        } catch (Exception e) {
            log.warn("Failed to log request info", e);
        }
    }
    
    private void logErrorResponse(String methodKey, Response response) {
        try {
            log.error("响应状态码: {}", response.status());
            log.error("响应头: {}", response.headers());
            
            if (response.body() != null) {
                byte[] bodyData = Util.toByteArray(response.body().asInputStream());
                String body = new String(bodyData, StandardCharsets.UTF_8);
                log.error("响应体: {}", body);
            }
        } catch (Exception e) {
            log.warn("Failed to log response info", e);
        }
    }
}

```

## 异常解码器


实现 ErrorDecoder皆可即可

## 使用

```java
@Configuration
public class UserFeignConfiguration {

    @Bean
    public ErrorDecoder feignErrorDecoder() {
        return new FeignExceptionDecoder();
    }

    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.NONE;
    }
}
```