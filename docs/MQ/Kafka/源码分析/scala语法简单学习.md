
## 方法定义

- java

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public void printMessage(String message) {
        System.out.println(message);
    }
}
```

- scala

```scala
object Calculator { // object 用于创建单例对象，类似 Java 的静态方法集合
  def add(a: Int, b: Int): Int = { // 返回类型 Int
    a + b // 最后一条表达式的值即为返回值，可以省略 return
  }

  def addSimplified(a: Int, b: Int) = a + b // 返回类型被推断为 Int

  def printMessage(message: String): Unit = { // Unit 类似 Java 的 void
    println(message)
  }
}

// 使用
val sum = Calculator.add(5, 3) // sum is 8
Calculator.printMessage("Hello from Scala method")
```

- Scala 中 Unit 类型相当于 Java 中的 void
- 如果函数体只有单个表达式，可以省略花括号 {}
- Scala 的 return 关键字是可选的；函数中最后一个表达式的值会自动作为返回值

## 类与构造器

- Java: 构造器与类同名。
- Scala: 类有主构造器 (primary constructor)，其参数直接在类名后定义。辅助构造器 (auxiliary constructors) 使用 this 关键字定义。

```java
public class Person {
    private String name;
    private int age;

    // 主构造器
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 辅助构造器
    public Person(String name) {
        this(name, 0); // 调用主构造器
    }

    public void greet() {
        System.out.println("Hello, my name is " + name + " and I am " + age + " years old.");
    }
}

// 使用
Person person1 = new Person("Alice", 30);
person1.greet();
Person person2 = new Person("Bob");
person2.greet();
```

- Scala

```java
// 主构造器的参数直接跟在类名后面
// 参数前加 val 或 var 会自动成为类的字段
class Person(val name: String, var age: Int) {

  println("Primary constructor called") // 主构造器中的代码直接写在类体中

  // 辅助构造器
  def this(name: String) = {
    this(name, 0) // 必须首先调用主构造器或其他辅助构造器
    println("Auxiliary constructor called")
  }

  def greet(): Unit = {
    println(s"Hello, my name is $name and I am $age years old.") // s-字符串插值
  }
}

// 使用
val person1 = new Person("Alice", 30)
person1.greet()
val person2 = new Person("Bob") // 使用辅助构造器
person2.greet()
person1.age = 31 // age 是 var, 可以修改
// person1.name = "Alicia" // 编译错误，name 是 val (不可变)

```

- Scala 的主构造器非常简洁，直接集成在类定义中
- 类参数前加 val 或 var 会自动创建同名的公共字段和对应的 getter (以及 setter for var)
- Scala 的字符串插值 (s"...") 非常方便


## object (单例对象) vs. Java static

- Java: 使用 static 关键字定义静态成员和方法
- Scala: 没有 static 关键字。取而代之的是 object，用于创建单例对象。如果 object 与某个 class同名，则称之为该类的伴生对象 (Companion Object)，它们可以互相访问对方的私有成员

```java
// 工具类
class MathUtils {
    public static final double PI = 3.14159;
    public static int add(int a, int b) {
        return a + b;
    }
}

// 单例模式 (简单版)
class Logger {
    private static final Logger instance = new Logger();
    private Logger() {}
    public static Logger getInstance() {
        return instance;
    }
    public void log(String message) {
        System.out.println("LOG: " + message);
    }
}

// 使用
System.out.println(MathUtils.PI);
System.out.println(MathUtils.add(2, 3));
Logger.getInstance().log("Application started.");
```

```scala
// 单例对象，类似 Java 的静态工具类
object MathUtils {
  val PI = 3.14159
  def add(a: Int, b: Int): Int = a + b
}

// 单例对象，类似 Java 的单例模式
object Logger {
  def log(message: String): Unit = {
    println(s"LOG: $message")
  }
}

// 伴生对象和伴生类
class Circle(val radius: Double) {
  // 可以访问伴生对象 Circle 的私有成员 (如果 Circle 有的话)
  def area: Double = Circle.PI * radius * radius // 使用伴生对象的 PI
}

