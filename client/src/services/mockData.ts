import { UserProfile } from '../types/auth';
import { LabItem, GuidedPractical } from '../types/lab';
import { Assignment, Submission } from '../types/assignment';
import { CollabRoom, DoubtThread, ChatMessage } from '../types/collaboration';
import { ResourceItem } from '../types/resource';
import { AppNotification, Announcement } from '../types/notification';

export const DEMO_USERS: Record<string, UserProfile> = {
  student: {
    id: 'usr_student_01',
    email: 'alex.chen@university.edu',
    name: 'Alex Chen',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    branch: 'Software Engineering',
    semester: 4,
    rollNumber: 'CS-2024-042',
    joinedAt: '2024-08-15T09:00:00Z',
    isVerified: true,
    status: 'active',
  },
  teacher: {
    id: 'usr_teacher_01',
    email: 'marcus.vance@university.edu',
    name: 'Prof. Marcus Vance',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Systems Lab Director',
    joinedAt: '2021-06-01T08:30:00Z',
    isVerified: true,
    status: 'active',
  },
  admin: {
    id: 'usr_admin_01',
    email: 'dean.jenkins@university.edu',
    name: 'Dean Sarah Jenkins',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Office of Academic Affairs & Digital Labs',
    designation: 'Dean of Digital Infrastructure',
    joinedAt: '2019-01-10T10:00:00Z',
    isVerified: true,
    status: 'active',
  },
};

export const MOCK_STUDENTS_LIST: UserProfile[] = [
  DEMO_USERS.student,
  {
    id: 'usr_student_02',
    email: 'priya.sharma@university.edu',
    name: 'Priya Sharma',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    branch: 'AI & Data Science',
    semester: 4,
    rollNumber: 'CS-2024-089',
    joinedAt: '2024-08-15T09:00:00Z',
    isVerified: true,
    status: 'active',
  },
  {
    id: 'usr_student_03',
    email: 'liam.oconnor@university.edu',
    name: 'Liam O\'Connor',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    branch: 'IoT & Embedded Systems',
    semester: 4,
    rollNumber: 'CS-2024-114',
    joinedAt: '2024-08-15T09:00:00Z',
    isVerified: true,
    status: 'active',
  },
  {
    id: 'usr_student_04',
    email: 'maya.patel@university.edu',
    name: 'Maya Patel',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    university: 'Apex Institute of Technology',
    department: 'Computer Science & Engineering',
    branch: 'Software Engineering',
    semester: 4,
    rollNumber: 'CS-2024-138',
    joinedAt: '2024-08-15T09:00:00Z',
    isVerified: true,
    status: 'active',
  },
];

