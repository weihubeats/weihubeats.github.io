## Michael-Scott算法是什么

在 Michael 和 Scott 的工作之前，构建高效的多处理器上的并发数据结构是一个挑战。传统的基于锁的方法（如互斥锁）在高竞争环境下可能导致性能瓶颈、死锁或活锁。非阻塞算法的研究旨在提供不依赖于互斥锁的替代方案，以提高可伸缩性和鲁棒性。

Michael 和 Scott 的贡献在于提出了一种相对简单（相对于当时的许多其他非阻塞算法）、快速且实用的无锁队列实现。通过巧妙地使用单向链表、哑节点以及 CAS 操作，他们设计出了一种能够支持多生产者和多消费者并发访问，并且在实践中表现优异的队列

他们将这个算法发表在了一篇非常重要的论文中：Simple, Fast, and Practical Non-Blocking and Blocking Concurrent Queue Algorithms

## Michael-Scott算法的特点

1. 基于链表: 使用单向链表来存储队列元素。

2. 分离的头尾指针: 使用两个独立的指针`head`和`tail`分别指向队列的头部和尾部。入队操作主要修改尾部，出队操作主要修改头部。这种分离减少了入队和出队之间的直接竞争

3. 哑节点 (Dummy Node / Sentinel Node): 在队列的开始处引入一个不存储实际数据的节点。head 指针始终指向这个哑节点。实际的队首元素是哑节点的下一个节点。这个哑节点极大地简化了算法的逻辑，特别是处理空队列和只有一个元素的队列时的边界情况

4. 原子操作 (CAS): 使用 CAS 操作来原子性地更新共享的指针 (head.compareAndSet(), tail.compareAndSet(), node.next.compareAndSet())。当多个线程尝试修改同一个指针时，只有一个线程的 CAS 操作会成功，其他线程会失败并通常选择重试

5. “帮助”机制 (Helping): 当一个线程在执行某个操作（如入队或出队）时，它可能会检测到队列处于一个中间状态（例如，另一个线程成功地链接了新节点但还没来得及更新 tail 指针）。当前线程会“帮助”完成前一个线程未完成的操作（比如更新 tail 指针），然后再继续自己的操作。这种帮助机制确保了即使一个线程被中断，其他线程也能继续推进队列的状态，保证了无锁 (lock-free) 的性质（即系统中总有至少一个线程能够向前执行）

6. CAS 循环: 操作通常在一个 while(true) 循环中执行。在尝试进行 CAS 操作之前，线程会读取当前的共享状态。如果 CAS 失败，说明共享状态已经被其他线程修改，当前线程会重新读取最新的状态并再次尝试，直到 CAS 成功


## 代码实现

我们基于`Michael-Scott算法`算法实现一个线程安全的无锁队列


由于是简单联系，我们就打算继承`AbstractQueue`类，然后去实现`AbstractQueue`中定义的一些`Queue`方法

```java
public class MyLockFreeQueue1<E> extends AbstractQueue<E> {
    
    @Override
    public Iterator<E> iterator() {
        return null;
    }

    @Override
    public int size() {
        return 0;
    }

    @Override
    public boolean offer(E e) {
        return false;
    }

    @Override
    public E poll() {
        return null;
    }

    @Override
    public E peek() {
        return null;
    }
}

```

`AbstractQueue`中要实现的抽象方法总过这几个

- iterator 返回一个迭代器
- size 返回队列大小
- offer 出队列
- poll 入队列
- peek 仅查看数据


由于是链表存储，所以我们先定义节点

### Node

```java
    private static class Node<E> {

        final E item;

        final AtomicReference<Node<E>> next; // 指向下一个节点的原子引用

        Node(E item, Node<E> next) {
            this.item = item;
            this.next = new AtomicReference<>(next);
        }
    }
```

链表节点定义是最基本的定义，包含本身自己数据，然后下一个节点的引用

值得注意的是`next`对象是用`AtomicReference`进行包装，保证操作线程安全

由于要操作链表，所以我们还需要定义两个指针

- 头指针
- 尾指针

所以现在代码就变成了如下

```java
public class MyLockFreeQueue<E> extends AbstractQueue<E> {

    private static class Node<E> {

        final E item;

        final AtomicReference<Node<E>> next; 

        Node(E item, Node<E> next) {
            this.item = item;
            this.next = new AtomicReference<>(next);
        }
    }

    // 头指针
    private final AtomicReference<Node<E>> head;

    // 尾指针
    private final AtomicReference<Node<E>> tail;

    public MyLockFreeQueue() {
        // 哨兵节点，简化操作
        Node<E> dummy = new Node<>(null, null);
        head = new AtomicReference<>(dummy);
        tail = new AtomicReference<>(dummy);
    }
    
    @Override
    public Iterator<E> iterator() {
        return null;
    }

    @Override
    public int size() {
        return 0;
    }

    @Override
    public boolean offer(E e) {
        return false;
    }

    @Override
    public E poll() {
        return null;
    }

    @Override
    public E peek() {
        return null;
    }
}

```



### offer

我们先来看看如何实现入队操作

```java
    @Override
    public boolean offer(E item) {
        if (item == null)
            throw new NullPointerException("Item cannot be null");

        Node<E> newNode = new Node<>(item, null);

        while (true) {
            // 读取当前尾指针
            Node<E> currentTail = tail.get();
            // 读取尾节点的下一个节点
            Node<E> tailNext = currentTail.next.get();

            // 检查尾指针是否在我们读取期间被其他线程移动了
            if (currentTail == tail.get()) {
                if (tailNext != null) {
                    // 尾指针不是真正的队尾（其他线程已添加但没来得及移动尾指针）
                    // 尝试帮助移动尾指针到下一个节点
                    tail.compareAndSet(currentTail, tailNext);
                    // 然后重试 offer 操作
                } else {
                    // 尾指针指向的是真正的队尾（其 next 为 null）
                    // 尝试将新节点链接到当前队尾后面
                    if (currentTail.next.compareAndSet(null, newNode)) {
                        // 链接成功！
                        // 尝试将尾指针移动到新添加的节点 (这是一个优化步骤，即使失败队列状态也是正确的)
                        tail.compareAndSet(currentTail, newNode); // Best effort CAS
                        return true; // 元素添加成功
                    }
                    // 如果 CAS 失败，说明有其他线程修改了 currentTail.next，循环重试
                }
            }
            // 如果 tail 指针已经被移动，或者链接新节点失败，则整个操作重试
        }
    }
```

我们来看看两个线程同时并发执行`offer`操作

- 初始状态

head → [dummy] ← tail
           |
           ↓
          null

线程 T1 执行到一半

head → [dummy] ← tail
         |
         ↓
      [item1] → null

- T1 读取当前尾节点：currentTail = [dummy]
- T1 读取尾节点的下一个节点：tailNext = null
- T1 创建新节点：newNode1 = [item1, null]
- T1 尝试 CAS 操作设置 dummy.next = newNode1（成功）



线程 T1 还没来得及更新 tail 指针，线程 T2 执行:

head → [dummy]    [item1] ← tail
         |          |
         ---------->↓
                   null

T2 读取当前尾节点：currentTail = [dummy] (tail 指针还没被 T1 更新)
T2 读取尾节点的下一个节点：tailNext = [item1] (不是 null，说明 tail 落后了)
T2 发现 tailNext != null，这意味着 tail 指针需要向前移动
T2 帮助更新 tail 指针：tail.compareAndSet(dummy, item1)（假设成功）