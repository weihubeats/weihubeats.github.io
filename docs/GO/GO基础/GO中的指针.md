## 背景

和java不一样，GO中需要区分指针和值对象

使用主要有两个符号`&`和`*`


- `&`: 是取地址运算符 (Address Operator)。它的作用是获取一个变量的内存地址
- `*`: 有两种含义，取决于它出现的位置：
    1. 作为类型的一部分，它表示一个指针类型 (Pointer Type)。例如 `*int` 表示一个指向 int 类型变量的指针
    2. 作为解引用运算符 (Dereference Operator)，它表示获取指针所指向的变量的值



```go
package main

import "fmt"

func main() {
    x := 100 // 声明一个 int 类型的变量 x

    // 使用 & 获取变量 x 的内存地址
    p := &x

    fmt.Printf("变量 x 的值: %d\n", x)
    fmt.Printf("变量 x 的内存地址: %p\n", &x)
    fmt.Printf("指针 p 存储的值 (即 x 的地址): %p\n", p)
    fmt.Printf("指针 p 本身的内存地址: %p\n", &p)
}
```

输出

```
变量 x 的值: 100
变量 x 的内存地址: 0xc0000180a0
指针 p 存储的值 (即 x 的地址): 0xc0000180a0
指针 p 本身的内存地址: 0xc00000e028
```


在这个例子中，p 是一个指针，它存储了变量 x 的内存地址。注意，p 本身也是一个变量，所以它也有自己的内存地址。


## *的使用

### 作为指针类型

当 `*` 出现在一个类型名的前面时，它定义了一个指针类型。这个类型的变量可以存储指向该类型值的内存地址。

```go
var ptr *T // 声明一个名为 ptr 的指针变量，它可以指向一个 T 类型的变量

```

```go
package main

import "fmt"

func main() {
    var p *int // 声明一个指向 int 类型的指针变量 p

    x := 42
    p = &x // 将 x 的地址赋值给 p

    fmt.Printf("p 是一个 %T 类型的变量\n", p) // %T 用于打印变量的类型

    // var p2 *string // 这是一个指向 string 的指针
    // var p3 *MyStruct // 这是一个指向自定义结构体 MyStruct 的指针
}
```

`p 是一个 *int 类型的变量`


一个未被赋值的指针，其值为 nil，我们称之为空指针。

```go
var p *int
fmt.Println(p) // 输出: <nil>
```

对空指针进行解引用操作会导致程序崩溃 (panic)。

### 作为解引用运算符

当 `*` 出现在一个指针变量的前面时，它是一个解引用 (dereferencing) 或间接引用 (indirection) 运算符。它的作用是获取该指针所指向的内存地址上存储的值。


```go
package main

import "fmt"

func main() {
    x := 100
    p := &x // p 指向 x

    fmt.Println("x 的值:", x)
    fmt.Println("p 指向的值:", *p) // 使用 *p 解引用，获取 x 的值

    // 通过指针修改原始变量的值
    *p = 200 // 将 200 赋值给 p 所指向的地址上的变量（即 x）

    fmt.Println("修改后 x 的值:", x)
}
```

## 什么时候使用指针 `*` 和 `&`


### 在函数中修改传入的参数值

如果你希望一个函数能够修改它接收到的参数的原始值，你必须传递这个参数的指针。


不使用指针（无法修改原始值）：



```go
package main

import "fmt"

func double(v int) {
    v = v * 2 // 这里修改的是 v 的副本
}

func main() {
    num := 5
    double(num)
    fmt.Println(num) // 输出: 5，原始的 num 并未改变
}
```

使用指针（可以修改原始值）：

```go
package main

import "fmt"

// 函数接收一个 *int 类型的参数
func double(v *int) {
    *v = *v * 2 // 通过解引用，修改指针指向的原始值
}

func main() {
    num := 5
    // 传递 num 的地址
    double(&num)
    fmt.Println(num) // 输出: 10，原始的 num 被修改了
}
```

### 提高性能，避免大对象拷贝

当函数参数是一个大的数据结构（比如一个庞大的 struct）时，按值传递会完整地拷贝整个结构体，这会消耗时间和内存。如果传递该结构体的指针，函数只会拷贝一个小小的内存地址，效率会高得多。

```go
package main

import "fmt"

type BigStruct struct {
    // 假设这里有很多字段，占用大量内存
    data [1024]int
}

// 传递指针，只拷贝地址（通常 8 字节），效率高
func processStruct(s *BigStruct) {
    s.data[0] = 1
}

func main() {
    myStruct := BigStruct{}
    
    // 传递结构体的地址
    processStruct(&myStruct) 
    
    fmt.Println(myStruct.data[0]) // 输出: 1
}
```

注意： Go 语言对 struct 指针的字段访问做了语法糖。你不需要写 (*s).data[0]，可以直接写 s.data[0]。Go 会自动帮你解引用。


### 表示“可选”或“零值”有意义的场景

一个指针的值可以是 `nil`，而一个普通的变量（如 int, bool, struct）总有一个默认的零值（0, false, {}）。有时候，我们需要区分一个值是“未提供”还是“提供了零值”。

例如，一个函数需要更新用户信息，用户可能只想更新 Age，而不想更新 IsActive 状态。

```go
type UpdateUserRequest struct {
    Age      *int   // 使用指针表示可选
    IsActive *bool  // 使用指针表示可选
}

func UpdateUser(req UpdateUserRequest) {
    if req.Age != nil {
        fmt.Printf("用户年龄将被更新为: %d\n", *req.Age)
    } else {
        fmt.Println("用户年龄不更新。")
    }

    if req.IsActive != nil {
        fmt.Printf("用户状态将被更新为: %v\n", *req.IsActive)
    } else {
        fmt.Println("用户状态不更新。")
    }
}

func main() {
    // 场景1:只想更新年龄为 30
    age := 30
    UpdateUser(UpdateUserRequest{Age: &age})

    fmt.Println("-----")

    // 场景2: 只想更新状态为 false (禁用)
    active := false
    UpdateUser(UpdateUserRequest{IsActive: &active})
}
```

## 总结

符号|名称|用户发|解释
:--:|:--|:--:|:--:|
`&`|取地址运算符	|p := &x	|获取变量 x 的内存地址，并将其赋值给指针 p。
`*`|指针类型	|var p *int	|声明一个名为 p 的变量，其类型为“指向 int 的指针”。
`*`|解引用运算符	|val := *p	|获取指针 p 所指向的变量的值。

何时使用指针 (& 和 *) 的经验法则：

1. 当你需要修改函数外部的变量时：传递指针。

2. 当你处理的数据结构很大时：为了避免昂贵的拷贝，传递指针。这在处理 struct 时尤其常见。

3. 当你需要区分“零值”和“未设置”状态时：使用指针，因为它可以是 nil。

4. 对于 Go 内建的基本类型（int, float, bool, string, byte等）和小 struct，如果不需要修改它们的值，直接按值传递通常更简单、更安全。

5. Go 的 slice 和 map 是引用类型，它们内部已经包含了指向底层数据结构的指针。所以将它们传递给函数时，通常不需要再取地址（除非你想修改 slice 或 map 本身，比如重新分配内存 slice = make(...)）。