export const MOCK_LABS: LabItem[] = [
  {
    id: 'lab-python',
    slug: 'python-programming',
    name: 'Python Computing & Algorithms',
    tagline: 'Modern scientific programming, data structures, and algorithmic efficiency.',
    description: 'Master Python 3 fundamentals, list comprehensions, recursion, object-oriented design, dynamic programming, and standard algorithms with immediate compiler feedback.',
    category: 'programming',
    difficulty: 'beginner',
    iconName: 'Code2',
    experimentCount: 16,
    supportedModes: ['guided', 'workspace'],
    tools: ['Python 3.11', 'Judge0 Engine', 'Interactive Stdin'],
    estimatedHours: 32,
    languages: ['python'],
    isPopular: true,
  },
  {
    id: 'lab-cpp',
    slug: 'cpp-systems',
    name: 'C / C++ Systems & Low-Level Lab',
    tagline: 'Direct memory management, pointer manipulation, and high-performance algorithms.',
    description: 'Explore pointers, structs, dynamic memory allocation with malloc/free, C++ STL templates, operator overloading, and low-level computer systems programming.',
    category: 'programming',
    difficulty: 'intermediate',
    iconName: 'Cpu',
    experimentCount: 18,
    supportedModes: ['guided', 'workspace'],
    tools: ['GCC 13', 'G++ 13', 'Valgrind Simulator'],
    estimatedHours: 40,
    languages: ['c', 'cpp'],
    isPopular: true,
  },
  {
    id: 'lab-sql',
    slug: 'database-sql',
    name: 'Relational DBMS & SQL Lab',
    tagline: 'Browser-native SQLite execution with live relational schema explorer.',
    description: 'Write real SQL queries directly in your browser. Practice complex multi-table joins, subqueries, group by aggregations, window functions, and database integrity constraints.',
    category: 'database',
    difficulty: 'intermediate',
    iconName: 'Database',
    experimentCount: 14,
    supportedModes: ['guided', 'workspace'],
    tools: ['SQLite 3 WASM', 'Schema Visualizer', 'Query Profiler'],
    estimatedHours: 28,
    languages: ['sql'],
    isPopular: true,
  },
  {
    id: 'lab-iot',
    slug: 'iot-electronics',
    name: 'IoT & Virtual Circuit Laboratory',
    tagline: 'Interactive virtual breadboard, ESP32 microcontroller, sensors, and actuators.',
    description: 'Design digital circuits using drag-and-drop components (ESP32, LEDs, push buttons, 9V batteries, buzzers, and IR sensors) and run real-time logic simulations with virtual serial monitoring.',
    category: 'iot',
    difficulty: 'intermediate',
    iconName: 'Zap',
    experimentCount: 12,
    supportedModes: ['guided', 'workspace'],
    tools: ['React Flow Canvas', 'Circuit Simulation Engine', 'Virtual Serial Monitor'],
    estimatedHours: 36,
    languages: ['cpp'],
    isPopular: true,
  },
  {
    id: 'lab-web',
    slug: 'web-development',
    name: 'Web Engineering & DOM Studio',
    tagline: 'Full-stack client-side sandbox with live DOM preview and debugging.',
    description: 'Write modern semantic HTML5, modern CSS3 with flexbox/grid, and vanilla ES6+ JavaScript. See instant, sandboxed live previews with console telemetry.',
    category: 'web',
    difficulty: 'beginner',
    iconName: 'Globe',
    experimentCount: 15,
    supportedModes: ['guided', 'workspace'],
    tools: ['Sandboxed HTML5 Runner', 'Live Console Inspector'],
    estimatedHours: 24,
    languages: ['html', 'javascript'],
  },
  {
    id: 'lab-java',
    slug: 'java-oop',
    name: 'Java Object-Oriented Software Lab',
    tagline: 'Class design, polymorphism, multithreading, and design patterns.',
    description: 'Implement enterprise-grade Java algorithms, inheritance hierarchies, custom exception architectures, Java Collections framework, and concurrency models.',
    category: 'programming',
    difficulty: 'intermediate',
    iconName: 'Binary',
    experimentCount: 14,
    supportedModes: ['guided', 'workspace'],
    tools: ['OpenJDK 21', 'Judge0 Engine', 'JUnit Runner'],
    estimatedHours: 34,
    languages: ['java'],
  },
  {
    id: 'lab-core-cs',
    slug: 'os-networks',
    name: 'Operating Systems & Networks',
    tagline: 'Process scheduling, concurrency, deadlocks, and packet routing simulations.',
    description: 'Simulate CPU scheduling policies (Round Robin, FCFS, Shortest Job First), virtual memory page replacement (FIFO, LRU), and Dijkstra routing algorithms.',
    category: 'core_cs',
    difficulty: 'advanced',
    iconName: 'Network',
    experimentCount: 10,
    supportedModes: ['guided', 'workspace'],
    tools: ['Simulation Engine', 'Scheduler Profiler'],
    estimatedHours: 30,
    languages: ['c', 'cpp', 'python'],
  },
];

