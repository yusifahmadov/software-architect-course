export type LaneId = "go" | "ds" | "al";

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  why: string;
};

export type Lesson = {
  id: string;
  lane: LaneId;
  title: string;
  requires: string[];
  text: string;
  code: string;
  quiz: QuizQuestion[];
  exercise: string;
};

export const LANE_ORDER: LaneId[] = [
  "go",
  "ds",
  "al"
];

export const LANES: Record<LaneId, { name: string; blurb: string }> = {
  "go": {
    "name": "Go language",
    "blurb": "Learn Go from setup to concurrency and testing. Pass each quiz and finish the exercise to unlock the next skill."
  },
  "ds": {
    "name": "Data structures",
    "blurb": "Learn the core structures and what each costs. Pass each quiz and finish the exercise to unlock the next skill."
  },
  "al": {
    "name": "Algorithms",
    "blurb": "Sorting, searching, recursion, dynamic programming and graph algorithms, ending in a capstone that combines all three tracks."
  }
};

export const CAPSTONE_ID = "c1";

export const LANE_FOR_ROADMAP_ITEM: Record<string, LaneId> = {
  "l0.0": "go",
  "l0.1": "ds",
  "l0.2": "al"
};

export const QUIZ_PASS_RATIO = 0.8;

export const LESSONS: Lesson[] = [
  {
    "id": "g1",
    "lane": "go",
    "title": "Setup and Hello World",
    "requires": [],
    "text": "Install Go from go.dev/dl and check it with go version. A module is a project with a go.mod file; go run . compiles and runs it, and go build produces a binary.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n  fmt.Println(\"Hello, architect\")\n}",
    "quiz": [
      {
        "question": "Which command creates a new module?",
        "options": [
          "go mod init example.com/hello",
          "go new module",
          "go build init"
        ],
        "answer": 0,
        "why": "go mod init writes go.mod, which names the module and tracks dependencies."
      }
    ],
    "exercise": "Create a module, print your name and the Go version using runtime.Version(), then build it into a binary and run that."
  },
  {
    "id": "g2",
    "lane": "go",
    "title": "Types, variables, control flow",
    "requires": [
      "g1"
    ],
    "text": "## Why this lesson matters\n\nVariables, types and control flow are the grammar of every Go program you will ever read or write. Architects review a lot of code, and most bugs they spot in review are not exotic: an integer that silently overflows, a variable shadowed by accident, a loop that captures the wrong value, a string that is measured in bytes when the author meant characters. Learning these basics precisely, rather than roughly, is what lets you read other people's code with confidence.\n\nBy the end you should be able to declare and initialise variables in every form Go offers, explain what zero values are and why they matter, convert between types safely, handle strings and runes correctly, and use if, switch and for in all their forms. You should also know the handful of traps that catch almost every newcomer.\n\n## Declaring variables\n\nGo is statically typed: every variable has a type fixed at compile time. There are three common ways to declare one.\n\n```go\npackage main\n\nimport \"fmt\"\n\nvar appName = \"roadmap\"\n\nfunc main() {\n  var count int\n  var ratio float64 = 0.75\n  name := \"Ada\"\n  fmt.Println(appName, count, ratio, name)\n}\n```\n\nThe var keyword declares a variable, optionally with a type and an initial value. If you give an initial value, the type can be inferred, so var appName = \"roadmap\" is a string. The short declaration := declares and initialises in one step and infers the type. It is only allowed inside functions, and it is by far the most common form there. At package level you must use var.\n\nYou can declare several variables at once, and group related ones in a block.\n\n```go\na, b := 1, 2\na, b = b, a\nvar (\n  host = \"localhost\"\n  port = 8080\n)\n```\n\nThe swap in the second line works because Go evaluates the whole right side before assigning, so you do not need a temporary variable.\n\nGo is strict about unused things. A local variable that is declared but never used is a compile error, and so is an unused import. This feels annoying for the first week and then becomes a quiet benefit: dead code cannot accumulate unnoticed. When you genuinely want to ignore a value, assign it to the blank identifier, written as an underscore.\n\n## Zero values\n\nIf you declare a variable without giving it a value, Go does not leave it undefined. It sets it to the zero value of its type: 0 for numbers, false for bool, the empty string for string, and nil for pointers, slices, maps, channels, functions and interfaces.\n\n```go\nvar n int\nvar s string\nvar ok bool\nvar p *int\nvar xs []int\nfmt.Printf(\"%d %q %t %v %v\\n\", n, s, ok, p, xs)\n```\n\nThis prints 0, an empty quoted string, false, nil and an empty slice. Zero values remove a whole class of bugs that exist in languages with uninitialised memory. Good Go design leans on them: a well-designed type has a zero value that is ready to use. A sync.Mutex works immediately after declaration, and a bytes.Buffer needs no constructor. When you design your own types later, ask yourself whether the zero value can be made useful.\n\n## The basic types\n\nIntegers come in signed and unsigned flavours of fixed width: int8, int16, int32, int64 and uint8, uint16, uint32, uint64. The plain int and uint are 32 or 64 bits depending on the platform, and on modern servers that is 64. Use int by default for counts, lengths and indexes, because that is what len returns and what slices expect. Use sized types only when a format or protocol demands it, such as a 32-bit id in a binary file.\n\nFloating point numbers are float32 and float64. Use float64 unless you have a strong reason not to. Floating point is approximate, so never compare two computed floats with ==, and never use floats for money. Store money as an integer number of cents, or use a decimal library.\n\n```go\nfmt.Println(0.1 + 0.2)\nfmt.Println(0.1+0.2 == 0.3)\n```\n\nThe first line prints something very close to 0.3 but not exactly it, and the second prints false.\n\nThe bool type has values true and false. Go has no truthiness: an if condition must be an actual bool, so if count is a compile error, and you must write if count != 0.\n\nThe string type holds an immutable sequence of bytes, usually UTF-8 text. Two aliases are worth knowing. A byte is another name for uint8. A rune is another name for int32 and represents one Unicode code point. They matter in the next section.\n\nComplex numbers exist but you will rarely meet them.\n\n## Strings, bytes and runes\n\nThis is the area where beginners are surprised most often. len on a string returns the number of bytes, not the number of characters.\n\n```go\ns := \"héllo\"\nfmt.Println(len(s))\nfmt.Println(len([]rune(s)))\n```\n\nThe first line prints 6 because the letter é takes two bytes in UTF-8. The second converts the string to a slice of runes and prints 5, the number of characters. Indexing a string with s[i] gives you one byte, not one character. Ranging over a string, however, decodes UTF-8 and gives you runes.\n\n```go\nfor i, r := range \"héllo\" {\n  fmt.Println(i, string(r))\n}\n```\n\nThe index i here is the byte offset of each rune, so you will see 0, 1, 3, 4, 5, with a gap after é. If you are processing human text, range over the string or convert to runes. If you are processing protocol data, index the bytes.\n\nBecause strings are immutable you cannot assign to s[0]. To build a string from many pieces use strings.Builder, as the Big-O lesson explained, since repeated concatenation copies the string every time. Single quotes make a rune literal such as 'a', double quotes make a string, and backticks make a raw string that may span lines and treats backslashes literally, which is handy for regular expressions and JSON.\n\n## Constants and iota\n\nA constant is declared with const and is fixed at compile time. Numeric constants are untyped until used, which means a constant like 1000 can be used as an int, a float64 or a time.Duration without conversion, and constant arithmetic is done with arbitrary precision.\n\n```go\nconst maxRetries = 3\nconst timeout = 5 * time.Second\n```\n\nFor related named values, Go uses iota, a counter that starts at zero inside each const block and increases by one per line.\n\n```go\ntype Level int\n\nconst (\n  Debug Level = iota\n  Info\n  Warn\n  Error\n)\n```\n\nHere Debug is 0, Info is 1, Warn is 2 and Error is 3. This is the idiomatic replacement for enums. Giving the values their own type, Level, stops you passing an arbitrary int where a level is expected, and lets you attach methods later.\n\n## Converting between types\n\nGo never converts types implicitly, not even between int and int64 or int and float64. You must write the conversion yourself, using the type name as a function.\n\n```go\nvar i int = 42\nvar f float64 = float64(i)\nvar u uint8 = uint8(300)\nfmt.Println(f, u)\n```\n\nThe last conversion is a trap. 300 does not fit in a uint8, so the value wraps around to 44 at run time when the source is a variable. Converting a float to an int truncates toward zero, so int(3.9) is 3 and int(-3.9) is -3. Converting between numbers and strings is not a plain cast either: string(65) gives \"A\", the character with that code, not \"65\". For text conversions use the strconv package: strconv.Itoa(65) gives \"65\" and strconv.Atoi(\"65\") parses it, returning a value and an error.\n\nInteger overflow wraps silently in Go and does not panic. Adding 1 to the largest int64 gives the smallest. If you handle money, sizes or ids from outside your program, check ranges explicitly. Integer division also truncates: 7 / 2 is 3, not 3.5. To get a fractional result, convert one operand to a float first.\n\n## Printing and formatting\n\nThe fmt package is your main debugging tool, so learn its verbs. The verb %v prints a value in a default format, %+v adds field names for structs, %T prints the type, %d prints an integer, %s a string, %q a quoted string, %f a float with an optional precision such as %.2f, and %t a bool. Println adds spaces and a newline, Printf takes a format string and does not add a newline, and Sprintf returns the string instead of printing it.\n\n```go\nfmt.Printf(\"%T %v %.2f %q\\n\", 7, 7, 3.14159, \"hi\")\n```\n\nThis prints int 7 3.14 \"hi\". When something is not what you expect, printing it with %T and %+v tells you its type and shape in seconds.\n\n## Making decisions with if\n\nGo's if has no parentheses around the condition but braces are mandatory. It can include a short initialisation statement before the condition, and the variable declared there exists only inside the if and its else branches.\n\n```go\nif n, err := strconv.Atoi(\"42\"); err != nil {\n  fmt.Println(\"bad number:\", err)\n} else if n > 40 {\n  fmt.Println(\"large\", n)\n} else {\n  fmt.Println(\"small\", n)\n}\n```\n\nThis pattern keeps temporary variables from leaking into the surrounding scope and appears constantly in real code, especially around error handling. A style rule you will see everywhere: when an if branch ends with return, omit the else and let the normal path continue unindented. Handle the failure case first and return early, so the main logic stays at the left margin.\n\n## Choosing with switch\n\nGo's switch is cleaner than in C-like languages. Cases do not fall through, so you never need break to stop at the end of a case. A case can list several values, and the cases are evaluated top to bottom.\n\n```go\nswitch day := time.Now().Weekday(); day {\ncase time.Saturday, time.Sunday:\n  fmt.Println(\"weekend\")\ndefault:\n  fmt.Println(\"weekday\")\n}\n```\n\nA switch with no expression is a tidy replacement for a long chain of if and else if.\n\n```go\nswitch {\ncase score >= 90:\n  fmt.Println(\"A\")\ncase score >= 80:\n  fmt.Println(\"B\")\ndefault:\n  fmt.Println(\"keep going\")\n}\n```\n\nThe fallthrough keyword exists if you truly want the next case to run, but it is rare. There is also a type switch, which branches on the dynamic type of an interface value. You will meet it in the lesson on interfaces.\n\n## Looping with for\n\nGo has exactly one loop keyword, for, in several shapes. The three-part form is familiar:\n\n```go\nfor i := 0; i < 3; i++ {\n  fmt.Println(i)\n}\n```\n\nDrop the init and post statements and it behaves like a while loop. Drop everything and it loops forever until you break out.\n\n```go\nn := 10\nfor n > 1 {\n  n /= 2\n}\nfor {\n  break\n}\n```\n\nThe range form iterates over slices, arrays, strings, maps and channels, and since Go 1.22 also over an integer, which counts from 0 up to one less than the value.\n\n```go\nfor i := range 3 {\n  fmt.Println(i)\n}\nfor i, v := range []string{\"a\", \"b\"} {\n  fmt.Println(i, v)\n}\n```\n\nWith slices, range gives the index and a copy of the element. Modifying the copy does not change the slice, so to update elements use the index: xs[i] = something. With maps, the iteration order is deliberately randomised, so never rely on it. If you need a stable order, collect the keys, sort them, and loop over the sorted keys.\n\nUse break to leave the innermost loop, continue to skip to its next iteration, and labels when you must break out of an outer loop.\n\n```go\nouter:\nfor i := 0; i < 3; i++ {\n  for j := 0; j < 3; j++ {\n    if i*j == 2 {\n      break outer\n    }\n  }\n}\n```\n\nA note on closures: before Go 1.22 the loop variable was shared across all iterations, so goroutines or closures created inside a loop all saw the final value. From Go 1.22 each iteration has its own copy, which removes that classic bug for modules that declare Go 1.22 or later in go.mod. You will still meet old code that works around it.\n\n## Scope and shadowing\n\nA variable is visible from where it is declared to the end of its enclosing block. Blocks are created by functions, if, for, switch and bare braces. An inner declaration with the same name hides the outer one, which is called shadowing.\n\n```go\nx := 1\nif true {\n  x := 2\n  x++\n}\nfmt.Println(x)\n```\n\nThis prints 1. The := inside the if created a new x, so the increment changed the inner one and the outer variable never moved. Shadowing is legal, so the compiler will not warn you, and it is the single most common source of mysterious bugs for people new to the language, especially with err. When you mean to assign to an existing variable use =, and when a result looks stale, check whether a := slipped in. Tools such as go vet with the shadow analyser can help find it.\n\n## A complete example\n\nPut the pieces together in a small program that classifies and summarises a range of numbers.\n\n```go\npackage main\n\nimport \"fmt\"\n\nfunc isPrime(n int) bool {\n  if n < 2 {\n    return false\n  }\n  for d := 2; d*d <= n; d++ {\n    if n%d == 0 {\n      return false\n    }\n  }\n  return true\n}\n\nfunc main() {\n  primes, evens := 0, 0\n  for n := range 30 {\n    switch {\n    case isPrime(n):\n      primes++\n    case n%2 == 0:\n      evens++\n    }\n  }\n  fmt.Printf(\"primes=%d evens=%d\\n\", primes, evens)\n}\n```\n\nRead it slowly. The loop in isPrime only tests divisors up to the square root of n, because any factor larger than that pairs with a smaller one, which makes the check O(sqrt n). The expressionless switch in main places the prime check first, so a prime number such as 2 is counted as a prime and never reaches the even case. Notice how little syntax there is: one loop keyword, one switch, early returns.\n\n## Common mistakes\n\nUsing := at package level, where only var is allowed. Shadowing a variable in an inner block and wondering why the outer value did not change. Assuming len of a string counts characters. Comparing floats with ==. Forgetting that integer division truncates. Converting a large int to a smaller type and getting a wrapped value. Relying on map iteration order. Declaring a variable and not using it, which the compiler will refuse to build.\n\n## Recap\n\nDeclare with var or :=, and remember that every type has a useful zero value. Use int and float64 by default, strings are immutable UTF-8 bytes, and runes are code points. Constants are checked at compile time and iota gives you enums. Convert types explicitly and be careful about overflow and truncation. Go has one loop keyword with several forms, a switch without fall-through, and an if that can carry its own short statement. Watch scope: an accidental := creates a new variable.\n\nNow take the quick check below, then do the exercise. FizzBuzz forces you to combine a loop with a switch, and computing a factorial shows you integer overflow first-hand when you try a larger input, which is a lesson worth seeing with your own eyes.",
    "code": "total := 0\nfor i := 1; i <= 5; i++ {\n  if i%2 == 0 {\n    continue\n  }\n  total += i\n}\nfmt.Println(total)",
    "quiz": [
      {
        "question": "What does len on the string héllo return in Go?",
        "options": [
          "5",
          "6",
          "It does not compile"
        ],
        "answer": 1,
        "why": "len counts bytes, and é takes two bytes in UTF-8. Convert to []rune to count characters."
      },
      {
        "question": "Where is the short declaration := allowed?",
        "options": [
          "Anywhere, including package level",
          "Only inside functions",
          "Only inside main"
        ],
        "answer": 1,
        "why": "At package level you must use var."
      },
      {
        "question": "What is 7 / 2 when both operands are ints?",
        "options": [
          "3.5",
          "4",
          "3"
        ],
        "answer": 2,
        "why": "Integer division truncates. Convert an operand to float64 for a fractional result."
      },
      {
        "question": "After x := 1; if true { x := 2; x++ } what does fmt.Println(x) print?",
        "options": [
          "1, because the inner := shadows x",
          "3",
          "2"
        ],
        "answer": 0,
        "why": "The := created a new inner x, so the outer x never changed."
      },
      {
        "question": "What happens after a Go switch case body finishes?",
        "options": [
          "It falls through to the next case",
          "The switch ends; cases do not fall through by default",
          "The switch restarts"
        ],
        "answer": 1,
        "why": "fallthrough exists but is rare."
      }
    ],
    "exercise": "Print FizzBuzz for 1 to 30, then compute 10 factorial with a loop."
  },
  {
    "id": "g3",
    "lane": "go",
    "title": "Functions, errors, defer",
    "requires": [
      "g2"
    ],
    "text": "## Why this lesson matters\n\nFunctions are how you break a system into pieces you can reason about, and error handling is where Go's philosophy is most visible. Go has no exceptions for ordinary failures. Instead, a function that can fail says so in its signature, and the caller must decide what to do. That makes the failure paths of a Go program explicit, readable and reviewable, which is exactly what an architect wants when judging whether a design is robust.\n\nBy the end you should be able to write functions with multiple results, variadic parameters and closures, create and wrap errors, inspect them with errors.Is and errors.As, use defer to guarantee cleanup, and know when panic is appropriate. Error handling is also where code reviews find the most real defects, so this lesson is worth reading slowly.\n\n## Declaring functions\n\nA function has a name, parameters with types, and result types. The type comes after the name, and consecutive parameters of the same type can share one declaration.\n\n```go\nfunc add(a, b int) int {\n  return a + b\n}\n```\n\nGo passes everything by value: the function receives a copy of each argument. For ints, strings and structs, changes inside the function do not affect the caller's variable. Slices, maps and channels contain internal references, so copying them copies the reference and not the underlying data. A function that appends to a slice or writes to a map can therefore affect the caller's data, which surprises people. When you need the callee to modify a value, pass a pointer, a topic the pointers lesson covers properly.\n\nA function with no result simply omits the result type. Functions are values: you can assign one to a variable, pass it as an argument and return it from another function. That property is the foundation of callbacks, middleware and the functional options pattern you will meet later in API design.\n\n## Multiple return values\n\nA function may return several values, and this is how Go reports failure. The convention is that the error is the last result.\n\n```go\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, errors.New(\"divide by zero\")\n  }\n  return a / b, nil\n}\n\nfunc main() {\n  result, err := divide(10, 4)\n  if err != nil {\n    fmt.Println(\"failed:\", err)\n    return\n  }\n  fmt.Println(result)\n}\n```\n\nBy convention, a function that returns an error returns the zero value for its other results when the error is not nil, and callers should not use those other results in that case. The pattern if err != nil followed by handling or returning is the most common three lines in Go. New developers often find it repetitive. The benefit is that you can see every place where something can go wrong, and no failure can fly past silently like an uncaught exception.\n\nYou can ignore a result by assigning it to the blank identifier, as in value, _ := f(). Do this for errors only when you can justify it in a comment, because an ignored error is usually a bug waiting for production.\n\n## Named results and variadic parameters\n\nResults can be named. The names act as variables that start at their zero values, and a bare return statement returns their current values.\n\n```go\nfunc minMax(nums []int) (min, max int) {\n  if len(nums) == 0 {\n    return\n  }\n  min, max = nums[0], nums[0]\n  for _, n := range nums[1:] {\n    if n < min {\n      min = n\n    }\n    if n > max {\n      max = n\n    }\n  }\n  return\n}\n```\n\nNamed results are useful as documentation when two results have the same type, and essential when a deferred function needs to modify the result, as you will see below. Avoid bare returns in long functions, because the reader has to hunt for what is being returned.\n\nA variadic function accepts any number of trailing arguments of one type, which arrive as a slice. The fmt.Println function is the best known example.\n\n```go\nfunc sum(nums ...int) int {\n  total := 0\n  for _, n := range nums {\n    total += n\n  }\n  return total\n}\n\nfunc main() {\n  fmt.Println(sum(1, 2, 3))\n  xs := []int{4, 5, 6}\n  fmt.Println(sum(xs...))\n}\n```\n\nAppending three dots after a slice spreads it into individual arguments.\n\n## Functions as values and closures\n\nBecause functions are values, you can create them on the spot. An anonymous function that refers to variables from its surrounding scope is called a closure, and it keeps those variables alive.\n\n```go\nfunc counter() func() int {\n  n := 0\n  return func() int {\n    n++\n    return n\n  }\n}\n\nfunc main() {\n  next := counter()\n  fmt.Println(next(), next(), next())\n}\n```\n\nThis prints 1 2 3. Each call to counter creates a fresh n, and the returned function owns it. Closures are how Go implements things like HTTP middleware, retry wrappers and test helpers. A common design is a function that takes another function and wraps it with behaviour such as logging or timing, which lets you add cross-cutting concerns without touching the wrapped code.\n\n## What an error is\n\nThe error type in Go is just an interface with one method.\n\n```go\ntype error interface {\n  Error() string\n}\n```\n\nAny type that has an Error method returning a string is an error. The two quickest ways to create one are errors.New for a fixed message and fmt.Errorf for a formatted one.\n\n```go\nerr1 := errors.New(\"not found\")\nerr2 := fmt.Errorf(\"user %d: %s\", 42, \"not found\")\n```\n\nBecause errors are ordinary values, you can store them, compare them, return them and build your own types. There is nothing magical about them, which is why the language needs no special syntax.\n\n## Adding context by wrapping\n\nWhen an error bubbles up through several layers, the original message such as \"no such file\" is rarely enough to diagnose the problem. Wrap it with context as it travels, using the %w verb in fmt.Errorf.\n\n```go\nfunc loadConfig(path string) ([]byte, error) {\n  data, err := os.ReadFile(path)\n  if err != nil {\n    return nil, fmt.Errorf(\"load config %q: %w\", path, err)\n  }\n  return data, nil\n}\n```\n\nThe resulting message reads like a trail: load config \"app.yaml\": open app.yaml: no such file or directory. The %w verb keeps the original error attached so that callers can still inspect it, whereas using %v would flatten it to text and lose that ability. A good rule: each layer adds what it was trying to do, and no layer repeats what the lower layer already said. Another good rule is to handle an error exactly once. Either log it or return it, but not both, otherwise one failure produces a pile of duplicate log lines.\n\n## Inspecting errors: Is and As\n\nTwo functions in the errors package let you look inside a chain of wrapped errors. The first, errors.Is, asks whether any error in the chain equals a particular value.\n\n```go\n_, err := loadConfig(\"missing.yaml\")\nif errors.Is(err, os.ErrNotExist) {\n  fmt.Println(\"using defaults\")\n}\n```\n\nValues such as os.ErrNotExist or io.EOF are called sentinel errors. You can define your own as package-level variables, for instance var ErrNotFound = errors.New(\"not found\"), so callers can test for them. Never compare errors with == when wrapping is involved, because the wrapped error is a different value. Use errors.Is.\n\nThe second, errors.As, asks whether any error in the chain has a particular type, and copies it into a variable so you can read its fields. This is the way to carry structured information with an error.\n\n```go\ntype ValidationError struct {\n  Field string\n  Msg   string\n}\n\nfunc (e *ValidationError) Error() string {\n  return e.Field + \": \" + e.Msg\n}\n\nfunc validate(age int) error {\n  if age < 0 {\n    return &ValidationError{Field: \"age\", Msg: \"must not be negative\"}\n  }\n  return nil\n}\n\nfunc main() {\n  err := fmt.Errorf(\"signup: %w\", validate(-1))\n  var ve *ValidationError\n  if errors.As(err, &ve) {\n    fmt.Println(\"bad field:\", ve.Field)\n  }\n}\n```\n\nHere errors.As walks the chain, finds the *ValidationError, stores it in ve, and returns true. When a function can return several independent failures, errors.Join combines them into one error that Is and As can still search.\n\nFor architects, the design question is what to expose. Sentinel errors and error types become part of your package's public contract: callers will write code against them, so changing them later breaks users. Expose only the distinctions a caller can usefully act on, such as not found versus permission denied, and keep everything else as plain wrapped text.\n\n## Defer: guaranteed cleanup\n\nThe defer statement schedules a function call to run when the surrounding function returns, whether it returns normally, through an early return, or because of a panic. It is the standard tool for cleanup: closing files, releasing locks, ending timers.\n\n```go\nfunc countLines(path string) (int, error) {\n  f, err := os.Open(path)\n  if err != nil {\n    return 0, err\n  }\n  defer f.Close()\n  scanner := bufio.NewScanner(f)\n  n := 0\n  for scanner.Scan() {\n    n++\n  }\n  return n, scanner.Err()\n}\n```\n\nPlacing defer f.Close() right after the successful open keeps acquisition and release next to each other, so you cannot forget the release on one of several return paths. Three rules explain the behaviour of defer.\n\nFirst, deferred calls run in last in, first out order, so the most recently deferred call runs first, which mirrors how resources are usually nested.\n\nSecond, the arguments of a deferred call are evaluated immediately, when the defer statement executes, not when the call runs.\n\n```go\nx := 1\ndefer fmt.Println(\"deferred sees\", x)\nx = 2\n```\n\nThis prints deferred sees 1, because x was evaluated when the defer statement ran.\n\nThird, a deferred closure can read and change named results, which lets you add context to any error on every return path.\n\n```go\nfunc process(id int) (err error) {\n  defer func() {\n    if err != nil {\n      err = fmt.Errorf(\"process %d: %w\", id, err)\n    }\n  }()\n  return step(id)\n}\n```\n\nBe careful with defer inside loops. Deferred calls only run when the function ends, so opening a file in each iteration of a loop that handles thousands of files and deferring the close will keep them all open until the end. Move the loop body into its own function so each call cleans up when it returns.\n\nAlso remember that Close can fail. For files you write to, an error from Close may mean data was not saved, so check it instead of discarding it blindly.\n\n## Panic and recover\n\nGo does have a panic mechanism for situations that should never happen, such as indexing outside a slice, dereferencing a nil pointer, or detecting a broken internal invariant. A panic unwinds the stack, runs deferred calls, and crashes the program unless something calls recover inside a deferred function.\n\n```go\nfunc safeDivide(a, b int) (result int, err error) {\n  defer func() {\n    if r := recover(); r != nil {\n      err = fmt.Errorf(\"recovered: %v\", r)\n    }\n  }()\n  return a / b, nil\n}\n```\n\nDividing an integer by zero panics, and the deferred function turns that into an error. Use this sparingly. The convention is that libraries return errors for anything a caller could reasonably cause or handle, and panic only for programmer mistakes. The legitimate uses of recover are at a boundary, for example an HTTP server that must not die because one request handler hit a bug, where you log the panic and return a 500 response. Do not use panic as a replacement for exceptions in ordinary control flow.\n\n## Design guidelines for functions\n\nKeep functions small and focused on one task, so the name can describe it fully. Prefer returning errors to logging them and exiting inside library code, so the caller decides policy. Keep parameter lists short; if you find yourself passing six or seven related values, group them in a struct. Make the happy path the unindented path by returning early on errors. Document what a function returns on failure and which errors callers can rely on.\n\n## Common mistakes\n\nIgnoring an error return, which the compiler allows. Using the result of a function without checking its error first. Comparing wrapped errors with == instead of errors.Is. Wrapping with %v and losing the chain. Logging an error and also returning it, so the same failure is reported several times. Deferring inside a long loop. Forgetting that deferred arguments are evaluated immediately. Using panic for expected failures. Returning a nil pointer of a concrete error type as an error, which produces an interface that is not equal to nil; always return a literal nil when there is no error.\n\n## Recap\n\nFunctions take values and can return several, with the error conventionally last. Variadic parameters, named results and closures give you flexibility, and functions are ordinary values. Errors are values satisfying a one-method interface. Wrap them with %w to add context, inspect them with errors.Is and errors.As, and handle each one exactly once. Use defer to guarantee cleanup and remember its last-in-first-out order and eager argument evaluation. Reserve panic for programmer errors and use recover at system boundaries.\n\nTake the quick check, then complete the exercise. Writing parseAge with proper wrapping will make the Is and As patterns concrete, and you will quickly see how a clear error trail saves debugging time.",
    "code": "func divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, errors.New(\"divide by zero\")\n  }\n  return a / b, nil\n}",
    "quiz": [
      {
        "question": "How does idiomatic Go report an ordinary failure?",
        "options": [
          "By throwing an exception",
          "By setting a global error code",
          "By returning an error as the last result"
        ],
        "answer": 2,
        "why": "Errors are ordinary values that callers check explicitly."
      },
      {
        "question": "Which fmt.Errorf verb keeps the original error inspectable by errors.Is?",
        "options": [
          "%w",
          "%v",
          "%s"
        ],
        "answer": 0,
        "why": "%w wraps the error; %v flattens it to text."
      },
      {
        "question": "In what order do deferred calls run?",
        "options": [
          "First in, first out",
          "Last in, first out",
          "Alphabetical order"
        ],
        "answer": 1,
        "why": "The most recently deferred call runs first."
      },
      {
        "question": "When are the arguments of a deferred call evaluated?",
        "options": [
          "When the surrounding function returns",
          "Only if a panic occurs",
          "When the defer statement executes"
        ],
        "answer": 2,
        "why": "defer fmt.Println(x) captures x at the moment of the defer statement."
      },
      {
        "question": "Which function finds an error of a given concrete type in a wrapped chain?",
        "options": [
          "errors.Is",
          "errors.As",
          "errors.Join"
        ],
        "answer": 1,
        "why": "errors.Is compares values; errors.As matches types and fills a variable."
      }
    ],
    "exercise": "Write parseAge(s string) (int, error) using strconv.Atoi. Reject negatives, and wrap errors with fmt.Errorf and the %w verb."
  },
  {
    "id": "g4",
    "lane": "go",
    "title": "Slices, maps, structs",
    "requires": [
      "g3"
    ],
    "text": "## Why this lesson matters\n\nAlmost every real Go program is made of three things: slices to hold ordered collections, maps to look things up by key, and structs to group related data into a meaningful type. Between them they cover most of what you need to model a domain, and they are the building blocks of the data structures you will study in the next track. They also hide the subtleties that cause the most production bugs in Go: slices that share memory unexpectedly, maps that panic on a write, and structs copied when you meant to share them.\n\nBy the end you should understand what a slice really is, predict what append does to capacity and aliasing, use maps safely, design structs with embedding and sensible zero values, and know the cost of each operation so you can choose the right structure.\n\n## Arrays: the fixed foundation\n\nAn array has a fixed length that is part of its type. [3]int and [4]int are different, incompatible types. Arrays are values: assigning one to another copies every element.\n\n```go\na := [3]int{1, 2, 3}\nb := a\nb[0] = 99\nfmt.Println(a, b)\n```\n\nThis prints [1 2 3] [99 2 3], because b is an independent copy. Because the length is baked into the type and copying is expensive for big arrays, you rarely use arrays directly. They matter mainly because slices are built on top of them, and occasionally for small fixed-size things such as a 16-byte id or a checksum.\n\n## Slices: a window onto an array\n\nA slice is the workhorse collection. Internally, a slice value is a small struct of three fields: a pointer to an underlying array, a length, and a capacity. The length is how many elements you can currently see. The capacity is how many elements exist from the start of the slice to the end of the underlying array.\n\n```go\nnums := make([]int, 3, 10)\nfmt.Println(len(nums), cap(nums))\n```\n\nThe make function allocates an array of capacity 10 and returns a slice of length 3 viewing the first three cells, all zero. You can also create a slice with a literal, as in []string{\"a\", \"b\"}, or start with a nil slice by declaring var xs []int. A nil slice has length 0 and capacity 0 and is perfectly usable: you can range over it, take its length, and append to it. This is a good example of useful zero values.\n\nIndexing is O(1) and bounds-checked: reading xs[5] on a slice with length 3 panics. Slicing creates a new window with the expression xs[low:high], which includes low and excludes high, and costs O(1) because it copies no data.\n\n```go\nxs := []int{10, 20, 30, 40, 50}\nys := xs[1:4]\nfmt.Println(ys, len(ys), cap(ys))\n```\n\nThis prints [20 30 40] 3 4. The slice ys shares the same underlying array as xs, starting at index 1, so its capacity extends to the end of that array.\n\n## Append and growth\n\nThe append built-in adds elements and returns a slice, which you must assign back. If there is spare capacity, append writes into the existing array. If not, it allocates a larger array, copies the old elements across, and returns a slice pointing at the new array.\n\n```go\nvar xs []int\nfor i := 0; i < 8; i++ {\n  xs = append(xs, i)\n  fmt.Println(len(xs), cap(xs))\n}\n```\n\nIf you run this, you will see capacity jump at certain moments, for example 1, 2, 4, 8. The runtime roughly doubles capacity for small slices and grows by a smaller factor for large ones, and the exact numbers can differ between Go versions, so never depend on them. The consequence is that append is amortized O(1), as the Big-O lesson explained: occasional copying is spread across many cheap appends.\n\nWhen you know the final size in advance, tell Go. Preallocating avoids repeated reallocation and is one of the cheapest optimisations available.\n\n```go\nout := make([]string, 0, len(input))\nfor _, s := range input {\n  out = append(out, strings.ToUpper(s))\n}\n```\n\n## The aliasing trap\n\nBecause slices share arrays, two slices can see and modify the same elements. This is the most important subtlety in the lesson.\n\n```go\na := []int{1, 2, 3, 4}\nb := a[:2]\nb = append(b, 99)\nfmt.Println(a, b)\n```\n\nThe slice b has length 2 but capacity 4, so append writes 99 into the shared array, overwriting a[2]. The output is [1 2 99 4] [1 2 99]. The program did what the rules say, but not what the author probably intended. The same trap appears when a function receives a slice and appends to it: whether the caller sees the change depends on whether capacity was available, which is unpredictable.\n\nThere are three standard defences. Use copy to make an independent slice when you need one.\n\n```go\nc := make([]int, len(a))\ncopy(c, a)\n```\n\nOr use the full slice expression a[low:high:max], which limits capacity so that an append must reallocate rather than overwrite.\n\n```go\nb := a[:2:2]\nb = append(b, 99)\n```\n\nNow b has capacity 2, the append reallocates, and a is untouched. Or, in a function that returns a modified slice, document clearly that it may reuse the input's memory. There is a related memory trap: a small slice taken from a huge array keeps the whole array alive, so when you retain a few elements of a big buffer for a long time, copy them out.\n\n## Removing and inserting elements\n\nGo has no built-in delete for slices. To remove the element at index i while keeping order, shift the tail left.\n\n```go\nxs = append(xs[:i], xs[i+1:]...)\n```\n\nThis is O(n) because of the shift. The standard library has slices.Delete and slices.Insert which do the same job more safely. If order does not matter, you can overwrite the element with the last one and shrink the slice, which is O(1).\n\n```go\nxs[i] = xs[len(xs)-1]\nxs = xs[:len(xs)-1]\n```\n\nThe slices package, added in Go 1.21, also offers Sort, Contains, Index, Reverse, Max and Min, so reach for it before writing your own loops. For sorting with a custom rule use sort.Slice or slices.SortFunc.\n\n## Maps\n\nA map is an unordered collection of key-value pairs, implemented as a hash table, so lookup, insert and delete are O(1) on average. Create one with make or a literal.\n\n```go\nages := map[string]int{\"ada\": 36, \"linus\": 54}\nages[\"grace\"] = 85\ndelete(ages, \"linus\")\nfmt.Println(len(ages))\n```\n\nReading a missing key returns the zero value of the value type, which makes it impossible to tell absent from zero. Use the comma-ok form to distinguish them.\n\n```go\nif age, ok := ages[\"bob\"]; ok {\n  fmt.Println(\"bob is\", age)\n} else {\n  fmt.Println(\"bob unknown\")\n}\n```\n\nKey types must be comparable: numbers, strings, bools, pointers, arrays and structs of those are fine, but slices, maps and functions cannot be keys. Reading from a nil map is allowed and returns zero values, but writing to a nil map panics, so always initialise with make or a literal before writing.\n\nIteration order is intentionally randomised on every run, so never depend on it. If you need sorted output, collect the keys and sort them.\n\n```go\nkeys := make([]string, 0, len(ages))\nfor k := range ages {\n  keys = append(keys, k)\n}\nsort.Strings(keys)\nfor _, k := range keys {\n  fmt.Println(k, ages[k])\n}\n```\n\nDeleting entries while ranging is allowed. Maps are not safe for concurrent use: if one goroutine writes while another reads or writes, you get a data race and possibly a fatal error. Protect a shared map with a sync.Mutex or use sync.Map for special cases.\n\nTwo idioms are worth memorising. A set is a map with empty struct values, since struct{} takes no memory.\n\n```go\nseen := map[string]struct{}{}\nseen[\"a\"] = struct{}{}\nif _, ok := seen[\"a\"]; ok {\n  fmt.Println(\"present\")\n}\n```\n\nAnd grouping uses a map of slices, where appending to a missing key works because the zero value of a slice is nil.\n\n```go\ngroups := map[int][]string{}\nfor _, w := range words {\n  groups[len(w)] = append(groups[len(w)], w)\n}\n```\n\n## Structs\n\nA struct is a typed collection of named fields. It is Go's way of defining your own data types, and together with methods it plays the role that classes play elsewhere, without inheritance.\n\n```go\ntype Book struct {\n  Title  string\n  Author string\n  Pages  int\n}\n\nb := Book{Title: \"Go in Practice\", Author: \"Matt Butcher\", Pages: 300}\nfmt.Println(b.Title)\n```\n\nAlways use field names in struct literals, as above, because positional literals break silently when fields are added. A field or type name beginning with a capital letter is exported, visible outside its package, and lowercase means private to the package. That single rule is Go's whole visibility system.\n\nThe zero value of a struct is a struct with every field at its own zero value, so var b Book is a valid empty book. Good designs make this zero value meaningful.\n\nStructs are values: assigning or passing one copies all its fields. To share and mutate one, use a pointer. Go lets you access fields through a pointer with the same dot syntax.\n\n```go\nfunc addPages(b *Book, n int) {\n  b.Pages += n\n}\n\naddPages(&b, 20)\n```\n\nThe ampersand takes the address. For large structs, or ones you want to mutate, pass pointers. Remember that copying a struct copies slice and map fields as references, so the copy and the original still share the underlying data. Structs whose fields are all comparable can be compared with ==, and used as map keys.\n\n## Embedding and composition\n\nGo prefers composition to inheritance. You can embed one struct in another by listing the type without a field name, and its fields and methods are promoted.\n\n```go\ntype Timestamps struct {\n  CreatedAt time.Time\n  UpdatedAt time.Time\n}\n\ntype Article struct {\n  Timestamps\n  Title string\n}\n\na := Article{Title: \"Hello\"}\na.CreatedAt = time.Now()\n```\n\nThe Article now has CreatedAt directly, but it is not a subtype of Timestamps: there is no polymorphism through embedding, only convenience. This is a deliberate design: it keeps relationships explicit and avoids deep hierarchies. Later lessons show how interfaces provide the polymorphism.\n\nStruct tags are string annotations after a field, used by libraries such as encoding/json to control names and behaviour.\n\n```go\ntype User struct {\n  ID    int    `json:\"id\"`\n  Email string `json:\"email,omitempty\"`\n}\n```\n\n## Choosing the right structure\n\nUse a slice when order matters or you iterate over everything: cheap appends, O(1) index, O(n) search. Use a map when you look up by key: O(1) average lookup, no order. Use a struct to give a name and meaning to a group of related fields. For a small collection, say under about a dozen items, a slice scan is often faster than a map because of cache friendliness and no hashing. Pick based on access pattern, then measure if it matters, in the spirit of the Big-O lesson.\n\n## A worked example\n\nCount how many books each author has, then print authors in alphabetical order.\n\n```go\npackage main\n\nimport (\n  \"fmt\"\n  \"sort\"\n)\n\ntype Book struct {\n  Title  string\n  Author string\n}\n\nfunc main() {\n  books := []Book{\n    {\"Dune\", \"Herbert\"},\n    {\"Emma\", \"Austen\"},\n    {\"Persuasion\", \"Austen\"},\n  }\n  counts := make(map[string]int)\n  for _, b := range books {\n    counts[b.Author]++\n  }\n  authors := make([]string, 0, len(counts))\n  for a := range counts {\n    authors = append(authors, a)\n  }\n  sort.Strings(authors)\n  for _, a := range authors {\n    fmt.Println(a, counts[a])\n  }\n}\n```\n\nNotice the three structures cooperating: a slice of structs as input, a map for counting, and another slice to impose order. The expression counts[b.Author]++ works for a missing key because the zero value of int is 0. This small shape, load into a map, extract, sort, print, appears in a huge share of real programs.\n\n## Common mistakes\n\nForgetting to assign the result of append. Modifying a slice through an alias without realising. Writing to a nil map. Relying on map order. Expecting a struct passed by value to be modified by the callee. Ranging over a slice of structs and changing the loop copy, so that the slice is unchanged: use the index to modify. Keeping a tiny slice of a huge buffer alive. Using a slice or map as a map key.\n\n## Recap\n\nAn array is a fixed-size value, and a slice is a pointer, length and capacity viewing an array. Append is amortized O(1) but may or may not reallocate, so beware aliasing and use copy or three-index slices when needed. Maps give O(1) average lookup, use comma-ok to detect absence, must be initialised before writing, and iterate in random order. Structs group fields, copy by value, and compose through embedding rather than inheritance. Choose structures by access pattern.\n\nTake the quick check, then write the word-frequency counter. It combines a map for counting, a slice for ordering and sort.Slice with a custom comparison, which is the same pattern as the worked example, but with a more interesting sort order.",
    "code": "nums := []int{1, 2, 3}\nnums = append(nums, 4)\nages := map[string]int{\"ada\": 36}\nif age, ok := ages[\"bob\"]; !ok {\n  fmt.Println(\"missing\", age)\n}",
    "quiz": [
      {
        "question": "A slice value is made of which three parts?",
        "options": [
          "Start, end, step",
          "Array, hash, size",
          "Pointer, length, capacity"
        ],
        "answer": 2,
        "why": "The pointer refers to an underlying array."
      },
      {
        "question": "a := []int{1,2,3,4}; b := a[:2]; b = append(b, 99). What happens to a?",
        "options": [
          "a[2] becomes 99 because they share an array",
          "a is unchanged",
          "It fails to compile"
        ],
        "answer": 0,
        "why": "b has spare capacity, so append writes into the shared array."
      },
      {
        "question": "What happens when you write to a nil map?",
        "options": [
          "It panics",
          "It creates the map",
          "The write is ignored"
        ],
        "answer": 0,
        "why": "Always initialise maps with make or a literal before writing."
      },
      {
        "question": "How do you tell a missing key from a key holding the zero value?",
        "options": [
          "Compare the result to nil",
          "Use v, ok := m[k]",
          "Call len on the value"
        ],
        "answer": 1,
        "why": "The comma-ok form reports whether the key exists."
      },
      {
        "question": "Which type cannot be a map key?",
        "options": [
          "string",
          "a struct of ints",
          "a slice"
        ],
        "answer": 2,
        "why": "Keys must be comparable; slices, maps and functions are not."
      }
    ],
    "exercise": "Write a word-frequency counter for a string. Print words sorted by count using sort.Slice."
  },
  {
    "id": "g5",
    "lane": "go",
    "title": "Methods and interfaces",
    "requires": [
      "g4"
    ],
    "text": "## Why this lesson matters\n\nInterfaces are the most important design tool in Go, and they are the first place where Go code starts to look like architecture rather than syntax. An interface lets one part of a program depend on behaviour rather than on a concrete type, which is the foundation of testability, replaceable components, and the ports-and-adapters style you will study at Level 2 of the roadmap. Go's version is unusually light: there is no implements keyword, and a type satisfies an interface just by having the right methods.\n\nBy the end of this lesson you should be able to attach methods to your own types, choose between value and pointer receivers, define and use small interfaces, use type assertions and type switches, avoid the nil-interface trap, and apply the guideline to accept interfaces and return concrete types.\n\n## Methods\n\nA method is a function with a special receiver argument that appears between the func keyword and the method name. The receiver ties the function to a type.\n\n```go\ntype Rect struct {\n  W, H float64\n}\n\nfunc (r Rect) Area() float64 {\n  return r.W * r.H\n}\n\nfunc (r Rect) Perimeter() float64 {\n  return 2 * (r.W + r.H)\n}\n\nfunc main() {\n  r := Rect{W: 3, H: 4}\n  fmt.Println(r.Area(), r.Perimeter())\n}\n```\n\nMethods are defined outside the struct declaration, anywhere in the same package as the type. You can attach methods to any type you define in your package, not only structs.\n\n```go\ntype Celsius float64\n\nfunc (c Celsius) Fahrenheit() float64 {\n  return float64(c)*9/5 + 32\n}\n```\n\nYou cannot add methods to types from other packages, including built-ins like int or string, but you can define your own type based on one, as above, and give it behaviour. This is a cheap, effective way to make code self-documenting: a Celsius value cannot be accidentally passed where a distance is expected.\n\nGo has constructors only by convention. A plain function named NewSomething returns a ready-to-use value, which is useful when the zero value is not enough, for example when a map field must be initialised.\n\n```go\nfunc NewRegistry() *Registry {\n  return &Registry{items: make(map[string]int)}\n}\n```\n\n## Value receivers and pointer receivers\n\nA receiver can be a value, as in func (r Rect), or a pointer, as in func (r *Rect). The difference follows the rule you already know: Go passes everything by copy. A value receiver gets a copy of the struct, so changes inside the method are lost. A pointer receiver gets the address, so the method can modify the original.\n\n```go\nfunc (r Rect) ScaleCopy(k float64) Rect {\n  r.W *= k\n  r.H *= k\n  return r\n}\n\nfunc (r *Rect) Scale(k float64) {\n  r.W *= k\n  r.H *= k\n}\n```\n\nCalling r.Scale(2) on an addressable variable works even though r is not a pointer: Go takes the address for you. The practical guidelines are simple. Use a pointer receiver when the method modifies the receiver, when the struct is large and copying would be wasteful, or when the type contains something that must not be copied such as a sync.Mutex. Use a value receiver for small immutable-style types such as a point or a time. Above all, be consistent: if any method of a type needs a pointer receiver, give all methods of that type pointer receivers, so the type has one clear behaviour.\n\n## Interfaces\n\nAn interface type is a set of method signatures. Any type that has all those methods satisfies the interface automatically.\n\n```go\ntype Shape interface {\n  Area() float64\n}\n\ntype Circle struct {\n  R float64\n}\n\nfunc (c Circle) Area() float64 {\n  return math.Pi * c.R * c.R\n}\n\nfunc totalArea(shapes []Shape) float64 {\n  total := 0.0\n  for _, s := range shapes {\n    total += s.Area()\n  }\n  return total\n}\n\nfunc main() {\n  shapes := []Shape{Rect{W: 3, H: 4}, Circle{R: 1}}\n  fmt.Println(totalArea(shapes))\n}\n```\n\nNeither Rect nor Circle mentions Shape anywhere. They satisfy it purely because they have an Area method returning float64. This implicit satisfaction is called structural typing, and it has a profound architectural effect: the package that defines a type does not need to know about the interfaces other packages will invent for it. Dependencies point from the user of behaviour to the abstraction, not from implementers to a central interface file, so packages stay decoupled.\n\nBehind the scenes, an interface value holds two things: the concrete value and its dynamic type. You call a method on the interface and Go dispatches to the right implementation at run time, which is how polymorphism works in Go without inheritance.\n\n## Method sets and the pointer trap\n\nWhich methods does a type have for the purpose of satisfying an interface? The rule: the method set of a value of type T includes only methods with value receivers, while the method set of *T includes methods with both receiver kinds.\n\n```go\ntype Counter struct{ n int }\n\nfunc (c *Counter) Inc() { c.n++ }\n\ntype Incrementer interface{ Inc() }\n\nvar a Incrementer = &Counter{}\n```\n\nThis compiles. The line var b Incrementer = Counter{} does not, because Inc has a pointer receiver and a plain Counter value does not have it in its method set. The compiler error says the type does not implement the interface and that the method has a pointer receiver. The fix is to store &Counter{}. This rule also explains why you should keep receivers consistent within a type.\n\nIf you want the compiler to verify that a type satisfies an interface at the place you declare it, rather than far away where it is used, add a blank-identifier assertion.\n\n```go\nvar _ Shape = Circle{}\nvar _ Incrementer = (*Counter)(nil)\n```\n\nThese lines produce no code but fail to compile if the type stops matching.\n\n## Small interfaces and the standard library\n\nThe best Go interfaces are tiny, often one or two methods. The standard library shows the style. The io.Reader interface has one method, Read, and io.Writer has one, Write. Because they are so small, hundreds of types satisfy them: files, network connections, buffers, compressors, HTTP bodies. A function that takes an io.Reader works with all of them.\n\n```go\nfunc countBytes(r io.Reader) (int, error) {\n  n, err := io.Copy(io.Discard, r)\n  return int(n), err\n}\n\nfunc main() {\n  n, _ := countBytes(strings.NewReader(\"hello\"))\n  fmt.Println(n)\n}\n```\n\nThis function can read from a file, a socket or a string without changing a line. The same idea underlies the fmt.Stringer interface, whose single method String() string lets any type control how it is printed, and the error interface from the previous lesson.\n\nA famous proverb states the principle: the bigger the interface, the weaker the abstraction. A ten-method interface is hard to implement, hard to fake in tests, and tends to leak implementation details. Prefer several small interfaces and compose them when needed by embedding one interface in another.\n\n```go\ntype ReadWriter interface {\n  io.Reader\n  io.Writer\n}\n```\n\n## Accept interfaces, return structs\n\nA widely used guideline says that functions should accept interfaces as parameters and return concrete types. Accepting an interface makes the function flexible and easy to test. Returning a concrete type gives callers the full set of fields and methods without forcing them to cast. It also lets you add methods later without breaking anyone, whereas adding a method to a published interface breaks every implementer.\n\nA second guideline: define an interface where it is used, not where the type is defined. If your service needs to save users, declare a small UserSaver interface in your service package with only the method you call. Then any database layer that happens to have that method fits, and you can pass a fake in tests.\n\n```go\ntype UserSaver interface {\n  Save(u User) error\n}\n\ntype Service struct {\n  store UserSaver\n}\n\nfunc NewService(s UserSaver) *Service {\n  return &Service{store: s}\n}\n```\n\nIn production you pass the real database implementation. In a test you pass a tiny struct that records calls and returns a chosen error. This is dependency injection with no framework, and it is the idiomatic Go form of the hexagonal architecture idea: your core logic depends on a port, the interface, and adapters plug in behind it.\n\n## The empty interface, assertions and type switches\n\nThe empty interface, spelled interface{} and given the alias any since Go 1.18, has no methods, so every type satisfies it. It can hold anything, but you cannot do anything with the value until you recover its type. Use it sparingly: it removes the compiler's help.\n\nA type assertion extracts the concrete value from an interface. The comma-ok form avoids a panic if you are wrong.\n\n```go\nvar x any = \"hello\"\ns, ok := x.(string)\nfmt.Println(s, ok)\nn, ok := x.(int)\nfmt.Println(n, ok)\n```\n\nThe first assertion succeeds. The second returns 0 and false. Without the comma-ok, a failed assertion panics. When you need to handle several possible types, use a type switch.\n\n```go\nfunc describe(v any) string {\n  switch t := v.(type) {\n  case int:\n    return fmt.Sprintf(\"int %d\", t)\n  case string:\n    return \"string \" + t\n  case Shape:\n    return fmt.Sprintf(\"shape with area %.1f\", t.Area())\n  default:\n    return \"unknown\"\n  }\n}\n```\n\nInside each case, t has the matching type. Note that a case can name an interface, so you can ask whether a value also supports some optional capability. The standard library uses this pattern, for example checking whether a writer also implements io.StringWriter and using the faster path if it does.\n\n## The nil interface trap\n\nAn interface value is nil only when both its dynamic type and value are nil. If you store a nil pointer of a concrete type inside an interface, the interface is not nil, because its type part is set.\n\n```go\ntype MyErr struct{}\n\nfunc (*MyErr) Error() string { return \"boom\" }\n\nfunc mayFail(fail bool) error {\n  var e *MyErr\n  if fail {\n    e = &MyErr{}\n  }\n  return e\n}\n\nfunc main() {\n  fmt.Println(mayFail(false) == nil)\n}\n```\n\nThis prints false, even though no failure occurred, because the returned error holds a typed nil pointer. Callers checking err != nil will believe something went wrong. The cure is to return an explicit literal nil in the success path rather than a nil variable of a concrete type. This is one of the best-known Go gotchas and the reason a function that returns an error should declare the result as the error interface and return nil directly.\n\n## When not to use an interface\n\nDo not create an interface just because you have a struct. If there is only one implementation and no need to substitute it, an interface adds indirection with no benefit. Interfaces are discovered, not planned: write concrete code first, and when a second implementation or a testing need appears, extract the smallest interface at the point of use. Premature interfaces are a common architecture smell in code written by people coming from heavily object-oriented languages.\n\n## Common mistakes\n\nDefining large interfaces that mirror an entire struct. Placing interfaces next to implementations rather than next to consumers. Mixing value and pointer receivers on one type. Storing a value type in an interface when the methods need pointer receivers. Returning a typed nil as an error. Overusing any and losing type safety. Adding an interface for every struct before there is a reason.\n\n## Recap\n\nMethods attach behaviour to types, with value receivers for read-only small types and pointer receivers for mutation or large and non-copyable ones, used consistently. Interfaces are sets of method signatures satisfied implicitly, which decouples packages. Keep interfaces small, define them where they are consumed, accept interfaces and return concrete types, and use type assertions or type switches when you must recover the concrete type. Beware the method-set rule and the typed-nil trap.\n\nDo the quick check, then the exercise: add a Circle to the Shape example and write a function that sums the areas of a slice of shapes. Once it works, add a third shape and notice that the summing function does not need to change at all. That small experience is the open-closed principle in action.",
    "code": "type Shape interface{ Area() float64 }\n\ntype Rect struct{ W, H float64 }\n\nfunc (r Rect) Area() float64 { return r.W * r.H }",
    "quiz": [
      {
        "question": "How does a Go type satisfy an interface?",
        "options": [
          "By inheriting from a base class",
          "By declaring implements",
          "By having the required methods"
        ],
        "answer": 2,
        "why": "Satisfaction is implicit."
      },
      {
        "question": "Counter has func (c *Counter) Inc(). Can a plain Counter value satisfy an interface requiring Inc?",
        "options": [
          "No, only *Counter has Inc in its method set",
          "Yes, always",
          "Only inside goroutines"
        ],
        "answer": 0,
        "why": "Value method sets include only value-receiver methods."
      },
      {
        "question": "Which guideline is commonly followed?",
        "options": [
          "Accept concrete types, return interfaces",
          "Accept interfaces, return concrete types",
          "Always use any"
        ],
        "answer": 1,
        "why": "It keeps functions flexible and results rich."
      },
      {
        "question": "A nil *MyErr is returned inside an error interface. What does err != nil report?",
        "options": [
          "false",
          "It panics",
          "true, because the interface holds a type"
        ],
        "answer": 2,
        "why": "An interface is nil only when both type and value are nil."
      },
      {
        "question": "Where is it best to define a small interface?",
        "options": [
          "In the package that consumes it",
          "Next to the implementing type",
          "In a global interfaces package"
        ],
        "answer": 0,
        "why": "Consumer-side interfaces keep packages decoupled."
      }
    ],
    "exercise": "Add a Circle type and a function that sums the areas of a []Shape."
  },
  {
    "id": "g6",
    "lane": "go",
    "title": "Goroutines, channels, testing",
    "requires": [
      "g5"
    ],
    "text": "## Why this lesson matters\n\nConcurrency is the reason many teams choose Go, and testing is the habit that keeps concurrent code from turning into folklore. As an architect you will be asked whether a service can handle many requests at once, how work should be divided, and how to prove that a change did not break anything. This lesson gives you the vocabulary and the working tools for all three: goroutines for running work concurrently, channels and mutexes for coordinating it, and Go's built-in testing framework for checking it.\n\nBy the end you should be able to start goroutines and wait for them, recognise and fix a data race, send values over channels, use select and contexts for timeouts and cancellation, build a simple worker pool, and write table-driven tests, including tests that detect races.\n\n## Concurrency is not parallelism\n\nConcurrency is about structuring a program as independent tasks that can make progress in overlapping time. Parallelism is about literally executing several tasks at the same instant on multiple CPU cores. A concurrent design may run in parallel when cores are available, but it is still correct on one core. Go's runtime scheduler takes your goroutines and multiplexes them onto a small number of operating system threads, so you can have tens of thousands of goroutines without exhausting the machine.\n\n## Goroutines\n\nA goroutine is a lightweight function running concurrently. You start one by putting the keyword go before a function call. It begins with a stack of only a few kilobytes that grows as needed, which is why goroutines are so cheap compared with OS threads.\n\n```go\nfunc main() {\n  go fmt.Println(\"from a goroutine\")\n  fmt.Println(\"from main\")\n}\n```\n\nIf you run this you will often see only the second line, because main returns and the program exits before the goroutine gets scheduled. The program ends when main ends, regardless of what other goroutines are doing. You need a way to wait. The standard tool is sync.WaitGroup, a counter that you increase before starting each goroutine, decrease when it finishes, and wait on.\n\n```go\nfunc main() {\n  var wg sync.WaitGroup\n  for i := 0; i < 3; i++ {\n    wg.Add(1)\n    go func() {\n      defer wg.Done()\n      fmt.Println(\"worker\", i)\n    }()\n  }\n  wg.Wait()\n}\n```\n\nCall Add before the go statement, not inside the goroutine, otherwise Wait might run first and return too early. The output order varies from run to run, because the scheduler decides, so never write code that depends on the order. In modules using Go 1.22 or later, each loop iteration has its own copy of i, so each goroutine prints a distinct number. In older code you will see i passed as an argument to avoid sharing the variable.\n\n## Data races and mutexes\n\nWhen several goroutines access the same variable and at least one of them writes, without synchronisation, you have a data race. The result is undefined: lost updates, corrupt data, or crashes that appear once a week in production.\n\n```go\ncount := 0\nvar wg sync.WaitGroup\nfor i := 0; i < 1000; i++ {\n  wg.Add(1)\n  go func() {\n    defer wg.Done()\n    count++\n  }()\n}\nwg.Wait()\nfmt.Println(count)\n```\n\nYou expect 1000 and will often get less, because count++ is really three steps, read, add, write, and goroutines interleave between them. Protect shared state with a mutex.\n\n```go\nvar mu sync.Mutex\nmu.Lock()\ncount++\nmu.Unlock()\n```\n\nThe usual style is to put the mutex inside the struct that owns the data and lock with a deferred unlock, so every return path releases the lock. For a simple counter, the sync/atomic package offers lock-free operations such as atomic.Int64 with Add and Load. When reads vastly outnumber writes, sync.RWMutex lets many readers hold the lock together.\n\nGo ships a race detector. Run go test -race or go run -race and it reports races as they happen, with the stack traces of both accesses. Make it part of your continuous integration, because races are among the hardest bugs to find by reading code.\n\n## Channels\n\nGo's concurrency motto is: do not communicate by sharing memory; share memory by communicating. A channel is a typed pipe between goroutines. You create one with make, send with the arrow operator pointing into it, and receive with the arrow pointing out.\n\n```go\nch := make(chan int)\ngo func() {\n  ch <- 42\n}()\nv := <-ch\nfmt.Println(v)\n```\n\nOn an unbuffered channel, a send blocks until another goroutine receives, and a receive blocks until another goroutine sends, so the two meet and synchronise. That meeting is itself a guarantee about ordering: everything that happened before the send is visible after the receive. A buffered channel, made with make(chan int, 5), lets up to five sends complete without a receiver, and blocks only when the buffer is full. Buffers smooth out bursts, but they do not fix an imbalance between producers and consumers; they only delay the moment of blocking.\n\nThe sender can close a channel to signal that no more values are coming. Receivers can then drain it with range, which stops automatically at the close.\n\n```go\nfunc produce(n int) <-chan int {\n  out := make(chan int)\n  go func() {\n    defer close(out)\n    for i := 0; i < n; i++ {\n      out <- i\n    }\n  }()\n  return out\n}\n\nfunc main() {\n  for v := range produce(3) {\n    fmt.Println(v)\n  }\n}\n```\n\nNotice the return type <-chan int, a receive-only channel. Declaring direction in signatures documents intent and lets the compiler stop misuse. Two rules prevent common panics: only the sender should close a channel, and sending on a closed channel panics. Receiving from a closed channel returns the zero value immediately, and the form v, ok := <-ch tells you whether the channel was closed.\n\nIf all goroutines are blocked waiting, the runtime detects it and aborts with the message all goroutines are asleep, deadlock. A deadlock inside a larger program that still has other running goroutines will not be reported, it will simply hang, so design shutdown paths deliberately.\n\n## Select and timeouts\n\nThe select statement waits on several channel operations and proceeds with whichever is ready first, like a switch for channels.\n\n```go\nselect {\ncase msg := <-messages:\n  fmt.Println(\"got\", msg)\ncase <-time.After(2 * time.Second):\n  fmt.Println(\"timeout\")\n}\n```\n\nAdding a default case makes the select non-blocking. Select is the building block for timeouts, heartbeats, and for combining several inputs.\n\n## Context: cancellation and deadlines\n\nReal services need to stop work when a client disconnects or a deadline passes. The context package standardises that. A context carries a cancellation signal, an optional deadline, and request-scoped values. By convention it is the first parameter of a function and is named ctx.\n\n```go\nfunc worker(ctx context.Context, jobs <-chan int) {\n  for {\n    select {\n    case <-ctx.Done():\n      return\n    case j := <-jobs:\n      fmt.Println(\"job\", j)\n    }\n  }\n}\n\nfunc main() {\n  ctx, cancel := context.WithTimeout(context.Background(), time.Second)\n  defer cancel()\n  worker(ctx, make(chan int))\n}\n```\n\nWhen the timeout expires, ctx.Done() is closed, the worker returns, and nothing leaks. Always call the cancel function, usually with defer. Pass the context down through every call chain that can block, such as database queries and HTTP requests, so cancellation propagates. Failing to stop goroutines leaves them blocked forever, which is called a goroutine leak, and it slowly eats memory in long-running services. Every goroutine you start should have a clear answer to the question: how does it end?\n\n## A worker pool\n\nA very common pattern splits a list of jobs among a fixed number of workers.\n\n```go\nfunc squareAll(nums []int, workers int) []int {\n  jobs := make(chan int)\n  results := make(chan int)\n  var wg sync.WaitGroup\n  for w := 0; w < workers; w++ {\n    wg.Add(1)\n    go func() {\n      defer wg.Done()\n      for n := range jobs {\n        results <- n * n\n      }\n    }()\n  }\n  go func() {\n    for _, n := range nums {\n      jobs <- n\n    }\n    close(jobs)\n  }()\n  go func() {\n    wg.Wait()\n    close(results)\n  }()\n  var out []int\n  for r := range results {\n    out = append(out, r)\n  }\n  return out\n}\n```\n\nFollow the data. One goroutine feeds numbers into jobs and closes it when done. The workers read until jobs is closed, then finish. A third goroutine waits for all workers and closes results, which ends the final range loop. Results arrive in arbitrary order, so if order matters you must carry an index with each job or sort afterwards. The number of workers bounds resource use: this is how you protect a database from being hit by ten thousand simultaneous queries. For production code, the golang.org/x/sync/errgroup package adds error collection and cancellation on top of this idea.\n\n## Testing in Go\n\nTesting is built into the language and the go tool. A test lives in a file whose name ends in _test.go, in the same package. A test function starts with Test and takes a *testing.T.\n\n```go\nfunc Add(a, b int) int {\n  return a + b\n}\n\nfunc TestAdd(t *testing.T) {\n  got := Add(2, 3)\n  if got != 5 {\n    t.Fatalf(\"Add(2, 3) = %d, want 5\", got)\n  }\n}\n```\n\nRun all tests in the module with go test ./... . The method t.Errorf records a failure and continues, while t.Fatalf records it and stops that test immediately. A message in the form got versus want makes failures easy to read.\n\nThe idiomatic style is the table-driven test: describe cases as data in a slice of structs and loop over them, using t.Run to create a named subtest for each.\n\n```go\nfunc TestAddTable(t *testing.T) {\n  tests := []struct {\n    name string\n    a, b int\n    want int\n  }{\n    {\"positives\", 2, 3, 5},\n    {\"zero\", 0, 7, 7},\n    {\"negatives\", -2, -3, -5},\n  }\n  for _, tc := range tests {\n    t.Run(tc.name, func(t *testing.T) {\n      if got := Add(tc.a, tc.b); got != tc.want {\n        t.Errorf(\"got %d, want %d\", got, tc.want)\n      }\n    })\n  }\n}\n```\n\nAdding a case is one line, failures name the exact case, and you can run one with go test -run TestAddTable/zero. Useful flags include -v for verbose output, -cover for coverage, -race for the race detector, and -count=1 to bypass cached results. Call t.Helper() inside assertion helper functions so failures report the caller's line, and t.Parallel() to let independent tests run at the same time.\n\nTo test the worker pool, remember the order is not fixed, so sort before comparing.\n\n```go\nfunc TestSquareAll(t *testing.T) {\n  got := squareAll([]int{1, 2, 3, 4}, 3)\n  sort.Ints(got)\n  want := []int{1, 4, 9, 16}\n  if !slices.Equal(got, want) {\n    t.Fatalf(\"got %v, want %v\", got, want)\n  }\n}\n```\n\nRun it with go test -race. Test the contract, not the scheduling. Avoid sleeping to wait for goroutines; use channels, WaitGroups or contexts, because sleeps make tests slow and flaky. For code that talks to the network, the standard library offers net/http/httptest, which starts a local test server, and interfaces from the previous lesson let you substitute fakes for databases and clients.\n\n## Common mistakes\n\nStarting a goroutine and returning without waiting. Calling wg.Add inside the goroutine. Sharing a variable between goroutines without a mutex or channel. Closing a channel from the receiver, or closing it twice. Forgetting that a nil channel blocks forever. Leaking goroutines that wait on a channel nobody will ever write to. Ignoring context cancellation. Writing tests that depend on timing or goroutine order. Not running the race detector.\n\n## Recap\n\nGoroutines are cheap concurrent functions started with go, and the program ends when main ends, so wait with a WaitGroup. Shared mutable state needs a mutex or atomic operation, and the race detector finds mistakes. Channels pass values and synchronise, closing signals completion and only senders close. Select multiplexes channel operations, and context carries cancellation and deadlines through your call chain. Worker pools bound concurrency. Go tests live in _test.go files, table-driven tests with t.Run are the standard style, and go test -race ./... belongs in every pipeline.\n\nTake the quick check, then do the exercise: start five goroutines that send their indexes into a channel and sum the results, then write a table-driven test for a function of your own. Finish by running both with the race detector enabled to confirm they are clean.",
    "code": "func TestAdd(t *testing.T) {\n  if got := Add(2, 3); got != 5 {\n    t.Fatalf(\"got %d, want 5\", got)\n  }\n}",
    "quiz": [
      {
        "question": "What happens to running goroutines when main returns?",
        "options": [
          "They finish first",
          "They keep running in the background",
          "The program exits and they stop"
        ],
        "answer": 2,
        "why": "Use a WaitGroup or channel to wait."
      },
      {
        "question": "Which command detects data races?",
        "options": [
          "go test -race",
          "go vet",
          "go fmt"
        ],
        "answer": 0,
        "why": "The race detector reports conflicting accesses with stack traces."
      },
      {
        "question": "Who should close a channel?",
        "options": [
          "The receiver",
          "The sender",
          "Any goroutine at any time"
        ],
        "answer": 1,
        "why": "Sending on a closed channel panics."
      },
      {
        "question": "Why call wg.Add(1) before the go statement?",
        "options": [
          "Go requires alphabetical order",
          "It makes the goroutine faster",
          "So Wait cannot return too early"
        ],
        "answer": 2,
        "why": "Add inside the goroutine can race with Wait."
      },
      {
        "question": "What is a table-driven test?",
        "options": [
          "A test of map types",
          "A slice of cases run in a loop with t.Run subtests",
          "A test that reads a database table"
        ],
        "answer": 1,
        "why": "Adding a case is one line, and failures name the case."
      }
    ],
    "exercise": "Start 5 goroutines that each send their index on a channel, and sum the results. Then write a table-driven test for a function of your own."
  },
  {
    "id": "d1",
    "lane": "ds",
    "title": "Big-O and measuring cost",
    "requires": [],
    "text": "## Why an architect starts here\n\nEvery design decision you will make later, from picking a database index to splitting a monolith, is at some level a statement about how cost grows as load grows. Big-O is the shared language for that statement. It will not tell you how many milliseconds a request takes. It tells you what happens to the cost when the input gets ten times or a thousand times bigger, and that is the question that separates a system that survives its first successful launch from one that falls over.\n\nBy the end of this lesson you should be able to look at a piece of Go code and say how its running time grows, explain why some fast-looking code does not scale, measure the real cost with Go's built-in tools, and carry the same thinking up to the level of services and queries.\n\n## What we are actually measuring\n\nBig-O describes how the number of basic steps an algorithm performs grows with the size of its input. We call the input size n. For a slice, n is its length. For a string, its number of characters. For a graph, it is usually the number of nodes and edges, written V and E. For a database query, it might be the number of rows scanned.\n\nA basic step is anything that takes roughly constant time: comparing two ints, adding two numbers, reading or writing one slice element by index, or looking at one map key. We do not care whether a step takes one nanosecond or three. We care about how the count of steps grows.\n\nHere is the smallest example. Summing a slice touches every element exactly once:\n\n```go\nfunc Sum(nums []int) int {\n  total := 0\n  for _, n := range nums {\n    total += n\n  }\n  return total\n}\n```\n\nIf nums has 1,000 elements the loop body runs 1,000 times. With 2,000 elements it runs 2,000 times. The work grows in a straight line with n, so we say Sum is O(n), read as \"order n\" or \"linear time\".\n\n## The growth rates you must know\n\nThere are only a handful of growth rates that show up in everyday engineering. Learn to recognise each by its shape in code.\n\nO(1), constant time. The cost does not depend on n. Reading an element by index, pushing onto the end of a slice (usually), reading a value from a map, or checking whether a number is even are all O(1).\n\n```go\nfunc First(nums []int) int {\n  return nums[0]\n}\n```\n\nWhether the slice holds ten items or ten million, this does one step.\n\nO(log n), logarithmic time. The cost grows by one step each time n doubles. This happens when each step throws away a fixed fraction, usually half, of the remaining work. Binary search is the classic case. For n = 1,000,000, log base 2 of n is about 20, so you need roughly 20 comparisons. For n = 1,000,000,000 you need about 30. This is why logarithmic algorithms feel almost free even at huge scale.\n\n```go\nfunc Contains(sorted []int, x int) bool {\n  lo, hi := 0, len(sorted)\n  for lo < hi {\n    mid := lo + (hi-lo)/2\n    switch {\n    case sorted[mid] == x:\n      return true\n    case sorted[mid] < x:\n      lo = mid + 1\n    default:\n      hi = mid\n    }\n  }\n  return false\n}\n```\n\nO(n), linear time. You look at every item a constant number of times. Summing, finding the maximum, counting matches, copying a slice, and scanning a string are linear. A linear scan is the baseline: if you can do better than scanning everything, that is where data structures such as maps and trees earn their keep.\n\nO(n log n), linearithmic time. This is the cost of doing logarithmic work for each of n items, or of splitting the input in half repeatedly and doing linear work at every level. Efficient comparison sorts such as merge sort, heap sort, and Go's own sort package fall here. It is only slightly worse than linear in practice: for n = 1,000,000 it is about 20 million steps.\n\nO(n^2), quadratic time. Typically a loop inside a loop where both depend on n. Checking every pair of items is quadratic. It is fine for a few hundred items and a disaster for a few hundred thousand.\n\n```go\nfunc HasDuplicate(nums []int) bool {\n  for i := 0; i < len(nums); i++ {\n    for j := i + 1; j < len(nums); j++ {\n      if nums[i] == nums[j] {\n        return true\n      }\n    }\n  }\n  return false\n}\n```\n\nWith 1,000 items the inner comparison runs about 500,000 times. With 100,000 items it runs about 5 billion times. Same code, same machine, a ten thousand times heavier workload for a hundred times more data.\n\nO(2^n), exponential time. The work doubles with every extra item. Naive recursive Fibonacci and brute-force searches over every subset are exponential. Past about n = 40 they stop being practical on any hardware. When you meet an exponential algorithm, the usual fix is to cache subresults (dynamic programming) or to find a smarter formulation.\n\nTo feel the difference, imagine each step costs one microsecond and n = 1,000. O(log n) takes about 10 microseconds. O(n) takes 1 millisecond. O(n log n) takes 10 milliseconds. O(n^2) takes 1 second. O(2^n) takes a number with 300 digits of years. Growth rate dominates everything once n is big.\n\n## Rules for reading Big-O\n\nBig-O is deliberately crude. These four rules let you derive it quickly from code.\n\nRule 1: drop constants. A loop that does three operations per item is still O(n). Two sequential passes over the data are O(2n), which we write as O(n). Constants matter for real speed, but they are not part of the growth rate.\n\nRule 2: keep only the dominant term. If a function does a linear pass and then a quadratic nested loop, its cost is n + n^2, and we write O(n^2) because the quadratic part overwhelms the other as n grows.\n\nRule 3: sequential steps add, nested steps multiply. Two loops one after the other cost O(a + b). A loop inside a loop costs O(a * b). If the inner loop runs over a different input than the outer, use different letters rather than pretending both are n.\n\n```go\nfunc CountPairs(a, b []int) int {\n  count := 0\n  for _, x := range a {\n    for _, y := range b {\n      if x == y {\n        count++\n      }\n    }\n  }\n  return count\n}\n```\n\nThis is O(len(a) * len(b)), not O(n^2) unless both slices happen to be the same size. Saying O(a * b) is more precise and tells the reader which input to shrink first.\n\nRule 4: be explicit about which case you mean. Worst case is the cost on the most unlucky input and is what Big-O normally refers to. Best case is the luckiest input and is rarely useful. Average case is the expected cost over typical inputs. Amortized cost spreads an occasional expensive step across many cheap ones. Appending to a Go slice is amortized O(1): most appends just write into spare capacity, and once in a while the runtime allocates a bigger array and copies everything, but doubling capacity makes those copies rare enough that the average cost per append stays constant.\n\n## Space complexity\n\nBig-O applies to memory as well as time. Summing a slice uses O(1) extra space, because it only needs the variable total. Building a new slice with the same number of items uses O(n) extra space. A recursive function that goes n calls deep uses O(n) stack space even if it allocates nothing else.\n\nTime and space often trade against each other. The HasDuplicate function above uses O(1) extra space but O(n^2) time. This version flips the trade:\n\n```go\nfunc HasDuplicateFast(nums []int) bool {\n  seen := make(map[int]struct{}, len(nums))\n  for _, n := range nums {\n    if _, ok := seen[n]; ok {\n      return true\n    }\n    seen[n] = struct{}{}\n  }\n  return false\n}\n```\n\nIt is O(n) on average in time, because each map lookup and insert is O(1) on average, but it uses O(n) extra space for the map. Neither version is simply better. If memory is tight and n is small, the quadratic one is fine. If n is large, the map is almost always worth it. Making that trade consciously is exactly the work of an architect.\n\n## Worked examples: reading code\n\nPractise the rules on short pieces of code. Try to answer before reading the explanation.\n\nExample 1.\n\n```go\nfunc Example1(nums []int) int {\n  best := nums[0]\n  for _, n := range nums {\n    if n > best {\n      best = n\n    }\n  }\n  return best\n}\n```\n\nOne loop over n items with constant work inside: O(n) time, O(1) space.\n\nExample 2.\n\n```go\nfunc Example2(nums []int) {\n  for i := 0; i < len(nums); i++ {\n    for j := 0; j < 10; j++ {\n      fmt.Println(nums[i], j)\n    }\n  }\n}\n```\n\nThe inner loop always runs exactly 10 times, a constant. So the total is 10n steps, which is O(n). Do not count nested loops blindly: ask what each loop's bound depends on.\n\nExample 3.\n\n```go\nfunc Example3(n int) int {\n  steps := 0\n  for i := 1; i < n; i *= 2 {\n    steps++\n  }\n  return steps\n}\n```\n\nThe variable i doubles each time, so the loop runs about log2(n) times: O(log n). Whenever a loop variable is multiplied or divided by a constant each iteration, think logarithm.\n\nExample 4.\n\n```go\nfunc Example4(nums []int) []int {\n  sorted := append([]int(nil), nums...)\n  sort.Ints(sorted)\n  return sorted\n}\n```\n\nCopying is O(n) and sorting is O(n log n). Add them and keep the dominant term: O(n log n) time, O(n) extra space for the copy.\n\nExample 5.\n\n```go\nfunc Example5(s string) string {\n  result := \"\"\n  for i := 0; i < len(s); i++ {\n    result += string(s[i])\n  }\n  return result\n}\n```\n\nThis looks linear but is not. Strings in Go are immutable, so each += allocates a new string and copies the old contents. Copy sizes are 1, 2, 3, up to n, which sum to roughly n^2 / 2 bytes: O(n^2). The fix is strings.Builder, which grows a buffer with amortized O(1) appends and makes the whole function O(n). Hidden costs inside innocent-looking operations are the most common way real code surprises people.\n\n## Big-O hides constants, so measure too\n\nBig-O is a statement about growth, not about speed at a particular size. An O(n) algorithm with a huge constant can lose to an O(n^2) algorithm with a tiny one for small n. That is why Go's sort package falls back to insertion sort for very short ranges, and why scanning a ten-element slice is often faster than looking in a map: the map pays for hashing, and the slice is a few cache-friendly comparisons.\n\nModern hardware adds another distortion. Memory access is not uniform. Walking a slice is fast because the next element is already in the CPU cache. Chasing pointers through a linked list is slower per step because each hop may miss the cache. Two algorithms with the same Big-O can differ by an order of magnitude in practice for this reason.\n\nThe correct workflow is therefore: use Big-O to rule out designs that cannot scale, then measure the remaining candidates on realistic data.\n\n## Measuring in Go\n\nGo ships a benchmark runner in the testing package. A benchmark is a function in a file ending in _test.go whose name starts with Benchmark and which takes a *testing.B.\n\n```go\npackage main\n\nimport (\n  \"math/rand\"\n  \"testing\"\n)\n\nfunc makeData(n int) []int {\n  data := make([]int, n)\n  for i := range data {\n    data[i] = rand.Intn(n)\n  }\n  return data\n}\n\nfunc BenchmarkSum1k(b *testing.B) {\n  data := makeData(1_000)\n  b.ResetTimer()\n  for i := 0; i < b.N; i++ {\n    Sum(data)\n  }\n}\n\nfunc BenchmarkSum1M(b *testing.B) {\n  data := makeData(1_000_000)\n  b.ResetTimer()\n  for i := 0; i < b.N; i++ {\n    Sum(data)\n  }\n}\n```\n\nRun it with go test -bench=. -benchmem. The runner chooses b.N automatically, repeating your loop until the timing is stable, and prints nanoseconds per operation plus allocations if you pass -benchmem. Setup work such as building the data happens before b.ResetTimer so it is not counted.\n\nWhen you run it, compare the two results. Sum1M should take roughly a thousand times longer than Sum1k, confirming linear growth. If you benchmark HasDuplicate at sizes 1,000, 2,000 and 4,000, the time should roughly quadruple each time the size doubles. Doubling n and watching how the time responds is the quickest empirical way to identify an algorithm's growth rate.\n\nThree habits make benchmarks trustworthy. First, make sure the compiler cannot delete the work: if you ignore a function's result, an optimizer may prove nothing depends on it, so assign the result to a package-level variable. Second, benchmark at several sizes, not one. Third, run each benchmark more than once with -count=5 and compare runs with the benchstat tool, because a single run can be noisy. When a benchmark shows something slow and you need to know why, go test -bench=. -cpuprofile=cpu.out followed by go tool pprof cpu.out shows where the time goes.\n\n## Big-O at the architecture level\n\nThe same thinking scales beyond functions. Whenever you design a system, ask what grows and how the cost grows with it.\n\nThe classic example is the N+1 query problem. A page lists 50 orders, and for each order the code issues a separate query to fetch its customer. That is 1 query for the list plus N for the customers. At 50 orders it hides in the noise. At 5,000 orders it becomes 5,001 round trips to the database, each with network latency. The fix, one query that joins or batches by customer ids, changes the cost from O(n) round trips to O(1) round trips.\n\nFan-out is another case. If one request calls 10 services and each calls 10 more, one user action produces 100 downstream calls. Tail latency also compounds: the slowest of many calls decides your response time.\n\nPagination, indexing and caching are all applications of the lessons here. A database index turns a full table scan, O(n), into a tree lookup, O(log n). Paginating bounds the work per request to a constant instead of the table size. A cache makes repeated reads O(1) at the price of memory and invalidation complexity. When you review a design, practise asking: what is n here, and what happens to this operation when n is a thousand times larger?\n\n## Common mistakes\n\nConfusing Big-O with speed. A low growth rate does not mean fast at small sizes, and a high one does not mean slow. Always know your realistic n.\n\nCounting loops instead of work. Two nested loops are not automatically quadratic and one loop is not automatically linear. Look at what each bound depends on and what each iteration really does, including hidden costs such as string concatenation, slice copies, and library calls.\n\nIgnoring the input you did not name. If a function takes a slice and a string, say which one the cost depends on, or use separate letters.\n\nOptimizing before measuring. Rewriting working code to shave a constant factor in a part that is not on the critical path wastes time and adds risk. Profile first.\n\nForgetting memory. An algorithm that is fast but needs O(n^2) memory will fail on large inputs long before time becomes the problem.\n\n## Recap\n\nBig-O describes how cost grows with input size, not how long something takes. The growth rates to recognise on sight are O(1), O(log n), O(n), O(n log n), O(n^2) and O(2^n). To derive Big-O from code, drop constants, keep the dominant term, add sequential steps, multiply nested ones, and watch for hidden costs. Think about space as well as time, and remember that time and space are often traded against each other. Use Big-O to eliminate designs that cannot scale, then use Go benchmarks at several sizes to choose among the survivors. The same questions apply to queries, network calls and whole systems.\n\nThe quick check below tests the core idea, and the exercise has you build the evidence yourself: implement linear and binary search, benchmark both at several sizes, and confirm with your own numbers that one grows linearly and the other barely grows at all.",
    "code": "func BenchmarkSum(b *testing.B) {\n  for i := 0; i < b.N; i++ {\n    Sum(data)\n  }\n}",
    "quiz": [
      {
        "question": "Which growth rate describes binary search on a sorted slice?",
        "options": [
          "O(log n)",
          "O(n)",
          "O(n log n)"
        ],
        "answer": 0,
        "why": "Each step halves the range."
      },
      {
        "question": "A loop over n followed by a nested loop over n has which Big-O?",
        "options": [
          "O(n)",
          "O(2n)",
          "O(n^2)"
        ],
        "answer": 2,
        "why": "Keep the dominant term."
      },
      {
        "question": "Why is building a string by repeated concatenation O(n^2)?",
        "options": [
          "Go loops are slow",
          "Strings are immutable, so each concatenation copies the old contents",
          "Strings are stored as maps"
        ],
        "answer": 1,
        "why": "Use strings.Builder instead."
      },
      {
        "question": "Which command runs benchmarks?",
        "options": [
          "go bench",
          "go run -bench",
          "go test -bench=."
        ],
        "answer": 2,
        "why": "Add -benchmem to see allocations."
      },
      {
        "question": "When can an O(n) algorithm beat an O(log n) one?",
        "options": [
          "For small n where constants dominate",
          "Never",
          "Only for huge n"
        ],
        "answer": 0,
        "why": "Big-O hides constants, so measure."
      }
    ],
    "exercise": "Implement linear and binary search. Benchmark both on 1,000,000 sorted ints with go test -bench=."
  },
  {
    "id": "d2",
    "lane": "ds",
    "title": "Arrays and dynamic arrays",
    "requires": [
      "d1",
      "g4"
    ],
    "text": "## Why this lesson matters\n\nThe array is the most fundamental data structure in computing. Nearly every other structure, from hash tables to heaps to the buffers inside your database, is built on top of one. Understanding how an array lives in memory explains why some operations are blindingly fast, why others are slow, and why a design that looks equivalent on paper can differ tenfold in practice. For an architect, that understanding turns into good judgement about batch sizes, buffers, preallocation and memory use.\n\nBy the end you should be able to explain how contiguous memory gives O(1) indexing, build a dynamic array from scratch in Go, prove why append is amortized O(1), state the cost of every common operation, and reason about cache behaviour well enough to pick row-by-row over column-by-column access.\n\n## Memory layout: why indexing is instant\n\nAn array stores its elements one after another in a single block of memory. If the first element is at address A and each element takes s bytes, then element number i lives at address A + i * s. Computing that address is one multiplication and one addition, regardless of the array's length, so reading or writing any element by index is O(1). This is called random access, and it is the array's defining strength.\n\nThe same layout explains its weaknesses. Because the elements are packed tightly, you cannot insert a new element in the middle without moving everything after it, and you cannot grow the block in place if something else occupies the memory next to it. An array's length is fixed at the moment it is created.\n\nIn Go, a real fixed-size array has its length in its type.\n\n```go\nvar grid [5]int\ngrid[2] = 7\nfmt.Println(grid, len(grid))\n```\n\nYou will rarely use these directly, because slices give you the same contiguous storage with a flexible length, as the earlier lesson explained.\n\n## The cost of each operation\n\nBefore going deeper, here are the costs for an array or slice of n elements, which you should be able to recite.\n\nReading or writing by index is O(1). Appending at the end is amortized O(1), and we will prove that shortly. Inserting or deleting at the front or in the middle is O(n), because the elements after the position must shift. Searching for a value in an unsorted array is O(n), since you may have to look at every element, while searching a sorted array with binary search is O(log n). Iterating over everything is O(n). Appending to a full array without spare room costs O(n) once, for the copy.\n\nKeep this list in mind: much of data structure design is about trading some of these costs against others.\n\n## Building a dynamic array from scratch\n\nA dynamic array hides the fixed-length limitation. It keeps an underlying array with some spare capacity plus a count of how many slots are really used. Appending writes into the next free slot. When the array is full, it allocates a bigger block, copies the elements across and carries on. Go's slices already do this, but building one yourself is the best way to understand it. Here is a generic version.\n\n```go\ntype Vec[T any] struct {\n  data []T\n  n    int\n}\n\nfunc (v *Vec[T]) Push(x T) {\n  if v.n == len(v.data) {\n    newCap := 1\n    if len(v.data) > 0 {\n      newCap = len(v.data) * 2\n    }\n    bigger := make([]T, newCap)\n    copy(bigger, v.data)\n    v.data = bigger\n  }\n  v.data[v.n] = x\n  v.n++\n}\n\nfunc (v *Vec[T]) Get(i int) T {\n  if i < 0 || i >= v.n {\n    panic(\"index out of range\")\n  }\n  return v.data[i]\n}\n\nfunc (v *Vec[T]) Len() int {\n  return v.n\n}\n```\n\nThe type parameter T lets one implementation hold any element type. The field n is the logical length, while len(v.data) is the capacity. In Push, the growth branch allocates a block twice as big, copies the old contents with the built-in copy, and swaps it in. Everything else is a simple write. Note that the user-visible methods check bounds, because the underlying slice may have unused cells beyond n that must not be exposed.\n\n## Why append is amortized O(1)\n\nA single Push can cost O(n) when it triggers a copy, so how can we call the operation O(1)? The answer is amortized analysis: we look at the total cost of a long sequence of operations and divide by their number.\n\nSuppose the capacity doubles each time and we push n items starting from capacity 1. The copies happen when the array holds 1, 2, 4, 8 and so on elements, so the total number of elements copied is 1 + 2 + 4 + ... + n/2, which is less than n. Add the n plain writes and the total work is under 2n. Dividing by n pushes gives under 2 steps per push, a constant. Expensive resizes are rare enough that their cost is spread thinly over many cheap pushes.\n\nThe growth factor matters. Doubling wastes up to half the memory at the worst moment, but copies rarely. A smaller factor such as 1.5 wastes less memory but copies more often. Go's runtime doubles small slices and uses a gentler factor for large ones, a compromise between speed and memory. If instead you grew by a fixed amount, say 10 slots each time, the total copying would grow quadratically and append would become O(n) amortized. Geometric growth is the key.\n\n## Insert and remove in the middle\n\nInserting at position i requires making room by shifting the tail one slot to the right. Removing needs the opposite shift.\n\n```go\nfunc (v *Vec[T]) Insert(i int, x T) {\n  if i < 0 || i > v.n {\n    panic(\"index out of range\")\n  }\n  var zero T\n  v.Push(zero)\n  copy(v.data[i+1:v.n], v.data[i:v.n-1])\n  v.data[i] = x\n}\n\nfunc (v *Vec[T]) RemoveAt(i int) T {\n  if i < 0 || i >= v.n {\n    panic(\"index out of range\")\n  }\n  x := v.data[i]\n  copy(v.data[i:], v.data[i+1:v.n])\n  var zero T\n  v.data[v.n-1] = zero\n  v.n--\n  return x\n}\n```\n\nBoth are O(n) because of the copy. The built-in copy handles overlapping ranges correctly, which is exactly what a shift needs. Look at the last lines of RemoveAt: we overwrite the vacated slot with the zero value. If T holds pointers, leaving the old pointer there would keep the object alive and cause a memory leak even though it is logically removed. Clearing it lets the garbage collector reclaim it. This is a small detail that separates careful code from sloppy code.\n\nYou can shrink an array too, for instance halving the capacity when it is less than a quarter full. Using a lower threshold than the growth point avoids thrashing, where alternating pushes and pops at the boundary would trigger constant resizing.\n\n## A stack on top of an array\n\nArrays are a natural base for a stack, which supports push and pop at one end. Both are O(1) amortized, because the end of an array is where the cheap operations are.\n\n```go\nfunc (v *Vec[T]) Pop() (T, bool) {\n  var zero T\n  if v.n == 0 {\n    return zero, false\n  }\n  v.n--\n  x := v.data[v.n]\n  v.data[v.n] = zero\n  return x, true\n}\n```\n\nReturning a boolean instead of panicking on an empty stack is a Go-style way to signal absence. Stacks are everywhere: undo history, expression parsing, depth-first search and the call stack itself.\n\n## Cache locality: the hidden advantage\n\nModern CPUs are far faster than main memory, so they keep recently used data in small, fast caches. When the CPU loads one value, it actually fetches a whole cache line, typically 64 bytes, so the neighbouring elements arrive for free. An array lays elements next to each other, so a loop that walks it sequentially keeps hitting data that is already in cache. This property is called spatial locality, and it is one of the main reasons arrays beat pointer-based structures in practice, even when Big-O says otherwise.\n\nYou can see it with a two-dimensional example. Store a matrix in one flat slice, in row-major order, so that row i occupies the cells from i*cols to i*cols+cols-1.\n\n```go\nfunc sumByRows(m []int, rows, cols int) int {\n  total := 0\n  for i := 0; i < rows; i++ {\n    for j := 0; j < cols; j++ {\n      total += m[i*cols+j]\n    }\n  }\n  return total\n}\n\nfunc sumByCols(m []int, rows, cols int) int {\n  total := 0\n  for j := 0; j < cols; j++ {\n    for i := 0; i < rows; i++ {\n      total += m[i*cols+j]\n    }\n  }\n  return total\n}\n```\n\nBoth are O(rows * cols) and compute the same sum. But the first reads consecutive memory, while the second jumps by an entire row each step, missing the cache most of the time. On a large matrix the second can be several times slower. Write the two benchmarks using the technique from the Big-O lesson and see the gap on your own machine. This is a concrete example of why measuring complements Big-O.\n\n## Practical techniques with arrays\n\nPreallocate when you know the size. Calling make([]T, 0, n) avoids all the intermediate reallocations and copies, and is often the easiest performance win in a Go program.\n\nPrefix sums turn repeated range queries from O(n) into O(1) after an O(n) setup. Store in prefix[i] the sum of the first i elements. The sum of elements from a to b, exclusive of b, is then prefix[b] - prefix[a].\n\n```go\nfunc buildPrefix(nums []int) []int {\n  prefix := make([]int, len(nums)+1)\n  for i, x := range nums {\n    prefix[i+1] = prefix[i] + x\n  }\n  return prefix\n}\n```\n\nA ring buffer, or circular buffer, uses a fixed array with two indexes that wrap around using the modulo operator, giving a queue with O(1) operations and no allocations after startup. It is used in logging, network drivers and streaming systems, anywhere you want bounded memory and predictable latency.\n\n## Arrays versus linked structures\n\nBeginners are often taught that linked lists are better for insertions because you only change pointers. In theory that is true once you already hold a reference to the position. In practice, a linked list has costs that Big-O does not show: each node is a separate allocation, nodes can be scattered across memory, and every step is a pointer chase that tends to miss the cache. For most workloads, a slice beats a linked list even for insert-heavy tasks until the collection is very large. Default to slices, and choose another structure only when measurement or a clear access pattern tells you to.\n\n## Common mistakes\n\nAppending in a loop without preallocating when the size is known. Inserting at the front of a large slice repeatedly, which is quadratic overall. Leaving pointers in the unused tail after removing elements. Choosing a fixed growth increment instead of a multiplicative factor. Walking a two-dimensional structure against its memory layout. Assuming that Big-O alone decides which structure is faster.\n\n## Recap\n\nAn array stores elements contiguously, so indexing is O(1), while inserting or deleting in the middle is O(n). A dynamic array adds spare capacity and grows geometrically, which makes append amortized O(1): doubling means total copying stays under 2n for n pushes. Clear unused slots to avoid leaks, preallocate when you can, and remember that contiguity gives excellent cache behaviour. Stacks, queues, ring buffers and prefix sums are all simple structures built on these properties.\n\nDo the quick check, then the exercise: build your own generic Stack on a slice with Push, Pop and Peek, and write removeAt without leaking the old last element. If you also write the row-versus-column benchmark, you will have measured the cache effect yourself.",
    "code": "s := make([]int, 0, 2)\nfor i := 0; i < 5; i++ {\n  s = append(s, i)\n  fmt.Println(len(s), cap(s))\n}",
    "quiz": [
      {
        "question": "Why is array indexing O(1)?",
        "options": [
          "Arrays are sorted",
          "The address is computed directly from the index",
          "A hash table is used"
        ],
        "answer": 1,
        "why": "Address = start + i * size."
      },
      {
        "question": "Why is append amortized O(1) with doubling?",
        "options": [
          "Append never copies",
          "Go uses a linked list",
          "Copies are rare, so their cost spreads over many appends"
        ],
        "answer": 2,
        "why": "Total copying stays under 2n for n pushes."
      },
      {
        "question": "Cost of inserting at the front of a slice of n items?",
        "options": [
          "O(1)",
          "O(log n)",
          "O(n)"
        ],
        "answer": 2,
        "why": "Every element must shift."
      },
      {
        "question": "After RemoveAt, why zero the vacated slot?",
        "options": [
          "To release a stale pointer so the garbage collector can free the object",
          "To make the slice shorter",
          "Go requires it"
        ],
        "answer": 0,
        "why": "Otherwise removed objects stay reachable."
      },
      {
        "question": "Why is summing a matrix row by row usually faster than column by column?",
        "options": [
          "Rows have fewer items",
          "Row order reads contiguous memory and uses the CPU cache well",
          "Columns need locks"
        ],
        "answer": 1,
        "why": "This is spatial locality."
      }
    ],
    "exercise": "Build a generic Stack[T] on a slice with Push, Pop, Peek. Then write removeAt(s, i) without leaking the old last element."
  },
  {
    "id": "d3",
    "lane": "ds",
    "title": "Linked lists, stacks, queues",
    "requires": [
      "d2"
    ],
    "text": "## Why this lesson matters\n\nLinked lists, stacks and queues are the first structures where you stop thinking about one big block of memory and start thinking about shape: how items connect to each other and in what order they may enter and leave. Stacks and queues in particular are not just textbook exercises. They describe how function calls work, how undo features work, how web crawlers and schedulers are ordered, and how every message broker moves work from producers to consumers. A solid grasp of them prepares you for graph algorithms and for architectural decisions about buffering and backpressure.\n\nBy the end of this lesson you should be able to build a singly linked list in Go and manipulate its pointers without losing nodes, explain honestly when a linked list is and is not a good choice, implement a stack and a queue in several ways, and recognise where each shows up in real systems.\n\n## The linked list\n\nA linked list stores its elements in separate nodes. Each node holds a value and a pointer to the next node. The list itself remembers where the first node, the head, is. The last node's next pointer is nil, which marks the end. Unlike an array, the nodes can live anywhere in memory, and the structure is held together only by the pointers.\n\n```go\ntype node[T any] struct {\n  val  T\n  next *node[T]\n}\n\ntype List[T any] struct {\n  head, tail *node[T]\n  size       int\n}\n```\n\nWe keep a tail pointer in addition to the head so that adding at the back does not require walking the whole list. Because the type parameter T is generic, the same code works for ints, strings or structs.\n\n## Core operations\n\nAdding at the front creates a node whose next points at the old head, then moves head to the new node. It never touches the other nodes, so it is O(1).\n\n```go\nfunc (l *List[T]) PushFront(v T) {\n  n := &node[T]{val: v, next: l.head}\n  l.head = n\n  if l.tail == nil {\n    l.tail = n\n  }\n  l.size++\n}\n\nfunc (l *List[T]) PushBack(v T) {\n  n := &node[T]{val: v}\n  if l.tail == nil {\n    l.head, l.tail = n, n\n  } else {\n    l.tail.next = n\n    l.tail = n\n  }\n  l.size++\n}\n\nfunc (l *List[T]) PopFront() (T, bool) {\n  var zero T\n  if l.head == nil {\n    return zero, false\n  }\n  n := l.head\n  l.head = n.next\n  if l.head == nil {\n    l.tail = nil\n  }\n  l.size--\n  return n.val, true\n}\n```\n\nStudy the edge cases, because that is where linked list bugs live. When the list is empty, head and tail are both nil, so the first insertion must set both. When the last element is removed, the tail must be reset to nil as well, otherwise it would point at a node that is no longer in the list. Handling the empty and single-element cases explicitly is the main discipline of pointer code.\n\nRemoving an element from the middle requires its predecessor, because you must rewire the predecessor's next pointer to skip it. In a singly linked list you therefore walk from the head while remembering the previous node.\n\n```go\nfunc (l *List[T]) RemoveFirst(match func(T) bool) bool {\n  var prev *node[T]\n  for cur := l.head; cur != nil; prev, cur = cur, cur.next {\n    if match(cur.val) {\n      if prev == nil {\n        l.head = cur.next\n      } else {\n        prev.next = cur.next\n      }\n      if cur == l.tail {\n        l.tail = prev\n      }\n      l.size--\n      return true\n    }\n  }\n  return false\n}\n```\n\nFinding the node is O(n), but the unlinking itself is O(1). The match function lets the caller decide what equality means, which is needed because Go cannot compare arbitrary generic values with ==.\n\n## The costs, honestly\n\nFor a singly linked list of n elements: inserting or removing at the head is O(1). Appending at the tail is O(1) if you keep a tail pointer. Removing the tail is O(n), because you need the node before it. Accessing the i-th element is O(i), since you must walk from the head, so there is no random access. Searching is O(n). Compare that with the dynamic array from the previous lesson, where access is O(1) and only front insertion is slow.\n\nMemory behaves differently too. Each element costs a separate allocation plus an extra pointer, eight bytes on a 64-bit machine, and the nodes are scattered, so walking the list chases pointers across memory and misses the CPU cache constantly. In practice that makes a slice faster than a linked list for the vast majority of workloads, even for operations where linked lists win on paper. Choose a linked list when you need cheap insertion or removal at a position you already hold a reference to, or when items are frequently moved around inside the structure, and you do not need indexing.\n\n## Reversing a list and detecting cycles\n\nTwo classic exercises teach pointer thinking. Reversing a list in place rewires each node to point backwards, using three pointers: the previous node, the current node, and the saved next node.\n\n```go\nfunc (l *List[T]) Reverse() {\n  var prev *node[T]\n  cur := l.head\n  l.tail = l.head\n  for cur != nil {\n    next := cur.next\n    cur.next = prev\n    prev = cur\n    cur = next\n  }\n  l.head = prev\n}\n```\n\nThe saved next pointer is essential: the moment you overwrite cur.next, you would otherwise lose the rest of the list. The loop is O(n) time and O(1) extra space. Draw three nodes on paper and step through the loop once by hand.\n\nA bug in pointer code can create a cycle, where some node points back to an earlier one, so that walking the list never ends. Floyd's algorithm, sometimes called the tortoise and hare, detects this in O(n) time and O(1) space: move one pointer by one step and another by two. If there is a cycle, the fast pointer eventually laps the slow one, and they meet. If not, the fast pointer reaches nil.\n\n```go\nfunc hasCycle[T any](head *node[T]) bool {\n  slow, fast := head, head\n  for fast != nil && fast.next != nil {\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast {\n      return true\n    }\n  }\n  return false\n}\n```\n\n## Doubly linked lists\n\nA doubly linked list gives each node both a next and a prev pointer. That costs more memory, but it makes removal of a known node O(1) from both directions, since the node itself knows its neighbours. Go's standard library offers one in container/list.\n\n```go\nl := list.New()\ne := l.PushBack(\"b\")\nl.PushFront(\"a\")\nl.PushBack(\"c\")\nl.Remove(e)\nl.MoveToFront(l.Back())\nfor x := l.Front(); x != nil; x = x.Next() {\n  fmt.Println(x.Value)\n}\n```\n\nThe values are stored as any, so you need a type assertion when reading them. The signature use case is an LRU cache, which evicts the least recently used item when it is full. A hash map gives O(1) lookup of a node by key, and a doubly linked list keeps the nodes in order of use, so that moving an item to the front and removing the item at the back are both O(1).\n\n```go\ntype entry struct {\n  key string\n  val int\n}\n\ntype LRU struct {\n  cap   int\n  ll    *list.List\n  items map[string]*list.Element\n}\n\nfunc (c *LRU) Get(k string) (int, bool) {\n  if e, ok := c.items[k]; ok {\n    c.ll.MoveToFront(e)\n    return e.Value.(*entry).val, true\n  }\n  return 0, false\n}\n\nfunc (c *LRU) Put(k string, v int) {\n  if e, ok := c.items[k]; ok {\n    e.Value.(*entry).val = v\n    c.ll.MoveToFront(e)\n    return\n  }\n  c.items[k] = c.ll.PushFront(&entry{k, v})\n  if c.ll.Len() > c.cap {\n    last := c.ll.Back()\n    c.ll.Remove(last)\n    delete(c.items, last.Value.(*entry).key)\n  }\n}\n```\n\nThis pairing of a map and a list is a pattern worth remembering: when one structure is good at lookup and another at ordering, combine them and keep them in sync. It is exactly the kind of composition that architects use when designing caches.\n\n## Stacks\n\nA stack is last in, first out. You can only add and remove at one end, the top. The operations are push, pop and peek, and all are O(1). Any structure that supports cheap operations at one end can implement a stack, and a slice is the simplest because the end of a slice is cheap.\n\n```go\ntype Stack[T any] struct {\n  items []T\n}\n\nfunc (s *Stack[T]) Push(v T) {\n  s.items = append(s.items, v)\n}\n\nfunc (s *Stack[T]) Pop() (T, bool) {\n  var zero T\n  if len(s.items) == 0 {\n    return zero, false\n  }\n  v := s.items[len(s.items)-1]\n  s.items[len(s.items)-1] = zero\n  s.items = s.items[:len(s.items)-1]\n  return v, true\n}\n```\n\nA classic application is checking whether brackets in a string are balanced. Every opener is pushed, and every closer must match the opener on top.\n\n```go\nfunc balanced(s string) bool {\n  pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}\n  var stack []rune\n  for _, r := range s {\n    switch r {\n    case '(', '[', '{':\n      stack = append(stack, r)\n    case ')', ']', '}':\n      if len(stack) == 0 || stack[len(stack)-1] != pairs[r] {\n        return false\n      }\n      stack = stack[:len(stack)-1]\n    }\n  }\n  return len(stack) == 0\n}\n```\n\nStacks also power undo history, browser back navigation, expression evaluation, backtracking, and depth-first search. Every function call you make uses one: the call stack stores return addresses and local variables, which is why unbounded recursion ends in a stack overflow.\n\n## Queues\n\nA queue is first in, first out: items leave in the order they arrived, like people waiting in line. The operations are enqueue at the back and dequeue from the front. A linked list with head and tail pointers gives O(1) for both, using PushBack and PopFront as above.\n\nThe tempting slice version is q = append(q, x) to enqueue and q = q[1:] to dequeue. It works and is O(1), but it has a subtle flaw: the discarded front elements remain in the underlying array until a reallocation, so if they hold pointers, they stay alive longer than expected. Clear the slot before advancing, or use a ring buffer, which wraps two indexes around a fixed array with the modulo operator. A ring buffer gives O(1) operations, constant memory and no allocation after setup, which is why it appears in network stacks, audio pipelines and logging.\n\nA deque, or double-ended queue, supports adding and removing at both ends, and is easy to build as a ring buffer or doubly linked list. A priority queue, where the next item out is the most important rather than the oldest, is a different structure, usually built on a heap, which comes later in this track.\n\nQueues drive breadth-first search, task scheduling, print spoolers, and above all message brokers. Here the architectural lessons appear. An unbounded queue hides trouble: if producers are faster than consumers, the queue grows without limit until memory runs out. A bounded queue forces a decision, either block the producer, drop items, or reject new work, and that decision is called backpressure. In Go, a buffered channel is a bounded queue with these exact semantics, which links this lesson to the concurrency one. When you design a pipeline, ask how big each queue may grow and what happens when it fills.\n\n## Choosing between them\n\nIf you need indexed access, use a slice. If you need last-in first-out behaviour, use a stack on a slice. For first-in first-out, use a ring buffer, a channel when concurrency is involved, or a linked list when you need it to grow and shrink freely. If you need to remove arbitrary items in constant time given a reference, use a doubly linked list, perhaps combined with a map. When in doubt, begin with the simplest structure, a slice, and benchmark before choosing something more exotic.\n\n## Common mistakes\n\nForgetting the empty-list and single-node cases. Losing the rest of the list by overwriting a next pointer before saving it. Forgetting to update tail after removing the last node. Dereferencing a nil node. Using a linked list for indexed access. Leaving stale pointers in a slice-based queue or stack. Allowing a queue to grow without a bound.\n\n## Recap\n\nA linked list chains nodes with pointers, giving O(1) insertion and removal at known positions but O(n) access and poor cache behaviour. Doubly linked lists add backward pointers and power structures like LRU caches when paired with a map. A stack is last in, first out and a queue is first in, first out, and each can be built on a slice, a list or a ring buffer. Bounded queues and backpressure are central to robust system design.\n\nTake the quick check, then do the exercises: reverse a singly linked list in place, and build a queue with head and tail pointers. Test the empty, one-element and many-element cases for each, since those are exactly where pointer bugs hide.",
    "code": "type Node struct {\n  Val  int\n  Next *Node\n}",
    "quiz": [
      {
        "question": "Cost of reaching the i-th element of a singly linked list?",
        "options": [
          "O(1)",
          "O(log n)",
          "O(i)"
        ],
        "answer": 2,
        "why": "You must walk from the head."
      },
      {
        "question": "Why does Reverse save the next pointer first?",
        "options": [
          "To count nodes",
          "To sort values",
          "Overwriting cur.next would lose the rest of the list"
        ],
        "answer": 2,
        "why": "Save before you rewire."
      },
      {
        "question": "Stack ordering is:",
        "options": [
          "Last in, first out",
          "First in, first out",
          "Sorted"
        ],
        "answer": 0,
        "why": "Push and pop at the same end."
      },
      {
        "question": "In an LRU cache, what does the map provide?",
        "options": [
          "Order of use",
          "O(1) lookup of a list node by key",
          "Eviction timing"
        ],
        "answer": 1,
        "why": "The list gives order, the map gives lookup."
      },
      {
        "question": "What is backpressure?",
        "options": [
          "Compressing a queue",
          "Reversing a queue",
          "Making producers slow, block or drop when a bounded queue is full"
        ],
        "answer": 2,
        "why": "It prevents unbounded growth."
      }
    ],
    "exercise": "Reverse a singly linked list in place. Then build a queue from a linked list with head and tail pointers."
  },
  {
    "id": "d4",
    "lane": "ds",
    "title": "Hash maps",
    "requires": [
      "d3"
    ],
    "text": "## Why this lesson matters\n\nIf you could keep only one data structure in your toolbox, it would probably be the hash map. It answers the question \"what is the value for this key?\" in constant time on average, and that single capability underlies caches, indexes, deduplication, counting, routing tables, sessions, symbol tables in compilers, and the join algorithm inside databases. Hash functions also appear at the scale of whole systems: they decide which shard stores a record, which server handles a request, and which partition receives a message.\n\nBy the end of this lesson you should be able to explain how a hash table works and why lookups are O(1) on average, build one from scratch in Go, describe collisions and resizing, use maps confidently for common algorithmic patterns, and apply the same hashing idea to distribute data across machines.\n\n## The idea\n\nImagine you want to look up a person's phone number by name. A slice of pairs would force you to scan every entry, O(n). A sorted slice would allow binary search at O(log n). A hash table does better by computing, directly from the key, the position where the value should be stored.\n\nThe tool is a hash function: a function that turns a key of any size into a fixed-size integer. The table keeps an array of buckets. To store a pair, compute the hash of the key, reduce it to a valid array index, usually with the modulo operator, and put the pair in that bucket. To look it up, repeat the same computation and look in the same bucket. No scanning of the whole collection is needed, so the cost does not depend on how many items are stored.\n\nA good hash function is deterministic, so the same key always gives the same hash. It is fast to compute. And it spreads keys evenly across the range, so that similar keys do not cluster in the same bucket.\n\n## Collisions\n\nTwo different keys can produce the same bucket index. This is inevitable: there are far more possible keys than buckets, so by the pigeonhole principle collisions must occur, and by the birthday paradox they occur sooner than intuition suggests. A hash table needs a strategy for them.\n\nThe simplest is chaining: each bucket holds a small linked list of the entries that landed there. A lookup computes the bucket and then walks the short chain comparing keys. The alternative is open addressing, where all entries live directly in the array and a collision sends the new entry to another slot found by a probing rule such as stepping forward until a free slot appears. Chaining is easier to understand, while open addressing is more cache friendly. Go's built-in map has used bucketed designs in the past, and recent versions, from Go 1.24, moved to a Swiss-table design, a modern open-addressing scheme. As a user you do not need to know the details, only the guarantees.\n\nThe performance of a hash table depends on the load factor: the number of entries divided by the number of buckets. When the load factor is low, chains are short, usually length zero or one, so operations are O(1). As it rises, chains lengthen. Therefore the table resizes: when the load factor passes a threshold such as 0.75, it allocates an array twice as large and moves every entry to its new bucket, recomputing indexes. This rehash is O(n), but it happens rarely, so insertion is amortized O(1) by the same doubling argument you saw with dynamic arrays.\n\nThe worst case is O(n), when every key collides into one bucket and the table degenerates into a single list. Hash functions chosen carelessly can be attacked deliberately by feeding keys that all collide, a denial-of-service technique known as hash flooding. Go mitigates it by seeding its hash function randomly for each map, which is also one reason iteration order is random.\n\n## Building a hash map from scratch\n\nHere is a small hash map with string keys and int values, using chaining and the FNV hash from the standard library.\n\n```go\ntype entry struct {\n  key  string\n  val  int\n  next *entry\n}\n\ntype HashMap struct {\n  buckets []*entry\n  size    int\n}\n\nfunc NewHashMap() *HashMap {\n  return &HashMap{buckets: make([]*entry, 8)}\n}\n\nfunc hash(key string) uint32 {\n  h := fnv.New32a()\n  h.Write([]byte(key))\n  return h.Sum32()\n}\n\nfunc (m *HashMap) index(key string) int {\n  return int(hash(key) % uint32(len(m.buckets)))\n}\n```\n\nReading follows the chain in the key's bucket.\n\n```go\nfunc (m *HashMap) Get(key string) (int, bool) {\n  for e := m.buckets[m.index(key)]; e != nil; e = e.next {\n    if e.key == key {\n      return e.val, true\n    }\n  }\n  return 0, false\n}\n```\n\nWriting first checks whether the key already exists, in which case it updates the value. Otherwise it inserts a new entry at the head of the chain, and grows the table if the load factor is too high.\n\n```go\nfunc (m *HashMap) Put(key string, val int) {\n  i := m.index(key)\n  for e := m.buckets[i]; e != nil; e = e.next {\n    if e.key == key {\n      e.val = val\n      return\n    }\n  }\n  m.buckets[i] = &entry{key: key, val: val, next: m.buckets[i]}\n  m.size++\n  if m.size > len(m.buckets)*3/4 {\n    m.grow()\n  }\n}\n\nfunc (m *HashMap) grow() {\n  old := m.buckets\n  m.buckets = make([]*entry, len(old)*2)\n  for _, e := range old {\n    for e != nil {\n      next := e.next\n      i := m.index(e.key)\n      e.next = m.buckets[i]\n      m.buckets[i] = e\n      e = next\n    }\n  }\n}\n```\n\nNotice that grow must recompute every index with the new bucket count, because the index depends on the table size. Entries from one old bucket may scatter into different new buckets. Deleting is the mirror image of the linked list removal you saw earlier.\n\n```go\nfunc (m *HashMap) Delete(key string) {\n  i := m.index(key)\n  var prev *entry\n  for e := m.buckets[i]; e != nil; prev, e = e, e.next {\n    if e.key == key {\n      if prev == nil {\n        m.buckets[i] = e.next\n      } else {\n        prev.next = e.next\n      }\n      m.size--\n      return\n    }\n  }\n}\n```\n\nWith about 20 lines per operation you now understand why Get, Put and Delete are O(1) on average: a hash computation plus a short chain walk. Try writing a test that inserts ten thousand keys and checks that every one can be read back, then print the longest chain to see how well the hash spreads them.\n\n## Using Go's built-in map\n\nIn real programs you use the built-in map type. You met its syntax earlier. The important rules are these. Keys must be comparable, so ints, strings, bools, pointers, arrays and structs made of those qualify, while slices, maps and functions do not. A struct key is handy for composite lookups, such as a point on a grid.\n\n```go\ntype Point struct{ X, Y int }\n\nvisited := map[Point]bool{}\nvisited[Point{1, 2}] = true\nfmt.Println(visited[Point{1, 2}], visited[Point{3, 4}])\n```\n\nKeys are copied in and should be treated as immutable: if a pointer key's target changes it is still the same pointer, but the data you care about may change under you. Floating-point keys are possible but risky, since NaN is not equal to itself and values that look equal after arithmetic may differ in the last bit. A map never shrinks its internal storage when you delete entries, so a map that once held millions of items keeps that memory until the map itself becomes garbage. If that matters, build a fresh map and copy the survivors across.\n\nFor concurrency, a plain map is not safe for simultaneous writes. Guard it with a mutex, or use sync.Map when entries are written once and read many times, or when goroutines work on disjoint keys.\n\n## Patterns that use maps\n\nMost algorithmic uses of hash maps follow a handful of patterns, and recognising them is a core skill.\n\nCounting. Increase a counter per key. The zero value makes it a one-liner: counts[word]++.\n\nDeduplication and membership. A set is a map with struct{} values. Checking membership is O(1), which turns many O(n^2) problems into O(n).\n\nComplement lookup. The famous two-sum problem asks for two numbers in a slice that add up to a target. Instead of checking every pair, remember each number you have seen and ask whether the number you need already appeared.\n\n```go\nfunc twoSum(nums []int, target int) (int, int, bool) {\n  seen := map[int]int{}\n  for i, n := range nums {\n    if j, ok := seen[target-n]; ok {\n      return j, i, true\n    }\n    seen[n] = i\n  }\n  return 0, 0, false\n}\n```\n\nThis is O(n) time and O(n) space, compared with O(n^2) time and O(1) space for the brute-force pair check. Again, a classic time-for-space trade.\n\nGrouping by a canonical key. To group words that are anagrams of each other, use the sorted letters of each word as the key.\n\n```go\nfunc groupAnagrams(words []string) [][]string {\n  groups := map[string][]string{}\n  for _, w := range words {\n    b := []byte(w)\n    sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })\n    key := string(b)\n    groups[key] = append(groups[key], w)\n  }\n  out := make([][]string, 0, len(groups))\n  for _, g := range groups {\n    out = append(out, g)\n  }\n  return out\n}\n```\n\nIndexing and joining. Build a map from id to record once, then look records up as you scan another collection. This is exactly the hash join that databases use for joining tables, turning an O(n * m) nested loop into O(n + m).\n\nMemoization. Cache the results of an expensive function keyed by its arguments, as in the Fibonacci example in the recursion lesson.\n\n## Hashing at system scale\n\nThe same idea runs across machines. Suppose you have four cache servers and want to decide which one holds each key. The obvious approach is server = hash(key) % 4. It spreads load evenly, and every client computes the same answer without coordination. The trouble appears when you add a fifth server: the formula changes to hash(key) % 5, and for uniformly distributed hashes about 80 percent of keys now map to a different server. Nearly the entire cache is suddenly cold, and the database behind it takes the full load.\n\nConsistent hashing solves this. Place both servers and keys on a circular space of hash values, and assign each key to the first server found moving clockwise from the key. When a server is added or removed, only the keys in its neighbourhood move, roughly one over n of all keys. Practical systems also give each server many virtual positions on the ring to balance load. Consistent hashing, or close relatives of it, appears in distributed caches, databases such as Cassandra and DynamoDB, and content delivery networks. Message systems like Kafka use plain hash partitioning of a key to choose a partition, so that all messages for one key land in the same partition and keep their order.\n\nOne more neighbour of this idea is the Bloom filter, a compact structure that answers \"have I seen this key?\" with either \"definitely not\" or \"probably yes\". It uses several hash functions over a bit array, and trades a small false positive rate for a huge saving in memory. It is widely used to avoid expensive lookups for keys that do not exist.\n\nFinally, do not confuse hash tables with cryptographic hashing. Functions such as SHA-256 are designed to be one way and resistant to deliberate collisions, and are slower. Hash table hashes only need speed and good distribution. For passwords you need a deliberately slow password hashing function such as bcrypt or argon2, a different tool again.\n\n## When not to use a map\n\nFor very small collections, a slice scan can be faster than a map, because there is no hashing and the data sits in cache. When you need ordered iteration or range queries, such as all keys between a and b, a hash map cannot help since it keeps no order, and you need a tree or a sorted slice. When memory is tight and keys are small dense integers, a plain slice indexed by the integer beats a map. Choose by access pattern, then benchmark if the choice matters.\n\n## Common mistakes\n\nWriting to a nil map. Relying on iteration order. Using a slice or another map as a key. Modifying a map from multiple goroutines without synchronisation. Using floating-point values as keys. Expecting memory to drop after deleting entries. Assuming O(1) means fast for tiny sizes. Using hash % N to place data on a cluster that will change size.\n\n## Recap\n\nA hash map computes an index from the key, so lookup, insert and delete are O(1) on average, while the worst case is O(n). Collisions are handled by chaining or open addressing, and resizing at a target load factor keeps chains short and insertion amortized O(1). The map is the key tool for counting, deduplication, complement lookups, grouping, joins and memoization, and the same hashing idea scales up to partitioning data with consistent hashing.\n\nTake the quick check, then do the exercises: solve two-sum in O(n), detect duplicates in a slice, and group a list of words into anagram sets. If you also run a test against your own hand-built hash map, you will have verified the whole mechanism.",
    "code": "seen := map[int]int{}\nfor i, n := range nums {\n  if j, ok := seen[target-n]; ok {\n    return []int{j, i}\n  }\n  seen[n] = i\n}",
    "quiz": [
      {
        "question": "Why is hash map lookup O(1) on average?",
        "options": [
          "Keys are sorted",
          "The hash picks a bucket directly and chains stay short",
          "It uses binary search"
        ],
        "answer": 1,
        "why": "No scanning is needed unless many keys collide."
      },
      {
        "question": "What happens when the load factor passes its threshold?",
        "options": [
          "Entries are deleted",
          "The table switches to a tree",
          "The table grows and rehashes entries"
        ],
        "answer": 2,
        "why": "Doubling keeps insertion amortized O(1)."
      },
      {
        "question": "With hash % N placement, going from 4 to 5 servers moves about how many keys?",
        "options": [
          "None",
          "About 80 percent",
          "About 20 percent"
        ],
        "answer": 1,
        "why": "Consistent hashing reduces this to about one over n."
      },
      {
        "question": "Which cannot be a Go map key?",
        "options": [
          "a slice",
          "a struct of ints and strings",
          "an array of ints"
        ],
        "answer": 0,
        "why": "Slices are not comparable."
      },
      {
        "question": "Time for two-sum with a map?",
        "options": [
          "O(n^2)",
          "O(log n)",
          "O(n) on average"
        ],
        "answer": 2,
        "why": "One pass, with O(1) lookups."
      }
    ],
    "exercise": "Solve two-sum in O(n), detect duplicates in a slice, and group a list of words into anagram sets."
  },
  {
    "id": "d5",
    "lane": "ds",
    "title": "Trees and heaps",
    "requires": [
      "d4"
    ],
    "text": "## Why this lesson matters\n\nArrays and hash maps are excellent when you know exactly what you want, but they are poor at two jobs: keeping data in sorted order while it changes, and always giving you the most important item next. Trees and heaps are the structures built for those jobs. They also model hierarchy, which is everywhere in software: file systems, organisation charts, the DOM in a web page, the syntax tree inside a compiler, and the indexes that make databases fast. When you read that a database index is a B-tree, or that a scheduler uses a priority queue, this lesson is what those sentences rest on.\n\nBy the end you should be able to describe trees using the standard vocabulary, implement a binary search tree in Go, traverse trees in four orders, explain why balance matters and what real systems do about it, build a heap, use Go's container/heap package, and solve problems such as top-k with it.\n\n## Tree vocabulary\n\nA tree is a set of nodes connected by edges, with a single node called the root at the top and no cycles. Every node except the root has exactly one parent, and a node may have children. A node with no children is a leaf. The depth of a node is the number of edges from the root to it, and the height of a tree is the depth of its deepest node. A subtree is a node together with everything below it. Because every subtree is itself a tree, tree algorithms are naturally recursive, and recursion is the natural way to read them.\n\nA binary tree restricts each node to at most two children, called left and right. This simple shape is the basis of most of what follows.\n\n```go\ntype Node struct {\n  Val         int\n  Left, Right *Node\n}\n```\n\n## Traversals\n\nTo process every node you need an order for visiting them. Three depth-first orders differ only in when the node itself is handled relative to its subtrees. In pre-order you handle the node, then the left subtree, then the right: useful for copying a tree or printing its structure. In in-order you handle the left subtree, then the node, then the right: for a binary search tree this produces the values in sorted order. In post-order you handle both subtrees first and the node last: useful for deleting a tree or computing sizes, since children are finished before their parent.\n\n```go\nfunc (n *Node) InOrder(visit func(int)) {\n  if n == nil {\n    return\n  }\n  n.Left.InOrder(visit)\n  visit(n.Val)\n  n.Right.InOrder(visit)\n}\n```\n\nCalling a method on a nil pointer is legal in Go as long as the method handles it, and here the nil check is the recursion's base case. The cost of any traversal is O(n), since every node is visited once, and the recursion depth equals the tree's height.\n\nThe fourth order is breadth-first, or level order: visit the root, then all nodes at depth 1, then depth 2, and so on. It uses a queue instead of recursion, which ties back to the previous lesson.\n\n```go\nfunc LevelOrder(root *Node) [][]int {\n  var out [][]int\n  if root == nil {\n    return out\n  }\n  queue := []*Node{root}\n  for len(queue) > 0 {\n    size := len(queue)\n    level := make([]int, 0, size)\n    for i := 0; i < size; i++ {\n      n := queue[0]\n      queue = queue[1:]\n      level = append(level, n.Val)\n      if n.Left != nil {\n        queue = append(queue, n.Left)\n      }\n      if n.Right != nil {\n        queue = append(queue, n.Right)\n      }\n    }\n    out = append(out, level)\n  }\n  return out\n}\n```\n\nTaking the current queue size at the start of each round lets you separate the levels cleanly.\n\n## Binary search trees\n\nA binary search tree, or BST, adds an ordering rule: for every node, all values in its left subtree are smaller and all values in its right subtree are larger. That single rule makes searching efficient, because at each node you can discard half of the remaining tree, just as binary search discards half of a sorted array.\n\n```go\nfunc (n *Node) Insert(v int) *Node {\n  if n == nil {\n    return &Node{Val: v}\n  }\n  if v < n.Val {\n    n.Left = n.Left.Insert(v)\n  } else if v > n.Val {\n    n.Right = n.Right.Insert(v)\n  }\n  return n\n}\n\nfunc (n *Node) Contains(v int) bool {\n  for n != nil {\n    switch {\n    case v == n.Val:\n      return true\n    case v < n.Val:\n      n = n.Left\n    default:\n      n = n.Right\n    }\n  }\n  return false\n}\n\nfunc (n *Node) Height() int {\n  if n == nil {\n    return 0\n  }\n  return 1 + max(n.Left.Height(), n.Right.Height())\n}\n```\n\nInsert returns the root of the subtree so each caller can reattach it, which handles the empty-tree case without special code. Duplicates are ignored here. Both search and insert cost O(h), where h is the height. Deletion has three cases, shown below: a node with no children is simply removed, a node with one child is replaced by that child, and a node with two children takes the value of its in-order successor, the smallest value in its right subtree, which is then deleted from there.\n\n```go\nfunc (n *Node) Delete(v int) *Node {\n  if n == nil {\n    return nil\n  }\n  switch {\n  case v < n.Val:\n    n.Left = n.Left.Delete(v)\n  case v > n.Val:\n    n.Right = n.Right.Delete(v)\n  default:\n    if n.Left == nil {\n      return n.Right\n    }\n    if n.Right == nil {\n      return n.Left\n    }\n    succ := n.Right\n    for succ.Left != nil {\n      succ = succ.Left\n    }\n    n.Val = succ.Val\n    n.Right = n.Right.Delete(succ.Val)\n  }\n  return n\n}\n```\n\nAn in-order traversal of a valid BST yields a sorted sequence, which is both a handy property and a good test: if your in-order output is not sorted, your tree is broken.\n\n## Why balance matters\n\nEverything about a BST's speed depends on its height. If the tree is balanced, with roughly equal subtrees, the height is about log2 of n, so a million values need only around 20 levels. But the shape depends on insertion order. Inserting 1, 2, 3, 4, 5 in sorted order gives each new node a right child only, producing a chain that is effectively a linked list of height n. Search then costs O(n), and the elegant structure has lost its point.\n\nSelf-balancing trees fix this by restructuring after inserts and deletes, using small local operations called rotations that preserve the ordering rule while shortening the tree. AVL trees keep subtree heights within one of each other. Red-black trees use colour rules to keep the longest path at most twice the shortest, with cheaper updates, and are the basis of many standard library ordered maps in other languages. You will rarely write one yourself, but you should know they exist and what they guarantee: O(log n) search, insert and delete in the worst case.\n\nGo's standard library does not include an ordered map, so for sorted data you either keep a sorted slice with binary search, accept the cost of sorting when needed, or use a third-party library. For read-mostly data, a sorted slice with binary search is often best, thanks to cache friendliness.\n\n## Trees in real systems\n\nThe tree that matters most to architects is the B-tree and its variant the B+ tree. A B-tree is a balanced tree whose nodes hold many keys, often hundreds, instead of one. That design suits disks: reading a block is expensive, so each node is sized to fill a block, which keeps the tree very shallow. With hundreds of keys per node, three or four levels can index hundreds of millions of rows. When you create an index in PostgreSQL, MySQL or SQLite, you are usually building a B-tree. This is why an indexed lookup is O(log n) while a table scan is O(n), the contrast the Big-O lesson used for query design, and why range queries on indexed columns are fast: leaves are linked in sorted order.\n\nOther trees you will meet: tries, where each edge is a character, used for autocomplete and routing tables; the abstract syntax trees that compilers and linters build from source code; Merkle trees, where each node is a hash of its children, used in Git, blockchains and anti-entropy protocols to compare large data sets efficiently; and the filesystem hierarchy itself.\n\n## Heaps\n\nA heap is a tree with a different rule, built to answer one question quickly: which item is the smallest, or the largest? In a min-heap, every parent is less than or equal to its children, so the minimum is always at the root. There is no ordering between siblings, which is why a heap is cheaper to maintain than a fully sorted structure.\n\nA heap is a complete binary tree, meaning every level is full except possibly the last, which fills from the left. Completeness allows a beautiful trick: store the tree in a plain array with no pointers. The root is at index 0. For a node at index i, its children are at 2i+1 and 2i+2, and its parent is at (i-1)/2 using integer division. The array gives cache-friendly storage and no allocations per node.\n\nTwo operations do all the work. To push a value, append it at the end, then sift it up: while it is smaller than its parent, swap them. To pop the minimum, take the root, move the last element into its place, then sift it down: swap it with its smaller child until it is no larger than both. Each moves along a single path of the tree, so both cost O(log n), while reading the minimum is O(1).\n\n```go\ntype MinHeap struct{ data []int }\n\nfunc (h *MinHeap) Push(x int) {\n  h.data = append(h.data, x)\n  i := len(h.data) - 1\n  for i > 0 {\n    p := (i - 1) / 2\n    if h.data[p] <= h.data[i] {\n      break\n    }\n    h.data[p], h.data[i] = h.data[i], h.data[p]\n    i = p\n  }\n}\n\nfunc (h *MinHeap) Pop() (int, bool) {\n  if len(h.data) == 0 {\n    return 0, false\n  }\n  top := h.data[0]\n  last := len(h.data) - 1\n  h.data[0] = h.data[last]\n  h.data = h.data[:last]\n  i := 0\n  for {\n    l, r, small := 2*i+1, 2*i+2, i\n    if l < len(h.data) && h.data[l] < h.data[small] {\n      small = l\n    }\n    if r < len(h.data) && h.data[r] < h.data[small] {\n      small = r\n    }\n    if small == i {\n      break\n    }\n    h.data[i], h.data[small] = h.data[small], h.data[i]\n    i = small\n  }\n  return top, true\n}\n```\n\nBuilding a heap from n existing values by pushing one at a time costs O(n log n), but a bottom-up method called heapify, which sifts down from the middle of the array backward, does it in O(n). Heap sort uses a heap to sort in O(n log n) in place.\n\n## Go's container/heap\n\nRather than write your own, you use the standard container/heap package, which works on any type that satisfies a five-method interface: Len, Less, Swap, plus Push and Pop for the package to call internally.\n\n```go\ntype IntHeap []int\n\nfunc (h IntHeap) Len() int           { return len(h) }\nfunc (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }\nfunc (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }\nfunc (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }\nfunc (h *IntHeap) Pop() any {\n  old := *h\n  n := len(old)\n  x := old[n-1]\n  *h = old[:n-1]\n  return x\n}\n\nfunc main() {\n  h := &IntHeap{5, 2, 8}\n  heap.Init(h)\n  heap.Push(h, 1)\n  fmt.Println(heap.Pop(h))\n}\n```\n\nThis prints 1. Notice the division of labour: your methods only append and remove at the end of the slice, while the package functions heap.Push and heap.Pop do the sifting. Always call the package functions, not your own methods directly. For a max-heap, flip the comparison in Less. For a priority queue of structs, store items with a priority field and compare on it, and give each a heap index if you need to update priorities later using heap.Fix.\n\n## Solving top-k with a heap\n\nA classic task: from a very large stream of numbers, find the k largest. Sorting everything costs O(n log n) and needs all data in memory. A min-heap of size k does better: push each number, and when the heap grows past k, pop the smallest. At the end, the heap holds the k largest.\n\n```go\nfunc topK(nums []int, k int) []int {\n  h := &IntHeap{}\n  for _, n := range nums {\n    heap.Push(h, n)\n    if h.Len() > k {\n      heap.Pop(h)\n    }\n  }\n  return *h\n}\n```\n\nEach of n items costs O(log k), so the total is O(n log k) time and O(k) memory, which works on unbounded streams. The result is not sorted, so sort it if you need order. Many systems use this idea: leaderboards, trending items, and merging k sorted lists, where a heap holds the next candidate from each list.\n\nPriority queues built on heaps also drive Dijkstra's shortest path algorithm, event-driven simulations, and schedulers. Go's runtime itself keeps timers in a heap, so that the next timer to fire is always at the top.\n\n## Common mistakes\n\nAssuming a BST stays balanced without checking. Forgetting nil checks and the empty-tree case. Mutating a tree while traversing it. Using a heap when you need sorted iteration, since a heap only guarantees the top. Calling your own Push and Pop on a container/heap type instead of the package functions. Forgetting that the heap's Less decides min versus max. Confusing a binary search tree's ordering rule with a heap's parent rule.\n\n## Recap\n\nTrees model hierarchy and are naturally recursive, traversed in pre-order, in-order, post-order or level order. A binary search tree gives O(h) search, insert and delete, which is O(log n) when balanced and O(n) when degenerate, so real systems use self-balancing variants and B-trees for disk-based indexes. A heap is a complete binary tree stored in an array, giving O(1) access to the minimum and O(log n) push and pop, and it is the engine of priority queues and top-k problems. Choose a BST when you need order, a heap when you only need the extreme, and a hash map when you need neither.\n\nTake the quick check, then do the exercises: add in-order traversal and height to your tree, then use container/heap to find the k largest numbers in a stream. Test with sorted input to see the degenerate tree for yourself, and print its height next to a shuffled version.",
    "code": "func (n *Node) Insert(v int) *Node {\n  if n == nil {\n    return &Node{Val: v}\n  }\n  if v < n.Val {\n    n.Left = n.Left.Insert(v)\n  } else {\n    n.Right = n.Right.Insert(v)\n  }\n  return n\n}",
    "quiz": [
      {
        "question": "In-order traversal of a valid BST yields:",
        "options": [
          "Values in sorted order",
          "Reverse insertion order",
          "Random order"
        ],
        "answer": 0,
        "why": "Left, node, right."
      },
      {
        "question": "Inserting 1,2,3,4,5 in order into a plain BST produces:",
        "options": [
          "A balanced tree",
          "A heap",
          "A right-leaning chain of height n"
        ],
        "answer": 2,
        "why": "Search degrades to O(n)."
      },
      {
        "question": "For heap array index i, where is the left child?",
        "options": [
          "i+1",
          "i/2",
          "2i+1"
        ],
        "answer": 2,
        "why": "The right child is 2i+2 and the parent is (i-1)/2."
      },
      {
        "question": "Cost of pop-min on a binary heap?",
        "options": [
          "O(log n)",
          "O(1)",
          "O(n)"
        ],
        "answer": 0,
        "why": "Sift down along one path."
      },
      {
        "question": "Top-k from a stream with a min-heap of size k costs:",
        "options": [
          "O(n^2) time",
          "O(n log k) time and O(k) memory",
          "O(n log n) time and O(n) memory"
        ],
        "answer": 1,
        "why": "Each item costs O(log k)."
      }
    ],
    "exercise": "Add in-order traversal and height to the BST. Then use container/heap to find the k largest numbers in a stream."
  },
  {
    "id": "d6",
    "lane": "ds",
    "title": "Graphs: BFS and DFS",
    "requires": [
      "d5"
    ],
    "text": "## Why this lesson matters\n\nA graph is the most general way to describe things and the relationships between them, and once you can see graphs, you see them everywhere. Social networks are graphs of people. The web is a graph of pages and links. A build system is a graph of tasks and the dependencies between them. A microservice architecture is a graph of services calling each other, and your cloud network is a graph of subnets and routes. When an architect asks \"if this service goes down, what else breaks?\" or \"do these modules depend on each other in a circle?\", they are asking graph questions.\n\nBy the end of this lesson you should know the vocabulary of graphs, choose between the standard representations, implement breadth-first search and depth-first search in Go, use them to find shortest paths, connected components and cycles, solve grid problems, and connect these tools to real design questions about dependencies and failure.\n\n## Vocabulary\n\nA graph consists of nodes, also called vertices, and edges that connect pairs of nodes. In an undirected graph an edge works in both directions, like a friendship. In a directed graph, or digraph, an edge has a direction, like a service calling another, or one task depending on another. A weighted graph attaches a number to each edge, such as a distance or a cost. The degree of a node is how many edges touch it.\n\nA path is a sequence of edges leading from one node to another, and a cycle is a path that returns to its starting node. A graph is connected if every node can reach every other. A directed graph with no cycles is called a DAG, a directed acyclic graph, and it is the structure of valid dependency systems: package managers, build tools and workflow engines all require one. Trees are a special case: a connected graph with no cycles. Graph sizes are written in terms of V, the number of vertices, and E, the number of edges, and most algorithms are described by how they scale with both.\n\n## Representing a graph\n\nThere are three standard ways to store a graph. An adjacency matrix is a V by V table where cell [i][j] says whether an edge exists from i to j. Checking a specific edge is O(1), but the table needs O(V^2) memory regardless of how many edges exist, which is wasteful for the sparse graphs typical in practice. An adjacency list stores, for each node, a list of its neighbours. It takes O(V + E) memory and lets you iterate over a node's neighbours efficiently, and it is the default choice. An edge list is simply a list of pairs, convenient as input and for algorithms that process edges in bulk.\n\nIn Go, a map from node to a slice of neighbours is the quickest way to build an adjacency list, and it works for any comparable node type, such as strings naming services.\n\n```go\ntype Graph struct {\n  adj      map[string][]string\n  directed bool\n}\n\nfunc NewGraph(directed bool) *Graph {\n  return &Graph{adj: map[string][]string{}, directed: directed}\n}\n\nfunc (g *Graph) AddEdge(a, b string) {\n  g.adj[a] = append(g.adj[a], b)\n  if !g.directed {\n    g.adj[b] = append(g.adj[b], a)\n  } else if _, ok := g.adj[b]; !ok {\n    g.adj[b] = nil\n  }\n}\n```\n\nFor directed graphs the last branch makes sure the target node also appears as a key, even with no outgoing edges, so that loops over all nodes do not miss it. When nodes are numbered 0 to V-1, a slice of slices, [][]int, is faster and simpler.\n\n## Breadth-first search\n\nBreadth-first search, BFS, explores a graph in rings. It visits the start node, then all nodes one edge away, then all nodes two edges away, and so on. The tool is a queue: take a node from the front, then add its unvisited neighbours to the back. A visited set prevents going around in circles, which would otherwise make the search loop forever on any graph containing a cycle.\n\nBecause BFS reaches nodes in order of their distance from the start, measured in number of edges, the first time it reaches a node is along a shortest path. To recover that path, record for each node the node it was discovered from, called its parent, then walk the parents backward from the target.\n\n```go\nfunc (g *Graph) ShortestPath(from, to string) []string {\n  parent := map[string]string{from: \"\"}\n  queue := []string{from}\n  for len(queue) > 0 {\n    cur := queue[0]\n    queue = queue[1:]\n    if cur == to {\n      break\n    }\n    for _, nb := range g.adj[cur] {\n      if _, seen := parent[nb]; !seen {\n        parent[nb] = cur\n        queue = append(queue, nb)\n      }\n    }\n  }\n  if _, ok := parent[to]; !ok {\n    return nil\n  }\n  var path []string\n  for at := to; at != \"\"; at = parent[at] {\n    path = append(path, at)\n  }\n  slices.Reverse(path)\n  return path\n}\n```\n\nThe parent map doubles as the visited set: a node is seen if it has a parent entry. Marking a node as visited when you enqueue it, not when you dequeue it, matters. Otherwise the same node can be enqueued many times by different neighbours, wasting work and, in dense graphs, blowing up the queue. This version uses the empty string as the start's marker, so it assumes no real node has an empty name.\n\nBFS visits each node once and examines each edge once, so it runs in O(V + E) time and uses O(V) space for the queue and visited set. It finds shortest paths only when all edges count the same. With weights, you need Dijkstra's algorithm, which uses the heap from the previous lesson and is covered in the algorithms track.\n\n## Depth-first search\n\nDepth-first search, DFS, takes the opposite strategy: go as deep as possible along one path, and back up only when stuck. The natural implementation is recursion, which uses the call stack as its stack.\n\n```go\nfunc (g *Graph) DFS(start string, visit func(string)) {\n  seen := map[string]bool{}\n  var walk func(string)\n  walk = func(n string) {\n    seen[n] = true\n    visit(n)\n    for _, nb := range g.adj[n] {\n      if !seen[nb] {\n        walk(nb)\n      }\n    }\n  }\n  walk(start)\n}\n```\n\nDeclaring walk before assigning it lets the closure call itself. The time is again O(V + E). The recursion depth can reach V on a long chain, and although Go stacks grow dynamically, a graph of millions of nodes in a line can still use a lot of memory. An iterative version replaces recursion with an explicit stack.\n\n```go\nfunc (g *Graph) DFSIter(start string, visit func(string)) {\n  stack := []string{start}\n  seen := map[string]bool{}\n  for len(stack) > 0 {\n    n := stack[len(stack)-1]\n    stack = stack[:len(stack)-1]\n    if seen[n] {\n      continue\n    }\n    seen[n] = true\n    visit(n)\n    for _, nb := range g.adj[n] {\n      if !seen[nb] {\n        stack = append(stack, nb)\n      }\n    }\n  }\n}\n```\n\nNotice that this version checks visited when popping, because a node can be pushed several times before it is first visited. The two traversals look nearly identical: swap the queue for a stack and you convert BFS into DFS. That symmetry is worth internalising.\n\n## When to use which\n\nUse BFS when you want the shortest path in an unweighted graph, or you need to process nodes level by level, such as finding everything within three hops. Use DFS when you want to explore all possibilities or the structure of the graph: finding connected components, detecting cycles, ordering nodes topologically, solving mazes and puzzles with backtracking. Both give the same reachability answers, so for the question \"can I get from A to B?\" either works.\n\n## Connected components\n\nTo count the groups of nodes that are connected to each other in an undirected graph, start a search from any unvisited node, mark everything it reaches as one component, then repeat from the next unvisited node. Each node and edge is processed once overall, so the total is O(V + E).\n\n```go\nfunc (g *Graph) Components() int {\n  seen := map[string]bool{}\n  count := 0\n  for start := range g.adj {\n    if seen[start] {\n      continue\n    }\n    count++\n    queue := []string{start}\n    seen[start] = true\n    for len(queue) > 0 {\n      cur := queue[0]\n      queue = queue[1:]\n      for _, nb := range g.adj[cur] {\n        if !seen[nb] {\n          seen[nb] = true\n          queue = append(queue, nb)\n        }\n      }\n    }\n  }\n  return count\n}\n```\n\nThis answers real questions: how many separate clusters of services exist, whether a network is partitioned, or how many groups of friends there are.\n\n## Detecting cycles in a directed graph\n\nA cycle in a dependency graph is a design defect, since nothing in the loop can start first. DFS detects cycles with a three-colour scheme. A node is white if it has not been seen, grey while it is on the current recursion path, and black once all of its descendants are finished. If DFS meets a grey node, it has found an edge back into the current path, which is a cycle.\n\n```go\nfunc (g *Graph) HasCycle() bool {\n  const (\n    white = iota\n    gray\n    black\n  )\n  color := map[string]int{}\n  var visit func(string) bool\n  visit = func(n string) bool {\n    color[n] = gray\n    for _, nb := range g.adj[n] {\n      if color[nb] == gray {\n        return true\n      }\n      if color[nb] == white && visit(nb) {\n        return true\n      }\n    }\n    color[n] = black\n    return false\n  }\n  for n := range g.adj {\n    if color[n] == white && visit(n) {\n      return true\n    }\n  }\n  return false\n}\n```\n\nThe same DFS also produces a valid dependency order: if you record each node as it turns black and then reverse that list, every node appears before the nodes that depend on it. That is one way to compute a topological order. The algorithms track shows a second way, Kahn's algorithm, which uses in-degree counts and a queue.\n\n## Grids are graphs\n\nMany problems present a grid, such as a maze or a map, rather than an explicit graph. Treat each cell as a node, and its four neighbours as adjacent nodes, generated on the fly using direction offsets. BFS then finds the shortest path through a maze.\n\n```go\nfunc shortestMaze(grid [][]byte, sr, sc, tr, tc int) int {\n  rows, cols := len(grid), len(grid[0])\n  dist := make([][]int, rows)\n  for i := range dist {\n    dist[i] = make([]int, cols)\n    for j := range dist[i] {\n      dist[i][j] = -1\n    }\n  }\n  dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}\n  dist[sr][sc] = 0\n  queue := [][2]int{{sr, sc}}\n  for len(queue) > 0 {\n    cur := queue[0]\n    queue = queue[1:]\n    if cur[0] == tr && cur[1] == tc {\n      return dist[tr][tc]\n    }\n    for _, d := range dirs {\n      r, c := cur[0]+d[0], cur[1]+d[1]\n      if r >= 0 && r < rows && c >= 0 && c < cols &&\n        grid[r][c] != '#' && dist[r][c] == -1 {\n        dist[r][c] = dist[cur[0]][cur[1]] + 1\n        queue = append(queue, [2]int{r, c})\n      }\n    }\n  }\n  return -1\n}\n```\n\nThe distance table doubles as the visited set, with -1 meaning unvisited. Always check the bounds before reading the grid. Counting islands in a grid of land and water is the same code with DFS or BFS flood fill and a counter, which is a staple interview problem and a variant of connected components.\n\n## Graphs in architecture\n\nThe tools of this lesson answer concrete design questions. Run a reachability search from a failing service along the \"calls\" edges backwards, and the set it reaches is the blast radius of its failure. Run cycle detection on the module import graph to find circular dependencies, which make code hard to test and deploy independently. Count connected components of a network graph to find isolated segments. Find the shortest chain of calls between two services to understand latency. Tools that draw dependency diagrams of your cloud infrastructure, or check that a deployment pipeline has no circular stages, are running exactly these algorithms.\n\n## Common mistakes\n\nForgetting a visited set, so the search loops forever on cycles. Marking nodes visited too late in BFS, causing duplicate queue entries. Searching only from one start node and missing other components. Using BFS for weighted shortest paths. Recursing too deep on huge graphs. Forgetting that undirected edges must be added in both directions. Reading outside the grid bounds. Treating the empty string or zero as both a real node and a sentinel.\n\n## Recap\n\nA graph is nodes and edges, stored best as an adjacency list with O(V + E) space. BFS uses a queue and finds shortest paths in unweighted graphs, while DFS uses recursion or a stack and suits exploration, components, cycle detection and ordering. Both run in O(V + E) with a visited set. Grids are implicit graphs, and architectural questions about dependencies, blast radius and cycles are graph questions in disguise.\n\nTake the quick check, then do the exercises: find the shortest path through a grid maze with BFS, and write a cycle detector for a service dependency graph. The capstone project at the end of the course builds on exactly these two skills, so make sure both feel comfortable.",
    "code": "func bfs(g map[int][]int, start int) []int {\n  seen := map[int]bool{start: true}\n  order, queue := []int{}, []int{start}\n  for len(queue) > 0 {\n    cur := queue[0]\n    queue = queue[1:]\n    order = append(order, cur)\n    for _, nb := range g[cur] {\n      if !seen[nb] {\n        seen[nb] = true\n        queue = append(queue, nb)\n      }\n    }\n  }\n  return order\n}",
    "quiz": [
      {
        "question": "Which structure does BFS use?",
        "options": [
          "Stack",
          "Heap",
          "Queue"
        ],
        "answer": 2,
        "why": "Swap the queue for a stack to get DFS."
      },
      {
        "question": "BFS finds shortest paths in which graphs?",
        "options": [
          "Unweighted graphs",
          "Graphs with negative weights",
          "Only trees"
        ],
        "answer": 0,
        "why": "Weighted graphs need Dijkstra."
      },
      {
        "question": "Time complexity of BFS or DFS with an adjacency list?",
        "options": [
          "O(V^2)",
          "O(V+E)",
          "O(E log V)"
        ],
        "answer": 1,
        "why": "Each node and edge is processed once."
      },
      {
        "question": "In three-colour DFS, meeting a grey node means:",
        "options": [
          "The node is unvisited",
          "The node is finished",
          "A cycle exists"
        ],
        "answer": 2,
        "why": "Grey nodes are on the current path."
      },
      {
        "question": "Why mark a node visited when enqueueing in BFS?",
        "options": [
          "Go requires it",
          "To avoid enqueueing the same node several times",
          "To save stack space"
        ],
        "answer": 1,
        "why": "Marking at dequeue allows duplicates."
      }
    ],
    "exercise": "Find the shortest path through a grid maze with BFS. Then write a cycle detector for a service dependency graph."
  },
  {
    "id": "c1",
    "lane": "al",
    "title": "Capstone: dependency analyzer",
    "requires": [
      "g6",
      "d6",
      "a6"
    ],
    "text": "Combine both tracks in a small tool an architect would actually use: read service dependencies from a file, report cycles, and print a valid start-up order (a topological sort). Include tests and a benchmark.",
    "code": "const dependencies = `\napi -> auth\napi -> db\nauth -> db\n`\n\nconst wantStartOrder = \"db, auth, api\"",
    "quiz": [
      {
        "question": "What does a cycle in a dependency graph mean?",
        "options": [
          "Nothing, order still exists",
          "No valid build order exists",
          "The graph is a tree"
        ],
        "answer": 1,
        "why": "A topological order requires a directed acyclic graph."
      }
    ],
    "exercise": "Build the CLI in Go with a go.mod, at least three tests (including a cycle case), and a README. Keep it in Git."
  },
  {
    "id": "a1",
    "lane": "al",
    "title": "Sorting: simple to merge sort",
    "requires": [
      "d2"
    ],
    "text": "## Why this lesson matters\n\nSorting looks like a solved problem, since every language has a sort function, but it remains one of the best places to learn how to think about algorithms. It shows the difference between quadratic and n log n growth with numbers you can feel. It introduces divide and conquer, stability, in-place versus extra-memory trade-offs, and the idea that a problem can have a provable lower bound. It also matters in daily engineering: sorted data unlocks binary search, merging, deduplication and range queries, and sorting at scale is the heart of databases, search engines and big-data pipelines.\n\nBy the end of this lesson you should be able to write insertion sort, selection sort, merge sort and quicksort in Go, state the time, space and stability of each, explain why comparison sorting cannot beat n log n, use the standard library correctly, and recognise when a non-comparison sort or a different design is the better choice.\n\n## What makes one sort different from another\n\nFour properties are worth knowing for any sorting algorithm. The first is time complexity, in the best, average and worst case. The second is extra space: an in-place algorithm needs only O(1) additional memory beyond the input, while others allocate working buffers. The third is stability: a stable sort keeps items that compare as equal in their original relative order. This matters whenever you sort by more than one key. If you sort a list of people by name and then stably by age, people of the same age stay in name order. The fourth is adaptivity: whether the algorithm runs faster when the input is already nearly sorted.\n\n## Insertion sort\n\nInsertion sort works the way many people sort a hand of playing cards. Keep the left part of the array sorted. Take the next element, and slide it left past every larger element until it sits in the right place.\n\n```go\nfunc insertionSort(a []int) {\n  for i := 1; i < len(a); i++ {\n    key := a[i]\n    j := i - 1\n    for j >= 0 && a[j] > key {\n      a[j+1] = a[j]\n      j--\n    }\n    a[j+1] = key\n  }\n}\n```\n\nIn the worst case, a reversed array, every element moves all the way to the front, so the cost is about n^2 / 2 comparisons and shifts: O(n^2). In the best case, an already sorted array, the inner loop never runs and the cost is O(n). It is stable, in place, and adaptive. For small or nearly sorted inputs it is hard to beat, because its inner loop is tiny and cache friendly. That is why production sort implementations switch to insertion sort for short ranges.\n\n## Selection sort and bubble sort\n\nSelection sort repeatedly finds the smallest remaining element and swaps it to the front.\n\n```go\nfunc selectionSort(a []int) {\n  for i := 0; i < len(a); i++ {\n    lo := i\n    for j := i + 1; j < len(a); j++ {\n      if a[j] < a[lo] {\n        lo = j\n      }\n    }\n    a[i], a[lo] = a[lo], a[i]\n  }\n}\n```\n\nIt always does about n^2 / 2 comparisons whatever the input, so it is O(n^2) in every case, and the standard version is not stable. Its one virtue is that it performs at most n swaps, useful only when writes are far more expensive than reads. Bubble sort, which repeatedly swaps adjacent out-of-order pairs, is a famous teaching example but has no practical advantage over insertion sort. You should be able to recognise both, and know why you will not use them.\n\n## Merge sort\n\nMerge sort is the first sort that reaches O(n log n) in every case, and it is the cleanest example of divide and conquer. The recipe has three steps. Split the array into two halves. Sort each half recursively. Merge the two sorted halves into one sorted result.\n\n```go\nfunc mergeSort(a []int) []int {\n  if len(a) <= 1 {\n    return a\n  }\n  mid := len(a) / 2\n  left := mergeSort(a[:mid])\n  right := mergeSort(a[mid:])\n  return merge(left, right)\n}\n\nfunc merge(l, r []int) []int {\n  out := make([]int, 0, len(l)+len(r))\n  i, j := 0, 0\n  for i < len(l) && j < len(r) {\n    if l[i] <= r[j] {\n      out = append(out, l[i])\n      i++\n    } else {\n      out = append(out, r[j])\n      j++\n    }\n  }\n  out = append(out, l[i:]...)\n  out = append(out, r[j:]...)\n  return out\n}\n```\n\nThe merge step is the heart of it. Because both inputs are already sorted, you only compare their front elements, take the smaller, and advance. Each element is moved once, so merging n items costs O(n). Using <= when the two fronts are equal takes the left element first, which makes the sort stable.\n\nThe cost follows from the shape of the recursion. Halving repeatedly gives about log2 n levels. At each level the merges together touch all n elements, costing O(n) per level. Multiply and you get O(n log n), in the best, average and worst cases alike. The price is O(n) extra memory for the merged output, so this version is not in place. Merge sort is stable, predictable, and parallelises naturally since the two halves are independent.\n\nA deeper idea is that merging works on streams. You never need random access to the data, only to read each sorted run from front to back. This is why merge sort is the basis of external sorting, where data is too big for memory: sort chunks that fit in memory, write them to disk as sorted runs, then merge the runs. Database engines, MapReduce style systems and the compaction process in log-structured storage engines all work this way, as does the sort-merge join.\n\n## Quicksort\n\nQuicksort also divides and conquers, but does the work before recursing rather than after. Pick a pivot element and partition the array so that everything smaller than the pivot comes before it and everything larger comes after. The pivot is then in its final position. Recursively sort the two sides.\n\n```go\nfunc quickSort(a []int) {\n  if len(a) < 2 {\n    return\n  }\n  p := partition(a)\n  quickSort(a[:p])\n  quickSort(a[p+1:])\n}\n\nfunc partition(a []int) int {\n  mid := len(a) / 2\n  a[mid], a[len(a)-1] = a[len(a)-1], a[mid]\n  pivot := a[len(a)-1]\n  i := 0\n  for j := 0; j < len(a)-1; j++ {\n    if a[j] < pivot {\n      a[i], a[j] = a[j], a[i]\n      i++\n    }\n  }\n  a[i], a[len(a)-1] = a[len(a)-1], a[i]\n  return i\n}\n```\n\nThe partition scans once, keeping the boundary i between the elements known to be smaller than the pivot and the rest, then places the pivot at that boundary. Quicksort sorts in place, needing only O(log n) stack space on average, and it has excellent cache behaviour, which is why it is often the fastest in practice. Its average time is O(n log n). But its worst case is O(n^2), which occurs when the pivots are consistently the smallest or largest element, so that one side of each partition is nearly empty. Choosing the middle element or a random one makes the worst case unlikely for typical data, and this simple version still degrades on inputs with many equal elements, because equal values all fall to one side. Production implementations use median-of-three pivots, three-way partitioning for duplicates, and a fallback to heap sort if recursion gets too deep. Quicksort is not stable.\n\n## Heap sort and the n log n barrier\n\nHeap sort builds a heap from the array, then repeatedly removes the maximum and places it at the end. It is O(n log n) in every case and works in place, but it is usually slower than quicksort in practice because of poor cache locality, and it is not stable. Its main role is as the safe fallback inside hybrid sorts.\n\nIs O(n log n) the best possible? For algorithms that sort by comparing pairs of elements, yes, and you can prove it. An array of n distinct items can be arranged in n! ways, and a sorting algorithm must identify which one is the input. Each comparison has two outcomes, so after k comparisons the algorithm can distinguish at most 2^k cases. To tell apart n! cases you need 2^k to be at least n!, which means k is at least log2 of n!, and that is about n log n. Therefore no comparison sort can beat n log n in the worst case. It is a rare and valuable thing in computer science to know a problem's exact difficulty.\n\n## Beating the barrier: counting and radix sort\n\nThe bound only applies to comparison sorts. If the keys are small integers, you can sort without comparing. Counting sort tallies how many times each value occurs and then writes them out in order.\n\n```go\nfunc countingSort(a []int, maxVal int) []int {\n  counts := make([]int, maxVal+1)\n  for _, x := range a {\n    counts[x]++\n  }\n  out := make([]int, 0, len(a))\n  for v, c := range counts {\n    for ; c > 0; c-- {\n      out = append(out, v)\n    }\n  }\n  return out\n}\n```\n\nThis runs in O(n + k), where k is the range of values, and uses O(k) extra memory. It is excellent for ages, scores, or byte values, and useless when the range is huge. Radix sort extends the idea to larger numbers or strings by sorting digit by digit with a stable counting sort at each position. The lesson for design is general: extra knowledge about your data, such as a small key range, can let you do better than the generic algorithm.\n\n## Sorting in Go\n\nIn practice you almost never write a sort yourself. The standard library provides well-tuned implementations. For basic types, use slices.Sort, or the older sort.Ints and sort.Strings. For custom ordering, use slices.SortFunc with a comparison function that returns a negative number, zero or a positive number, or sort.Slice with a less function. Go's implementation is a pattern-defeating quicksort, a hybrid that adapts to the input and avoids the quadratic worst case.\n\n```go\ntype Person struct {\n  Name string\n  Age  int\n}\n\npeople := []Person{{\"Ann\", 30}, {\"Bob\", 25}, {\"Cy\", 30}}\nslices.SortStableFunc(people, func(a, b Person) int {\n  return cmp.Compare(a.Age, b.Age)\n})\n```\n\nThe default sorts are not guaranteed stable. When equal elements must keep their order, as in multi-key sorting, use slices.SortStableFunc or sort.SliceStable. To compare by several fields, compare the first and, if it is equal, fall through to the next, or sort by the secondary key first and then use a stable sort on the primary. A frequent bug is an inconsistent comparison function, such as using <= instead of <, which can confuse the algorithm, so always write strict comparisons.\n\nBefore sorting a huge slice, ask whether you need a full sort. If you only need the smallest k items, a heap does it in O(n log k). If you need only the median, a selection algorithm does it in O(n) on average. And if data arrives continually, keeping it in a sorted structure or a heap beats resorting each time.\n\n## Testing a sort\n\nSorting is ideal for property-based testing because the correct answer is easy to state: the output is in order and is a permutation of the input. Compare your implementation against the standard library on many random inputs of many sizes, including empty, single element, duplicates and already sorted data.\n\n```go\nfunc TestMergeSort(t *testing.T) {\n  for n := 0; n < 200; n++ {\n    in := make([]int, n)\n    for i := range in {\n      in[i] = rand.Intn(50)\n    }\n    want := slices.Clone(in)\n    slices.Sort(want)\n    got := mergeSort(slices.Clone(in))\n    if !slices.Equal(got, want) {\n      t.Fatalf(\"n=%d: got %v want %v\", n, got, want)\n    }\n  }\n}\n```\n\nUsing a small range, 50 values for up to 200 elements, forces many duplicates, which is where partition bugs hide. Follow up with benchmarks at several sizes, using the method from the Big-O lesson, and watch insertion sort fall behind as n grows while merge sort and the library sort stay close to n log n.\n\n## Sorting as a building block\n\nSorting is rarely the goal. It is a preprocessing step that makes other algorithms possible. Once data is sorted, you can use binary search, which the next lesson covers, remove duplicates by comparing neighbours, find the closest pair, merge overlapping intervals by scanning once, or match two lists by walking both. Many problems that look quadratic collapse to O(n log n) after sorting, with the sort as the dominant cost.\n\n## Common mistakes\n\nUsing bubble or selection sort on large inputs. Assuming sort.Slice is stable. Writing a comparison function that is not a strict ordering. Sorting repeatedly inside a loop when one sort outside would do. Quicksort with a naive pivot on sorted or duplicate-heavy data. Forgetting to copy the slice when you must not modify the caller's data, since sorting in place changes it. Sorting everything when you only need the top few.\n\n## Recap\n\nInsertion, selection and bubble sort are O(n^2), with insertion sort useful for small or nearly sorted data. Merge sort is O(n log n) always, stable, and needs O(n) extra space, and its merge step scales to external sorting. Quicksort is O(n log n) on average, in place and fast in practice, but O(n^2) in the worst case and not stable. No comparison sort can beat n log n, but counting and radix sorts do better when keys have a small range. In Go, use slices.Sort and the stable variants, and test against them.\n\nTake the quick check, then do the exercise: implement insertion sort and merge sort, test them on empty, sorted, reversed and duplicate-heavy slices, and benchmark them against sort.Ints on 100,000 elements. The size at which merge sort overtakes insertion sort on your machine is a number worth knowing.",
    "code": "func insertionSort(a []int) {\n  for i := 1; i < len(a); i++ {\n    key, j := a[i], i-1\n    for j >= 0 && a[j] > key {\n      a[j+1] = a[j]\n      j--\n    }\n    a[j+1] = key\n  }\n}",
    "quiz": [
      {
        "question": "Which sort is O(n log n) in all cases and stable?",
        "options": [
          "Merge sort",
          "Quicksort",
          "Selection sort"
        ],
        "answer": 0,
        "why": "It always halves and merges."
      },
      {
        "question": "Worst case of quicksort with bad pivots?",
        "options": [
          "O(n log n)",
          "O(n)",
          "O(n^2)"
        ],
        "answer": 2,
        "why": "One side of each partition is nearly empty."
      },
      {
        "question": "What does stable mean for a sort?",
        "options": [
          "It never panics",
          "Equal elements keep their original relative order",
          "It uses no extra memory"
        ],
        "answer": 1,
        "why": "Important for multi-key sorting."
      },
      {
        "question": "Lower bound for comparison sorting?",
        "options": [
          "O(n log n)",
          "O(n)",
          "O(log n)"
        ],
        "answer": 0,
        "why": "There are n! orderings to tell apart."
      },
      {
        "question": "When can counting sort beat n log n?",
        "options": [
          "Always",
          "Only if sorted already",
          "When keys are integers in a small range"
        ],
        "answer": 2,
        "why": "It runs in O(n + k)."
      }
    ],
    "exercise": "Implement insertion sort and merge sort. Test on empty, sorted, reversed and duplicate-heavy slices, then benchmark against sort.Ints on 100,000 elements."
  },
  {
    "id": "a2",
    "lane": "al",
    "title": "Binary search and its variants",
    "requires": [
      "a1"
    ],
    "text": "Binary search halves a sorted range each step, giving O(log n). Most bugs come from boundaries, so pick one convention (here: lo inclusive, hi exclusive) and keep it. The same idea finds the first or last match, an insert position, or the answer to a yes/no question over a range.",
    "code": "func lowerBound(a []int, x int) int {\n  lo, hi := 0, len(a)\n  for lo < hi {\n    mid := lo + (hi-lo)/2\n    if a[mid] < x {\n      lo = mid + 1\n    } else {\n      hi = mid\n    }\n  }\n  return lo\n}",
    "quiz": [
      {
        "question": "Why write lo + (hi-lo)/2 instead of (lo+hi)/2?",
        "options": [
          "It is faster",
          "It avoids integer overflow on huge indexes",
          "Go requires it"
        ],
        "answer": 1,
        "why": "Adding two large ints can overflow; the subtraction form cannot."
      }
    ],
    "exercise": "Find the first and last position of a target in a sorted slice with duplicates. Then search a rotated sorted slice, and compare your lowerBound with sort.SearchInts."
  },
  {
    "id": "a3",
    "lane": "al",
    "title": "Recursion and divide and conquer",
    "requires": [
      "a2"
    ],
    "text": "A recursive function solves a problem by calling itself on smaller inputs and needs a base case to stop. Divide and conquer splits a problem, solves the parts, and combines them (merge sort, quicksort). When subproblems repeat, cache results (memoization) to avoid exponential time.",
    "code": "func fib(n int, memo map[int]int) int {\n  if n < 2 {\n    return n\n  }\n  if v, ok := memo[n]; ok {\n    return v\n  }\n  memo[n] = fib(n-1, memo) + fib(n-2, memo)\n  return memo[n]\n}",
    "quiz": [
      {
        "question": "What does every recursive function need to terminate?",
        "options": [
          "A global counter",
          "A base case",
          "A goroutine"
        ],
        "answer": 1,
        "why": "Without a base case the calls never stop and the stack overflows."
      }
    ],
    "exercise": "Write power(x, n) in O(log n), sum of digits, and a function that returns all subsets of a slice. Compare plain and memoized fib for n = 40."
  },
  {
    "id": "a4",
    "lane": "al",
    "title": "Two pointers and sliding window",
    "requires": [
      "a3"
    ],
    "text": "Many O(n^2) scans become O(n) when two indexes move through the data once. Two pointers works on sorted data (pair with a target sum). A sliding window keeps a running state for a range that grows and shrinks, such as the longest substring with no repeats.",
    "code": "func longestUnique(s string) int {\n  last := map[byte]int{}\n  best, start := 0, 0\n  for i := 0; i < len(s); i++ {\n    if j, ok := last[s[i]]; ok && j >= start {\n      start = j + 1\n    }\n    last[s[i]] = i\n    if i-start+1 > best {\n      best = i - start + 1\n    }\n  }\n  return best\n}",
    "quiz": [
      {
        "question": "Why does a sliding window beat checking every subarray?",
        "options": [
          "It reuses work as the window moves",
          "It sorts the data first",
          "It uses more memory"
        ],
        "answer": 0,
        "why": "Each element enters and leaves the window once, so total work is linear."
      }
    ],
    "exercise": "Implement max sum of any subarray of size k, a sorted pair-sum finder with two pointers, and add tests for longestUnique (empty string, all same, all different)."
  },
  {
    "id": "a5",
    "lane": "al",
    "title": "Dynamic programming",
    "requires": [
      "a4"
    ],
    "text": "Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing answers in a table. Define what dp[i] means, set the base case, then fill the table using earlier entries. It turns many exponential recursions into polynomial time.",
    "code": "func minCoins(coins []int, amount int) int {\n  dp := make([]int, amount+1)\n  for i := 1; i <= amount; i++ {\n    dp[i] = amount + 1\n    for _, c := range coins {\n      if c <= i && dp[i-c]+1 < dp[i] {\n        dp[i] = dp[i-c] + 1\n      }\n    }\n  }\n  if dp[amount] > amount {\n    return -1\n  }\n  return dp[amount]\n}",
    "quiz": [
      {
        "question": "When is dynamic programming a good fit?",
        "options": [
          "Subproblems overlap and combine into an optimal answer",
          "The input is already sorted",
          "There is only one subproblem"
        ],
        "answer": 0,
        "why": "Overlap is what makes caching pay off."
      }
    ],
    "exercise": "Solve climbing stairs, coin change, and longest common subsequence. For each, write in one sentence what dp[i] (or dp[i][j]) means before coding."
  },
  {
    "id": "a6",
    "lane": "al",
    "title": "Graph algorithms: topological sort and Dijkstra",
    "requires": [
      "a5",
      "d6"
    ],
    "text": "Topological sort orders a directed acyclic graph so every dependency comes first; Kahn's algorithm repeatedly removes nodes with no incoming edges. If it cannot place every node, there is a cycle. Dijkstra finds shortest paths in graphs with non-negative weights using a priority queue.",
    "code": "func topo(n int, edges [][2]int) ([]int, bool) {\n  adj := make([][]int, n)\n  indeg := make([]int, n)\n  for _, e := range edges {\n    adj[e[0]] = append(adj[e[0]], e[1])\n    indeg[e[1]]++\n  }\n  queue, order := []int{}, []int{}\n  for i := 0; i < n; i++ {\n    if indeg[i] == 0 {\n      queue = append(queue, i)\n    }\n  }\n  for len(queue) > 0 {\n    cur := queue[0]\n    queue = queue[1:]\n    order = append(order, cur)\n    for _, nb := range adj[cur] {\n      indeg[nb]--\n      if indeg[nb] == 0 {\n        queue = append(queue, nb)\n      }\n    }\n  }\n  return order, len(order) == n\n}",
    "quiz": [
      {
        "question": "Kahn's algorithm returns fewer than n nodes. What does that mean?",
        "options": [
          "The graph has a cycle",
          "The graph is a tree",
          "The input was sorted"
        ],
        "answer": 0,
        "why": "Nodes inside a cycle never reach in-degree zero."
      }
    ],
    "exercise": "Implement Dijkstra with container/heap on a weighted graph. Run topo on a list of service dependencies, and explain why Dijkstra breaks with negative edge weights."
  },
  {
    "id": "a7",
    "lane": "al",
    "title": "Greedy and backtracking",
    "requires": [
      "a6"
    ],
    "text": "A greedy algorithm takes the best local choice at each step and never undoes it; it is fast but only correct when the problem allows it. Backtracking explores choices depth first and undoes (backtracks) when a path fails. Learn to tell when greedy is safe and when you must search.",
    "code": "func subsets(nums []int) [][]int {\n  var res [][]int\n  var path []int\n  var walk func(i int)\n  walk = func(i int) {\n    if i == len(nums) {\n      res = append(res, append([]int(nil), path...))\n      return\n    }\n    walk(i + 1)\n    path = append(path, nums[i])\n    walk(i + 1)\n    path = path[:len(path)-1]\n  }\n  walk(0)\n  return res\n}",
    "quiz": [
      {
        "question": "Which strategy commits to the best local choice and never reverses it?",
        "options": [
          "Backtracking",
          "Greedy",
          "Memoization"
        ],
        "answer": 1,
        "why": "Greedy trades exhaustive search for speed, so it needs a proof or a counterexample check."
      }
    ],
    "exercise": "Solve interval scheduling greedily (most non-overlapping meetings) and N-Queens for n = 6 with backtracking. Show a coin set (1, 3, 4 and amount 6) where greedy fails."
  }
];
