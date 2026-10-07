export type Lesson = {
  id: string;
  lane: "go" | "ds";
  title: string;
  requires: string[];
  text: string;
  code: string;
  quiz: { question: string; options: string[]; answer: number; why: string };
  exercise: string;
};

export const LANES = {
  go: { name: "Go language", path: "Go path" },
  ds: { name: "Data structures", path: "Data structures path" },
} as const;

export const LESSONS: Lesson[] = [
  {
    id: "g1",
    lane: "go",
    title: "Setup and Hello World",
    requires: [],
    text: "Install Go from go.dev/dl and check it with go version. A module is a project with a go.mod file; go run . compiles and runs it, and go build produces a binary.",
    code: `package main

import "fmt"

func main() {
  fmt.Println("Hello, architect")
}`,
    quiz: {
      question: "Which command creates a new module?",
      options: ["go mod init example.com/hello", "go new module", "go build init"],
      answer: 0,
      why: "go mod init writes go.mod, which names the module and tracks dependencies.",
    },
    exercise:
      "Create a module, print your name and the Go version using runtime.Version(), then build it into a binary and run that.",
  },
  {
    id: "g2",
    lane: "go",
    title: "Types, variables, control flow",
    requires: ["g1"],
    text: 'Go is statically typed. Inside functions, := declares and infers a type. Uninitialized variables get a zero value (0, "", false, nil). There is only one loop keyword, for, and switch cases do not fall through. The loop below adds the odd numbers 1, 3 and 5, so it prints 9.',
    code: `total := 0
for i := 1; i <= 5; i++ {
  if i%2 == 0 {
    continue
  }
  total += i
}
fmt.Println(total)`,
    quiz: {
      question: "What is the zero value of an uninitialized string?",
      options: ["nil", '"" (empty string)', "undefined"],
      answer: 1,
      why: "Every type has a usable zero value, which removes a whole class of uninitialized-variable bugs.",
    },
    exercise: "Print FizzBuzz for 1 to 30, then compute 10 factorial with a loop.",
  },
  {
    id: "g3",
    lane: "go",
    title: "Functions, errors, defer",
    requires: ["g2"],
    text: "Functions can return multiple values. Errors are ordinary values: return them and check if err != nil. defer schedules a call for when the function exits (last in, first out), which is ideal for closing files.",
    code: `func divide(a, b float64) (float64, error) {
  if b == 0 {
    return 0, errors.New("divide by zero")
  }
  return a / b, nil
}`,
    quiz: {
      question: "How does idiomatic Go signal failure?",
      options: ["It throws an exception", "It returns an error as the last result", "It always returns -1"],
      answer: 1,
      why: "There are no exceptions for normal failures; callers handle the error value explicitly.",
    },
    exercise:
      "Write parseAge(s string) (int, error) using strconv.Atoi. Reject negatives, and wrap errors with fmt.Errorf and the %w verb.",
  },
  {
    id: "g4",
    lane: "go",
    title: "Slices, maps, structs",
    requires: ["g3"],
    text: "A slice is a window onto an array with a length and capacity; append may allocate a new array. A map is an unordered hash table. Reading a missing key gives the zero value, so use the comma-ok form to tell the difference: the example prints \"missing 0\". A struct groups named fields.",
    code: `nums := []int{1, 2, 3}
nums = append(nums, 4)
ages := map[string]int{"ada": 36}
if age, ok := ages["bob"]; !ok {
  fmt.Println("missing", age)
}`,
    quiz: {
      question: "What does reading a missing map key return?",
      options: ["A panic", "The zero value of the value type", "Always nil"],
      answer: 1,
      why: "Use v, ok := m[k] when you need to know whether the key exists.",
    },
    exercise: "Write a word-frequency counter for a string. Print words sorted by count using sort.Slice.",
  },
  {
    id: "g5",
    lane: "go",
    title: "Methods and interfaces",
    requires: ["g4"],
    text: "Methods attach to types. Pointer receivers can modify the value. Interfaces are satisfied implicitly: any type with the right methods fits, with no implements keyword. A common guideline is to accept interfaces and return concrete types.",
    code: `type Shape interface{ Area() float64 }

type Rect struct{ W, H float64 }

func (r Rect) Area() float64 { return r.W * r.H }`,
    quiz: {
      question: "How does a type satisfy a Go interface?",
      options: ["By declaring implements", "By having the required methods", "By embedding a base class"],
      answer: 1,
      why: "Implicit satisfaction keeps packages decoupled, which is a core architecture idea.",
    },
    exercise: "Add a Circle type and a function that sums the areas of a []Shape.",
  },
  {
    id: "g6",
    lane: "go",
    title: "Goroutines, channels, testing",
    requires: ["g5"],
    text: "go f() runs f concurrently. Channels pass values between goroutines, and sync.WaitGroup waits for them to finish. Tests live in _test.go files and run with go test ./... .",
    code: `func TestAdd(t *testing.T) {
  if got := Add(2, 3); got != 5 {
    t.Fatalf("got %d, want 5", got)
  }
}`,
    quiz: {
      question: "Which command runs every test in a module?",
      options: ["go test ./...", "go run test", "go check all"],
      answer: 0,
      why: "The ./... pattern means this directory and all subdirectories.",
    },
    exercise:
      "Start 5 goroutines that each send their index on a channel, and sum the results. Then write a table-driven test for a function of your own.",
  },
  {
    id: "d1",
    lane: "ds",
    title: "Big-O and measuring cost",
    requires: [],
    text: "Big-O describes how cost grows with input size n, ignoring constants: O(1), O(log n), O(n), O(n log n), O(n^2). Always measure too: Go has built-in benchmarks.",
    code: `func BenchmarkSum(b *testing.B) {
  for i := 0; i < b.N; i++ {
    Sum(data)
  }
}`,
    quiz: {
      question: "What is the cost of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(1)"],
      answer: 1,
      why: "Each step halves the search space.",
    },
    exercise: "Implement linear and binary search. Benchmark both on 1,000,000 sorted ints with go test -bench=.",
  },
  {
    id: "d2",
    lane: "ds",
    title: "Arrays and dynamic arrays",
    requires: ["d1", "g4"],
    text: "Arrays sit in contiguous memory, so indexing is O(1). Inserting or deleting in the middle is O(n) because elements shift. Go slices grow by reallocating with extra capacity, so append is amortized O(1).",
    code: `s := make([]int, 0, 2)
for i := 0; i < 5; i++ {
  s = append(s, i)
  fmt.Println(len(s), cap(s))
}`,
    quiz: {
      question: "What is the amortized cost of append on a slice?",
      options: ["O(1)", "O(n)", "O(log n)"],
      answer: 0,
      why: "Occasional reallocations are spread across many cheap appends.",
    },
    exercise:
      "Build a generic Stack[T] on a slice with Push, Pop, Peek. Then write removeAt(s, i) without leaking the old last element.",
  },
  {
    id: "d3",
    lane: "ds",
    title: "Linked lists, stacks, queues",
    requires: ["d2"],
    text: "A linked list stores nodes joined by pointers: inserting at the head is O(1), searching is O(n). A stack is last in, first out (undo history, call stacks). A queue is first in, first out (job queues, BFS).",
    code: `type Node struct {
  Val  int
  Next *Node
}`,
    quiz: {
      question: "Which structure removes from the front in O(1) without shifting?",
      options: ["Slice-backed queue", "Linked list with a head pointer", "Sorted array"],
      answer: 1,
      why: "Moving the head pointer is constant time; slicing off the front of a slice also works but can retain memory.",
    },
    exercise: "Reverse a singly linked list in place. Then build a queue from a linked list with head and tail pointers.",
  },
  {
    id: "d4",
    lane: "ds",
    title: "Hash maps",
    requires: ["d3"],
    text: "A hash function turns a key into a bucket index, giving O(1) average lookup, insert and delete. Collisions can degrade the worst case. Go map keys must be comparable. Hash maps power counting, deduplication, indexing and caches.",
    code: `seen := map[int]int{}
for i, n := range nums {
  if j, ok := seen[target-n]; ok {
    return []int{j, i}
  }
  seen[n] = i
}`,
    quiz: {
      question: "Why is a hash map lookup O(1) on average?",
      options: ["The keys are sorted", "The hash points straight to a bucket", "It uses binary search"],
      answer: 1,
      why: "No scanning is needed unless many keys collide.",
    },
    exercise: "Solve two-sum in O(n), detect duplicates in a slice, and group a list of words into anagram sets.",
  },
  {
    id: "d5",
    lane: "ds",
    title: "Trees and heaps",
    requires: ["d4"],
    text: "A binary search tree keeps smaller values left and larger right: O(log n) when balanced, O(n) when it degenerates into a list. A heap gives O(1) access to the min or max and O(log n) push and pop. Go provides container/heap.",
    code: `func (n *Node) Insert(v int) *Node {
  if n == nil {
    return &Node{Val: v}
  }
  if v < n.Val {
    n.Left = n.Left.Insert(v)
  } else {
    n.Right = n.Right.Insert(v)
  }
  return n
}`,
    quiz: {
      question: "What is the worst-case search time in an unbalanced BST?",
      options: ["O(1)", "O(log n)", "O(n)"],
      answer: 2,
      why: "Inserting sorted data produces a chain, and balanced variants such as AVL or red-black trees prevent it.",
    },
    exercise:
      "Add in-order traversal and height to the BST. Then use container/heap to find the k largest numbers in a stream.",
  },
  {
    id: "d6",
    lane: "ds",
    title: "Graphs: BFS and DFS",
    requires: ["d5"],
    text: "A graph is nodes plus edges, often stored as an adjacency list map[int][]int. BFS uses a queue and explores level by level, so it finds shortest paths in unweighted graphs. DFS uses a stack or recursion and suits cycle detection and ordering.",
    code: `func bfs(g map[int][]int, start int) []int {
  seen := map[int]bool{start: true}
  order, queue := []int{}, []int{start}
  for len(queue) > 0 {
    cur := queue[0]
    queue = queue[1:]
    order = append(order, cur)
    for _, nb := range g[cur] {
      if !seen[nb] {
        seen[nb] = true
        queue = append(queue, nb)
      }
    }
  }
  return order
}`,
    quiz: {
      question: "Why does BFS find shortest paths in unweighted graphs?",
      options: ["It explores nodes level by level", "It sorts the edges first", "It never revisits nodes"],
      answer: 0,
      why: "The first time BFS reaches a node is via the fewest edges.",
    },
    exercise:
      "Find the shortest path through a grid maze with BFS. Then write a cycle detector for a service dependency graph.",
  },
  {
    id: "c1",
    lane: "ds",
    title: "Capstone: dependency analyzer",
    requires: ["g6", "d6"],
    text: "Combine both tracks in a small tool an architect would actually use: read service dependencies from a file, report cycles, and print a valid start-up order (a topological sort). Include tests and a benchmark.",
    code: `const dependencies = \`
api -> auth
api -> db
auth -> db
\`

const wantStartOrder = "db, auth, api"`,
    quiz: {
      question: "What does a cycle in a dependency graph mean?",
      options: ["Nothing, order still exists", "No valid build order exists", "The graph is a tree"],
      answer: 1,
      why: "A topological order requires a directed acyclic graph.",
    },
    exercise:
      "Build the CLI in Go with a go.mod, at least three tests (including a cycle case), and a README. Keep it in Git.",
  },
];

export const CAPSTONE_ID = "c1";