export const MOCK_GUIDED_PRACTICALS: Record<string, GuidedPractical[]> = {
  'lab-python': [
    {
      id: 'prac-py-01',
      labId: 'lab-python',
      practicalNumber: 1,
      title: 'Searching Algorithms: Linear vs Binary Search Performance',
      objective: 'Implement both Linear Search and Binary Search in Python. Compare time complexities (O(n) vs O(log n)) and verify accuracy with custom inputs.',
      theory: 'Search algorithms are essential for data retrieval. Linear search sequentially verifies each element until a match is found or the list ends. Binary search operates on sorted collections by repeatedly dividing the search interval in half.',
      prerequisites: ['Python Lists and Loops', 'Conditional Logic', 'Big-O Notation basics'],
      procedure: [
        '1. Define linear_search(arr, target) that returns the index or -1.',
        '2. Define binary_search(arr, target) using left and right pointer intervals.',
        '3. Test both algorithms against a sorted test list [12, 24, 35, 47, 59, 68, 77, 88, 99].',
        '4. Print matching indices and execution comparisons.',
      ],
      starterCode: `# LUMIO Guided Practical 01: Linear & Binary Search
# Student: Alex Chen | Roll: CS-2024-042

def linear_search(arr, target):
    """
    Sequentially search for target in arr.
    Returns index if found, else -1.
    """
    for index, val in enumerate(arr):
        if val == target:
            return index
    return -1

def binary_search(arr, target):
    """
    Binary search target in a sorted list arr.
    Returns index if found, else -1.
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

if __name__ == '__main__':
    dataset = [12, 24, 35, 47, 59, 68, 77, 88, 99]
    target_val = 68
    
    print("=== LUMIO VIRTUAL LAB: SEARCH ALGORITHMS ===")
    print(f"Dataset: {dataset}")
    print(f"Searching for target: {target_val}")
    
    idx_linear = linear_search(dataset, target_val)
    idx_binary = binary_search(dataset, target_val)
    
    print(f"[Result] Linear Search Found at Index: {idx_linear}")
    print(f"[Result] Binary Search Found at Index: {idx_binary}")
    
    if idx_linear == idx_binary and idx_linear != -1:
        print("[Status] Verification Passed: Both search algorithms succeeded.")
`,
      defaultLanguage: 'python',
      expectedOutput: `=== LUMIO VIRTUAL LAB: SEARCH ALGORITHMS ===
Dataset: [12, 24, 35, 47, 59, 68, 77, 88, 99]
Searching for target: 68
[Result] Linear Search Found at Index: 5
[Result] Binary Search Found at Index: 5
[Status] Verification Passed: Both search algorithms succeeded.`,
      vivaQuestions: [
        {
          id: 'viva-1',
          question: 'What is the worst-case time complexity of Binary Search?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
          correctAnswer: 'O(log n)',
          explanation: 'Binary search halves the search space at each iteration, resulting in logarithmic O(log n) time complexity.',
        },
        {
          id: 'viva-2',
          question: 'What is the strict prerequisite condition before applying Binary Search?',
          options: ['List must contain unique values', 'List must be sorted in order', 'List size must be even', 'List must only contain integers'],
          correctAnswer: 'List must be sorted in order',
          explanation: 'Binary search requires elements to be in sorted order so it can discard half the remaining search space based on midpoint comparison.',
        },
      ],
      submissionRequirements: [
        'Complete implementation of both algorithms.',
        'Passing all test cases including edge cases (element not found, empty array).',
        'Correct answers to the accompanying viva questions.',
      ],
      maxMarks: 20,
      tags: ['Algorithms', 'Python', 'Searching', 'Time Complexity'],
    },
  ],
  'lab-cpp': [
    {
      id: 'prac-cpp-01',
      labId: 'lab-cpp',
      practicalNumber: 1,
      title: 'Dynamic Memory Allocation & Singly Linked List',
      objective: 'Construct a Singly Linked List class using dynamic memory allocation (new/delete in C++). Implement node insertion, traversal, and safe memory deallocation.',
      theory: 'Dynamic memory allocation allows programs to request heap memory at runtime. In C++, operator new allocates memory for nodes and delete releases it to avoid memory leaks.',
      prerequisites: ['Pointers and References', 'Structs and Classes', 'Destructors in C++'],
      procedure: [
        '1. Define struct Node { int data; Node* next; }',
        '2. Implement insertAtHead and insertAtTail methods.',
        '3. Traverse and display nodes in format: 10 -> 20 -> 30 -> nullptr',
        '4. Implement destructor to iterate and delete all allocated heap nodes.',
      ],
      starterCode: `#include <iostream>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    
    void insertTail(int val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = newNode;
            return;
        }
        Node* curr = head;
        while (curr->next) {
            curr = curr->next;
        }
        curr->next = newNode;
    }
    
    void display() const {
        Node* curr = head;
        while (curr) {
            std::cout << curr->data << " -> ";
            curr = curr->next;
        }
        std::cout << "nullptr" << std::endl;
    }
    
    ~LinkedList() {
        Node* curr = head;
        while (curr) {
            Node* nextNode = curr->next;
            delete curr;
            curr = nextNode;
        }
    }
};

int main() {
    std::cout << "=== LUMIO C++ LAB: LINKED LIST DYNAMICS ===" << std::endl;
    LinkedList list;
    list.insertTail(10);
    list.insertTail(25);
    list.insertTail(40);
    list.insertTail(85);
    
    std::cout << "Constructed List: ";
    list.display();
    std::cout << "[Memory Check] Destructor safely reclaimed heap nodes." << std::endl;
    return 0;
}
`,
      defaultLanguage: 'cpp',
      expectedOutput: `=== LUMIO C++ LAB: LINKED LIST DYNAMICS ===
Constructed List: 10 -> 25 -> 40 -> 85 -> nullptr
[Memory Check] Destructor safely reclaimed heap nodes.`,
      vivaQuestions: [
        {
          id: 'viva-cpp-1',
          question: 'What happens if a program fails to call delete on dynamically allocated heap memory?',
          options: ['Automatic garbage collection', 'A memory leak occurs', 'Stack overflow', 'Compiler syntax error'],
          correctAnswer: 'A memory leak occurs',
          explanation: 'In C++, heap allocations made with new remain allocated until explicitly freed with delete; failure to do so causes memory leaks.',
        },
      ],
      submissionRequirements: ['Working Linked List with zero memory leaks', 'Proper class encapsulation'],
      maxMarks: 25,
      tags: ['C++', 'Pointers', 'Data Structures', 'Memory Management'],
    },
  ],
  'lab-sql': [
    {
      id: 'prac-sql-01',
      labId: 'lab-sql',
      practicalNumber: 1,
      title: 'University Grade Analytics & Multi-Table Joins',
      objective: 'Write relational SQL queries utilizing INNER JOIN, GROUP BY, and HAVING to evaluate student academic performances across academic semesters.',
      theory: 'Relational databases store normalized entities across separate tables. INNER JOIN reconciles records across foreign keys, while aggregate functions calculate metrics such as average grade point and total course credits.',
      prerequisites: ['SELECT statements', 'Foreign Keys', 'GROUP BY and HAVING clauses'],
      procedure: [
        '1. Inspect students, courses, and enrollments tables.',
        '2. Write a query computing each student\'s GPA and total credits earned.',
        '3. Filter students with average score >= 85.',
        '4. Order results descending by average GPA.',
      ],
      starterCode: `-- LUMIO SQL Virtual Lab: University Analytics
-- Pre-loaded with 'students', 'courses', and 'enrollments' tables

SELECT 
    s.student_id,
    s.name AS student_name,
    s.department,
    COUNT(e.course_id) AS courses_enrolled,
    ROUND(AVG(e.score), 2) AS average_score
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
GROUP BY s.student_id, s.name, s.department
HAVING AVG(e.score) >= 80.0
ORDER BY average_score DESC;
`,
      defaultLanguage: 'sql',
      expectedOutput: `student_id | student_name | department | courses_enrolled | average_score
-------------------------------------------------------------------------
101        | Alex Chen    | CSE        | 3                | 92.33
103        | Priya Sharma | CSE        | 3                | 89.67
104        | Maya Patel   | CSE        | 2                | 85.00`,
      vivaQuestions: [
        {
          id: 'viva-sql-1',
          question: 'What is the primary difference between WHERE and HAVING clauses in SQL?',
          options: [
            'WHERE filters individual rows before grouping; HAVING filters aggregated groups',
            'WHERE is only for numbers; HAVING is for strings',
            'HAVING is executed before WHERE',
            'There is no difference in modern SQL engines',
          ],
          correctAnswer: 'WHERE filters individual rows before grouping; HAVING filters aggregated groups',
          explanation: 'WHERE filters rows before aggregation occurs, while HAVING filters the grouped results produced by GROUP BY.',
        },
      ],
      submissionRequirements: ['Valid SQL syntax', 'Accurate GPA calculations'],
      maxMarks: 20,
      tags: ['SQL', 'Relational DB', 'Aggregations', 'Joins'],
    },
  ],
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    title: 'Assignment 3: Binary Search Tree Balancing & Traversal',
    description: 'Implement an AVL self-balancing binary search tree in C++ with rotation routines (LL, RR, LR, RL) and level-order breadth-first traversal.',
    labId: 'lab-cpp',
    labName: 'C / C++ Systems Lab',
    teacherId: 'usr_teacher_01',
    teacherName: 'Prof. Marcus Vance',
    department: 'Computer Science & Engineering',
    semester: 4,
    subjectCode: 'CS402-DSA',
    deadline: '2026-11-15T23:59:59Z',
    maxMarks: 30,
    status: 'published',
    starterCode: `// Assignment 3: AVL Tree Implementation
#include <iostream>

struct AVLNode {
    int key;
    int height;
    AVLNode* left;
    AVLNode* right;
    AVLNode(int k) : key(k), height(1), left(nullptr), right(nullptr) {}
};

class AVLTree {
public:
    AVLNode* root = nullptr;
    // TODO: Implement insert, rotateLeft, rotateRight, and levelOrderTraversal
};

int main() {
    AVLTree tree;
    std::cout << "Testing AVL tree..." << std::endl;
    return 0;
}
`,
    language: 'cpp',
    instructions: [
      'Implement recursive AVL insertion with height recalculation.',
      'Ensure balance factor stays strictly between -1 and +1.',
      'Provide test driver verifying height invariance across 20 inserted keys.',
    ],
    rubrics: [
      { id: 'r1', criterion: 'Correct AVL Rotations (LL, RR, LR, RL)', maxMarks: 12 },
      { id: 'r2', criterion: 'Traversal & Height Invariance Validation', maxMarks: 10 },
      { id: 'r3', criterion: 'Code Cleanliness & Documentation', maxMarks: 8 },
    ],
    submissionCount: 38,
    totalStudents: 45,
    createdAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'asg-02',
    title: 'Assignment 4: SQL Query Optimization & Indexing Benchmark',
    description: 'Write complex analytic queries on a 50,000-row university dataset. Compare EXPLAIN QUERY PLAN benchmarks before and after creating composite indices.',
    labId: 'lab-sql',
    labName: 'Relational DBMS & SQL Lab',
    teacherId: 'usr_teacher_01',
    teacherName: 'Prof. Marcus Vance',
    department: 'Computer Science & Engineering',
    semester: 4,
    subjectCode: 'CS404-DBMS',
    deadline: '2026-11-20T23:59:59Z',
    maxMarks: 25,
    status: 'published',
    starterCode: `-- CS404 Assignment 4: Query Optimization
-- Step 1: Execute query without index
EXPLAIN QUERY PLAN
SELECT student_id, AVG(score) 
FROM enrollments 
WHERE semester = 4 
GROUP BY student_id;

-- Step 2: Create targeted index and explain again
`,
    language: 'sql',
    instructions: [
      'Write optimized query with explain plan comparison.',
      'Demonstrate reduction in table scan operations.',
    ],
    rubrics: [
      { id: 'r1', criterion: 'Index strategy accuracy', maxMarks: 15 },
      { id: 'r2', criterion: 'Analytical benchmark write-up', maxMarks: 10 },
    ],
    submissionCount: 41,
    totalStudents: 45,
    createdAt: '2026-10-28T14:00:00Z',
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    assignmentId: 'asg-01',
    assignmentTitle: 'Assignment 3: Binary Search Tree Balancing & Traversal',
    studentId: 'usr_student_01',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@university.edu',
    studentRollNo: 'CS-2024-042',
    submittedAt: '2026-10-30T16:45:00Z',
    code: `// Alex Chen - Assignment 3 Complete Submission
#include <iostream>
#include <algorithm>

struct AVLNode {
    int key, height;
    AVLNode *left, *right;
    AVLNode(int k) : key(k), height(1), left(nullptr), right(nullptr) {}
};

int getHeight(AVLNode* n) { return n ? n->height : 0; }
int getBalance(AVLNode* n) { return n ? getHeight(n->left) - getHeight(n->right) : 0; }

AVLNode* rotateRight(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    return x;
}

AVLNode* rotateLeft(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;
    y->left = x;
    x->right = T2;
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    return y;
}

AVLNode* insert(AVLNode* node, int key) {
    if (!node) return new AVLNode(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    else return node;

    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
    int balance = getBalance(node);

    if (balance > 1 && key < node->left->key) return rotateRight(node);
    if (balance < -1 && key > node->right->key) return rotateLeft(node);
    if (balance > 1 && key > node->left->key) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    if (balance < -1 && key < node->right->key) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }
    return node;
}

void inOrder(AVLNode* root) {
    if (root) {
        inOrder(root->left);
        std::cout << root->key << " ";
        inOrder(root->right);
    }
}

int main() {
    AVLNode* root = nullptr;
    int keys[] = {10, 20, 30, 40, 50, 25};
    for (int k : keys) root = insert(root, k);
    std::cout << "Balanced AVL In-Order Traversal: ";
    inOrder(root);
    std::cout << "\\nTree successfully balanced!" << std::endl;
    return 0;
}
`,
    stdout: `Balanced AVL In-Order Traversal: 10 20 25 30 40 50 \nTree successfully balanced!`,
    notes: 'Implemented all four rotation scenarios. Cleanly tested with standard sequence from lecture slides.',
    status: 'graded',
    marksObtained: 29,
    maxMarks: 30,
    feedback: 'Excellent work Alex! The height calculation and four rotation primitives are textbook implementations. Zero edge cases failed.',
    gradedBy: 'Prof. Marcus Vance',
    gradedAt: '2026-10-31T11:20:00Z',
    rubricScores: { r1: 12, r2: 10, r3: 7 },
  },
  {
    id: 'sub-02',
    assignmentId: 'asg-01',
    assignmentTitle: 'Assignment 3: Binary Search Tree Balancing & Traversal',
    studentId: 'usr_student_02',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.sharma@university.edu',
    studentRollNo: 'CS-2024-089',
    submittedAt: '2026-10-31T09:15:00Z',
    code: `// Priya Sharma - Assignment 3
#include <iostream>
// Implementation in progress...
`,
    status: 'pending',
    maxMarks: 30,
  },
];

