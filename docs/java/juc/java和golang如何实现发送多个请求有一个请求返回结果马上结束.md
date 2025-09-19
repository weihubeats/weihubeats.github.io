## 需求

比如我们需要实现一个功能

并行访问多个系统，如果有一个系统返回结果，则马上返回数据，并结束其他结果

java和go分别如何实现呢

## java

```java
public class ParallelWebRequests {

    public static void main(String[] args) throws Exception{

        List<String> urls = List.of(
                "https://httpbin.org/delay/1",  
                "https://httpbin.org/delay/2",
                "https://httpbin.org/delay/3"
        );
        
        String result = fetchFirstResponse(urls);
        System.out.println("First response received: " + result);
        
    }

    private static String fetchFirstResponse(List<String> urls) throws Exception{
        List<CompletableFuture<String>> completableFutures = urls.stream()
                .map(url -> CompletableFuture.supplyAsync(() -> fetchUrlResponse(url)))
                .collect(Collectors.toList());

        CompletableFuture<Object> anyOfFuture = CompletableFuture.anyOf(completableFutures.toArray(new CompletableFuture[0]));
        String res = (String) anyOfFuture.get();
        completableFutures.forEach(future -> future.complete(res));
        return res;
    }

    private static String fetchUrlResponse(String url) {
        // 模拟网络请求
        Random random = new Random();
        String substring = url.substring(url.length() - 1);
        try {
            TimeUnit.SECONDS.sleep(random.nextInt(3));
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return "res " + substring;
        
    }
}
```

可以看到java使用`CompletableFuture`实现起来还是非常简单的

那么golang呢

## go

```go
package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

func main() {
	urls := []string{
		"http://httpbin.org/delay/5", // 延迟5秒
		"https://www.google.com",     // 通常很快
		"https://www.github.com",
		"http://httpbin.org/delay/3", // 延迟3秒
	}

	fmt.Println("Starting concurrent fetches...")
	result, err := GetFirstResponse(urls)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Println("\n--- Final Result ---")
		fmt.Println(result)
	}

	// 给一点时间让被取消的日志打印出来
	time.Sleep(1 * time.Second)
}

// 发起一个可取消的 HTTP GET 请求
func fetchURL(ctx context.Context, url string, ch chan<- string, wg *sync.WaitGroup) {
	defer wg.Done() // 确保 WaitGroup 计数器减少

	// 创建一个与传入的 context 绑定的请求
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		fmt.Printf("Error creating request for %s: %v\n", url, err)
		return
	}

	fmt.Printf("Starting fetch for: %s\n", url)
	resp, err := http.DefaultClient.Do(req)

	// 检查错误。如果 context 被取消，这里会收到一个错误
	if err != nil {
		// ctx.Err() 可以判断是不是由于 context 取消导致的错误
		if ctx.Err() != nil {
			fmt.Printf("Request for %s was cancelled.\n", url)
		} else {
			fmt.Printf("Error fetching %s: %v\n", url, err)
		}
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading body from %s: %v\n", url, err)
		return
	}

	result := fmt.Sprintf("Success from %s, content length: %d", url, len(body))

	// 使用 select 来尝试发送结果，如果 context 已被取消，则放弃发送
	select {
	case ch <- result:
		fmt.Printf("Sent result from %s to channel.\n", url)
	case <-ctx.Done():
		fmt.Printf("Could not send result from %s because context was cancelled.\n", url)
	}
}

func GetFirstResponse(urls []string) (string, error) {
	if len(urls) == 0 {
		return "", fmt.Errorf("URL list cannot be empty")
	}

	// 创建一个带取消功能的 context
	ctx, cancel := context.WithCancel(context.Background())
	// 函数退出时，确保调用 cancel() 来释放资源
	defer cancel()

	// 使用缓冲为1的channel，防止第一个goroutine发送时阻塞
	resultChan := make(chan string, 1)
	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		go fetchURL(ctx, url, resultChan, &wg)
	}

	// 等待第一个结果
	firstResult := <-resultChan
	fmt.Println("First result received, cancelling other requests...")

	// 取消其他请求
	cancel()

	// 等待所有goroutine都结束（无论是完成还是被取消）
	// 这是一个好的实践，确保资源被完全清理
	wg.Wait()

	close(resultChan)
	fmt.Println("All goroutines have finished.")

	return firstResult, nil
}

```

golang的实现主要用到了协程和`chan`