object Circle { // Circle 类的伴生对象
  private val PI = 3.1415926535 // 私有成员
  def calculateArea(radius: Double): Double = new Circle(radius).area // 可以访问伴生类的私有构造器 (如果 Circle 构造器是私有的话)
}


// 使用
println(MathUtils.PI)
println(MathUtils.add(2, 3))
Logger.log("Application started.")

val myCircle = new Circle(5.0)
println(s"Area of myCircle: ${myCircle.area}")
println(s"Area calculated by companion object: ${Circle.calculateArea(7.0)}")
```


Scala 的 object 提供了一种更纯粹的面向对象方式来处理 Java 中 static 的场景。
伴生对象和伴生类是非常强大的特性，常用于创建工厂方法或组织辅助功能


## 接口

```java
interface Speaker {
    String speak(); // 抽象方法

    default void announce(String message) { // 默认方法 (Java 8+)
        System.out.println("Announcement: " + message + " from " + speak());
    }
}

interface Runner {
    void run();
}

class Dog implements Speaker, Runner {
    @Override
    public String speak() {
        return "Woof";
    }

    @Override
    public void run() {
        System.out.println("Dog is running");
    }
}

class Person implements Speaker {
    private String name;
    public Person(String name) { this.name = name; }

    @Override
    public String speak() {
        return "Hello, I am " + name;
    }
}

// 使用
Dog dog = new Dog();
System.out.println(dog.speak()); // Woof
dog.announce("Time for a walk!"); // Announcement: Time for a walk! from Woof
dog.run();

Person person = new Person("Alice");
person.announce("Meeting starts soon!"); // Announcement: Meeting starts soon! from Hello, I am Alice
```

- scala

```java
trait Speaker {
  def speak(): String // 抽象方法

  // 具体方法 (类似 Java 8+ 的 default method)
  def announce(message: String): Unit = {
    println(s"Announcement: $message from ${speak()}")
  }
}

trait Runner {
  val speed: Int // 抽象字段 (实现类必须提供)
  def run(): Unit = {
    println(s"Running at $speed km/h")
  }
}

// Dog 混入 Speaker 和 Runner 特质
class Dog(val name: String) extends Speaker with Runner {
  override val speed: Int = 15 // 实现抽象字段

  override def speak(): String = "Woof"

  // 可以选择性地重写 run 方法，或者使用 trait 中提供的默认实现
  override def run(): Unit = {
    println(s"$name the dog is running super fast at $speed km/h!")
  }
}

class Person(val name: String) extends Speaker {
  override def speak(): String = s"Hello, I am $name"
}

// 使用
val dog = new Dog("Buddy")
println(dog.speak()) // Woof
dog.announce("Time for a walk!") // Announcement: Time for a walk! from Woof
dog.run() // Buddy the dog is running super fast at 15 km/h!

val person = new Person("Alice")
person.announce("Meeting starts soon!") // Announcement: Meeting starts soon! from Hello, I am Alice

// Trait 也可以有状态 (字段)
trait HasId {
  var id: Int = 0 // 具体字段，有初始值
  def generateId(): Int = {
    id += 1
    id
  }
}

class User(val username: String) extends HasId {
  this.id = generateId() // 使用 trait 中的方法和字段
}

val user1 = new User("userA")
println(s"${user1.username} has ID: ${user1.id}") // userA has ID: 1
val user2 = new User("userB") // 注意：id 是 HasId 的实例变量，每个混入它的 User 实例都有自己的 id
println(s"${user2.username} has ID: ${user2.id}") // userB has ID: 1 (因为每个 User 实例有自己的 HasId 实例部分)

// 如果希望共享状态，可以将字段定义在伴生对象或通过其他方式共享
```


- Scala 的 trait 非常灵活，既能像接口一样定义契约，又能像抽象类一样提供具体实现和状态，但避免了多重继承的菱形问题 (通过线性化解决)。
- 一个类可以 extends 一个类或一个 trait，然后用 with 关键字混入其他多个 trait。
- trait 可以要求实现它的类提供具体的字段 (val speed: Int)