export const MOCK_COLLAB_ROOMS: CollabRoom[] = [
  {
    id: 'room-dsa-01',
    roomCode: 'DSA-9021',
    title: 'Study Sprint: Graph Traversal & Dijkstra Implementation',
    description: 'Collaborative pair programming session working on adjacency lists and priority queue shortest path.',
    labCategory: 'programming',
    language: 'cpp',
    hostId: 'usr_student_01',
    hostName: 'Alex Chen',
    isPrivate: false,
    code: `// LUMIO Live Collaborative Coding Room: DSA-9021
// Active Participants: Alex Chen, Priya Sharma, Liam O'Connor

#include <iostream>
#include <vector>
#include <queue>

using namespace std;

typedef pair<int, int> pii;

void dijkstra(int V, vector<vector<pii>>& adj, int src) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        int u = pq.top().second;
        int d = pq.top().first;
        pq.pop();

        if (d > dist[u]) continue;

        for (auto edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }

    cout << "Shortest distances from source node " << src << ":\\n";
    for (int i = 0; i < V; ++i) {
        cout << "Node " << i << " -> Distance: " << dist[i] << "\\n";
    }
}

int main() {
    int V = 5;
    vector<vector<pii>> adj(V);
    adj[0].push_back({1, 4});
    adj[0].push_back({2, 1});
    adj[2].push_back({1, 2});
    adj[1].push_back({3, 1});
    adj[2].push_back({3, 5});
    adj[3].push_back({4, 3});

    dijkstra(V, adj, 0);
    return 0;
}
`,
    createdAt: '2026-11-01T14:00:00Z',
    participants: [
      {
        id: 'usr_student_01',
        name: 'Alex Chen (Host)',
        role: 'student',
        color: '#2563EB',
        isOnline: true,
        cursor: { lineNumber: 18, column: 12 },
      },
      {
        id: 'usr_student_02',
        name: 'Priya Sharma',
        role: 'student',
        color: '#0D9488',
        isOnline: true,
        cursor: { lineNumber: 24, column: 9 },
      },
      {
        id: 'usr_student_03',
        name: 'Liam O\'Connor',
        role: 'student',
        color: '#EA580C',
        isOnline: true,
        cursor: { lineNumber: 42, column: 5 },
      },
    ],
    tags: ['Algorithms', 'Graphs', 'C++', 'Dijkstra'],
  },
  {
    id: 'room-faculty-01',
    roomCode: 'FAC-7740',
    title: 'Faculty Co-Authoring: Operating Systems Practical Manual 2026',
    description: 'Collaborative curriculum drafting and starter code standardization for CS401 OS labs.',
    labCategory: 'core_cs',
    language: 'c',
    hostId: 'usr_teacher_01',
    hostName: 'Prof. Marcus Vance',
    isPrivate: true,
    code: `/* 
 * LUMIO Faculty Practical Specification CS401
 * Co-Authors: Prof. Marcus Vance, Dr. Eleanor Brooks
 * Lab Module: CPU Scheduling Simulation (Round Robin)
 */
#include <stdio.h>

struct Process {
    int pid;
    int arrival_time;
    int burst_time;
    int remaining_time;
    int waiting_time;
    int turnaround_time;
};

// Standardized template for university student distribution
void simulate_round_robin(struct Process p[], int n, int quantum) {
    // Standard implementation guidelines
}
`,
    createdAt: '2026-10-29T11:00:00Z',
    participants: [
      {
        id: 'usr_teacher_01',
        name: 'Prof. Marcus Vance',
        role: 'teacher',
        color: '#1D4ED8',
        isOnline: true,
      },
      {
        id: 'usr_teacher_02',
        name: 'Dr. Eleanor Brooks',
        role: 'teacher',
        color: '#9333EA',
        isOnline: true,
      },
    ],
    tags: ['Curriculum', 'OS', 'Faculty Only'],
  },
];

