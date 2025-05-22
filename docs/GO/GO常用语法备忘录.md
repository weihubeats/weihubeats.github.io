## 变量定义

```go
	var i int
	var j = 100.12
	name := "weihubeats"

```


## 类型使用

### 数组

```go
    s := [4]string{"aa", "bb"}
    s[3] = "cc"

	// 声明数组存的指针
	s1 := [3]*string{new(string), new(string), new(string)}

    	// 多维数组
	s2 := [4][2]int{{10, 11}, {20, 21}}
	for _, row := range s2 {
		for _, value := range row {
			fmt.Println(value)
		}
	}

```
## 循环

```go
   for a := 0; a < 10; a++ {
      fmt.Printf("a 的值为: %d\n", a)
   }

       for i := range s {
        println(s[i])
    }

    for key, value := range oldMap {
    newMap[key] = value
}
```


## Method（方法）


## 普通方法
```go
func 方法名(参数a, 参数b) (返回值c, 返回值d)  {
	return  "c",true
}

```

```go
func test(a string, b string) (c string, d bool)  {
return  "c",true
}
```

## 类似java的类的方法

```go
func (结构体) 方法名(方法参数) 返回值 {
	// 方法
}
```

```go
func (student *Student) SetName(name string) bool {
	student.name = name
	return true
}