export const MOCK_DOUBTS: DoubtThread[] = [
  {
    id: 'doubt-01',
    title: 'Why does pointer arithmetic in C++ advance by sizeof(type) bytes rather than 1 byte?',
    description: 'When I write ptr + 1 for an int* pointer on a 64-bit architecture, the memory address increases by 4 rather than 1. Can someone explain how the compiler calculates this offset and how it relates to array indexing?',
    codeSnippet: `int numbers[5] = {10, 20, 30, 40, 50};
int* ptr = numbers;
printf("Address 0: %p\\n", (void*)ptr);
printf("Address 1: %p\\n", (void*)(ptr + 1)); // jumps by 4 bytes!`,
    language: 'cpp',
    category: 'C / C++ Systems Lab',
    studentId: 'usr_student_01',
    studentName: 'Alex Chen',
    studentDepartment: 'CSE Semester 4',
    tags: ['Pointers', 'Memory', 'C++'],
    isResolved: true,
    repliesCount: 2,
    createdAt: '2026-10-31T08:30:00Z',
    replies: [
      {
        id: 'rep-01',
        authorId: 'usr_teacher_01',
        authorName: 'Prof. Marcus Vance',
        authorRole: 'teacher',
        content: 'Great question Alex! In C and C++, pointer arithmetic is type-aware. The expression (ptr + i) is mathematically evaluated by the compiler as: ((uintptr_t)ptr + (i * sizeof(*ptr))). Because sizeof(int) is 4 bytes on modern architectures, advancing the pointer by 1 index moves ahead by 4 memory bytes so that it points cleanly to the next discrete integer entity.',
        createdAt: '2026-10-31T09:15:00Z',
        isEndorsedByTeacher: true,
      },
      {
        id: 'rep-02',
        authorId: 'usr_student_02',
        authorName: 'Priya Sharma',
        authorRole: 'student',
        content: 'This is also why numbers[i] is literally defined in C standard syntax as *(numbers + i)! It makes array indexing and pointer offset completely interchangeable.',
        createdAt: '2026-10-31T10:02:00Z',
        isEndorsedByTeacher: false,
      },
    ],
  },
  {
    id: 'doubt-02',
    title: 'How to prevent SQLite "table is locked" errors during multi-statement script execution?',
    description: 'When running multiple CREATE and INSERT statements sequentially in WebAssembly, occasionally an unfinalized statement holds a read lock. What is the standard transaction pattern to guarantee clean rollback?',
    category: 'Relational DBMS & SQL Lab',
    studentId: 'usr_student_03',
    studentName: 'Liam O\'Connor',
    studentDepartment: 'CSE Semester 4',
    tags: ['SQLite', 'Transactions', 'Locks'],
    isResolved: false,
    repliesCount: 1,
    createdAt: '2026-11-01T11:00:00Z',
    replies: [
      {
        id: 'rep-03',
        authorId: 'usr_teacher_01',
        authorName: 'Prof. Marcus Vance',
        authorRole: 'teacher',
        content: 'Wrap your multi-statement migrations inside an explicit BEGIN TRANSACTION; ... COMMIT; block and ensure every statement iterator is explicitly stepped to completion or reset.',
        createdAt: '2026-11-01T12:30:00Z',
        isEndorsedByTeacher: true,
      },
    ],
  },
];

export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'res-01',
    title: 'Computer Systems & Architecture Laboratory Manual (v4.2)',
    description: 'Official 85-page university curriculum manual with step-by-step experiment procedures, register layout maps, and Viva voice question sets.',
    category: 'manuals',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    downloadUrl: '#',
    authorId: 'usr_teacher_01',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'teacher',
    downloadCount: 342,
    uploadedAt: '2026-09-01T08:00:00Z',
    tags: ['C++', 'Systems', 'Manual', 'Viva'],
  },
  {
    id: 'res-02',
    title: 'Relational Schema & 50,000-Row Sample Academic Database (SQLite)',
    description: 'Cleaned, indexed relational database containing students, courses, faculty, departments, and historical grade records for query optimization testing.',
    category: 'datasets',
    fileType: 'sql',
    fileSize: '2.1 MB',
    downloadUrl: '#',
    authorId: 'usr_teacher_01',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'teacher',
    downloadCount: 512,
    uploadedAt: '2026-09-15T10:30:00Z',
    tags: ['SQL', 'Database', 'Datasets'],
  },
  {
    id: 'res-03',
    title: 'ESP32 Sensor Interface Schematics & Pinout Reference Sheet',
    description: 'High-resolution pin diagram for NodeMCU ESP32-WROOM-32 with ADC channels, capacitive touch pins, SPI, and I2C hardware bus mappings.',
    category: 'circuit_diagrams',
    fileType: 'pdf',
    fileSize: '1.4 MB',
    downloadUrl: '#',
    authorId: 'usr_teacher_01',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'teacher',
    downloadCount: 289,
    uploadedAt: '2026-10-02T14:15:00Z',
    tags: ['IoT', 'ESP32', 'Circuits', 'Hardware'],
  },
  {
    id: 'res-04',
    title: 'Python Algorithmic Complexity Cheatsheet & Big-O Guide',
    description: 'Quick reference guide covering best, average, and worst-case complexities of standard sorting, searching, and tree traversal algorithms.',
    category: 'code_snippets',
    fileType: 'pdf',
    fileSize: '820 KB',
    downloadUrl: '#',
    authorId: 'usr_teacher_01',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'teacher',
    downloadCount: 680,
    uploadedAt: '2026-08-20T11:00:00Z',
    tags: ['Python', 'DSA', 'Big-O', 'Cheatsheet'],
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'usr_student_01',
    type: 'submission_graded',
    title: 'Assignment Graded: 29 / 30 Marks',
    message: 'Prof. Marcus Vance graded your submission for Assignment 3: Binary Search Tree Balancing & Traversal.',
    link: '/student/assignments',
    createdAt: '2026-10-31T11:20:00Z',
    isRead: false,
  },
  {
    id: 'notif-02',
    userId: 'usr_student_01',
    type: 'collaboration_invite',
    title: 'New Collaboration Room Invite',
    message: 'Priya Sharma invited you to join "Study Sprint: Graph Traversal & Dijkstra Implementation".',
    link: '/student/collaboration',
    createdAt: '2026-11-01T13:45:00Z',
    isRead: false,
  },
  {
    id: 'notif-03',
    userId: 'usr_student_01',
    type: 'deadline_approaching',
    title: 'Deadline Approaching: CS404 Assignment 4',
    message: 'Only 3 days remaining to complete and submit SQL Query Optimization & Indexing Benchmark.',
    link: '/student/assignments',
    createdAt: '2026-11-01T08:00:00Z',
    isRead: true,
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-01',
    title: 'Mid-Semester Virtual Practical Examinations Scheduled',
    content: 'All 4th-semester computer science students must register their practical examination slots on LUMIO by November 12. Guided practicals 1 through 6 will serve as the syllabus.',
    authorName: 'Dean Sarah Jenkins',
    authorRole: 'admin',
    targetRole: 'all',
    createdAt: '2026-10-28T09:00:00Z',
    priority: 'urgent',
  },
  {
    id: 'anc-02',
    title: 'New Virtual IoT & Microcontroller Simulation Lab Online',
    content: 'The Department of Computer Science has activated the ESP32 Virtual Circuit Simulator on LUMIO. Students can now design circuits and stream virtual serial telemetry.',
    authorName: 'Prof. Marcus Vance',
    authorRole: 'teacher',
    targetRole: 'students',
    department: 'Computer Science & Engineering',
    createdAt: '2026-10-25T11:30:00Z',
    priority: 'normal',
  },
];
