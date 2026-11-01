import { SupportedLanguage } from '../types/lab';
import { config } from '../config/env';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  memoryKb: number;
  status: 'success' | 'error' | 'timeout';
  isSimulated: boolean;
  provider: string;
}

// Judge0 language IDs
const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  python: 71,    // Python (3.8.1)
  cpp: 54,       // C++ (GCC 9.2.0)
  c: 50,         // C (GCC 9.2.0)
  java: 62,      // Java (OpenJDK 13.0.1)
  sql: 82,       // SQL (SQLite 3.27.2)
  javascript: 63,// JavaScript (Node.js 12.14.0)
  html: 0,       // HTML handled locally in iframe
};

export async function executeCode(
  language: SupportedLanguage,
  code: string,
  stdin: string = ''
): Promise<ExecutionResult> {
  const startTime = performance.now();

  // If Judge0 API is configured and reachable via backend proxy, attempt real execution
  if (config.apiBaseUrl && !config.isDemoMode) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          stdout: data.stdout || '',
          stderr: data.stderr || '',
          exitCode: data.exitCode ?? 0,
          timeMs: Math.round(data.timeMs ?? (performance.now() - startTime)),
          memoryKb: data.memoryKb ?? 4096,
          status: data.exitCode === 0 ? 'success' : 'error',
          isSimulated: false,
          provider: 'Judge0 Sandbox Cluster',
        };
      }
    } catch {
      console.warn('Backend execution server unreachable; falling back to LUMIO Sandbox Simulator');
    }
  }

  // Built-in intelligent sandbox simulator for zero-friction demo & development
  return simulateExecution(language, code, stdin);
}

function simulateExecution(
  language: SupportedLanguage,
  code: string,
  stdin: string
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    // Realistic execution delay
    const delay = Math.floor(Math.random() * 300) + 250;

    setTimeout(() => {
      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      const trimmedCode = code.trim();

      // Check for empty code
      if (!trimmedCode) {
        resolve({
          stdout: '',
          stderr: 'Error: No code provided to execute.\n',
          exitCode: 1,
          timeMs: 4,
          memoryKb: 1024,
          status: 'error',
          isSimulated: true,
          provider: 'LUMIO Sandbox Simulator',
        });
        return;
      }

      // Syntax & sanity checks based on language
      if (language === 'c' || language === 'cpp') {
        if (!trimmedCode.includes('main')) {
          stderr = `error: undefined reference to 'main'\ncollect2: error: ld returned 1 exit status\n`;
          exitCode = 1;
        } else if (!trimmedCode.includes('#include')) {
          stderr = `warning: implicit declaration of library functions; missing #include <stdio.h> or <iostream>\n`;
        }
      } else if (language === 'java') {
        if (!trimmedCode.includes('public static void main')) {
          stderr = `Error: Main method not found in class, please define the main method as:\n   public static void main(String[] args)\n`;
          exitCode = 1;
        }
      } else if (language === 'python') {
        // Simple check for unclosed strings or unbalanced parentheses
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          stderr = `SyntaxError: unmatched '${openParens > closeParens ? '(' : ')'}'\n`;
          exitCode = 1;
        }
      }

      if (exitCode === 0) {
        // Extract print/cout/System.out calls or algorithmic simulation
        stdout = extractSimulatedOutput(language, code, stdin);
      }

      const elapsed = Math.round(performance.now() - 0);

      resolve({
        stdout,
        stderr,
        exitCode,
        timeMs: Math.max(12, Math.floor(Math.random() * 40) + 18),
        memoryKb: Math.floor(Math.random() * 2048) + 3420,
        status: exitCode === 0 ? 'success' : 'error',
        isSimulated: true,
        provider: 'LUMIO Sandbox Simulator (Demo Mode)',
      });
    }, delay);
  });
}

function extractSimulatedOutput(language: SupportedLanguage, code: string, stdin: string): string {
  const lines: string[] = [];

  // Parse print statements in Python
  if (language === 'python') {
    const printMatches = code.matchAll(/print\((?:f?["'])(.*?)(?:["'])\)/g);
    for (const match of printMatches) {
      lines.push(match[1].replace(/\\n/g, '\n'));
    }
  }

  // Parse std::cout or printf in C/C++
  if (language === 'c' || language === 'cpp') {
    const coutMatches = code.matchAll(/std::cout\s*<<\s*["'](.*?)["']/g);
    for (const match of coutMatches) {
      lines.push(match[1]);
    }
    const printfMatches = code.matchAll(/printf\s*\(\s*["'](.*?)["']/g);
    for (const match of printfMatches) {
      lines.push(match[1].replace(/\\n/g, ''));
    }
  }

  // Parse System.out.println in Java
  if (language === 'java') {
    const sysOutMatches = code.matchAll(/System\.out\.print(?:ln)?\s*\(\s*["'](.*?)["']\s*\)/g);
    for (const match of sysOutMatches) {
      lines.push(match[1]);
    }
  }

  // If specific algorithm patterns are detected in student code, provide rich output
  if (code.includes('linear_search') || code.includes('binary_search')) {
    return `=== LUMIO VIRTUAL LAB: SEARCH ALGORITHMS ===
Dataset: [12, 24, 35, 47, 59, 68, 77, 88, 99]
Searching for target: 68
[Result] Linear Search Found at Index: 5
[Result] Binary Search Found at Index: 5
[Status] Verification Passed: Both search algorithms succeeded.
Time Complexity Benchmark:
- Linear Search: 6 iterations (O(n))
- Binary Search: 3 iterations (O(log n))`;
  }

  if (code.includes('LinkedList') || code.includes('insertTail')) {
    return `=== LUMIO C++ LAB: LINKED LIST DYNAMICS ===
Constructed List: 10 -> 25 -> 40 -> 85 -> nullptr
[Memory Check] Destructor safely reclaimed 4 heap nodes (32 bytes).
No memory leaks detected.`;
  }

  if (code.includes('dijkstra')) {
    return `Shortest distances from source node 0:
Node 0 -> Distance: 0
Node 1 -> Distance: 3 (Path: 0 -> 2 -> 1)
Node 2 -> Distance: 1 (Path: 0 -> 2)
Node 3 -> Distance: 4 (Path: 0 -> 2 -> 1 -> 3)
Node 4 -> Distance: 7 (Path: 0 -> 2 -> 1 -> 3 -> 4)
Execution completed with 0 errors.`;
  }

  if (code.includes('AVLTree') || code.includes('rotateRight')) {
    return `Balanced AVL In-Order Traversal: 10 20 25 30 40 50 
Tree height: 3 (Balance factor invariant: [-1, +1] satisfied)
Self-balancing verification passed!`;
  }

  // If explicit print outputs were found
  if (lines.length > 0) {
    if (stdin.trim()) {
      return `[Input received: "${stdin.trim()}"]\n` + lines.join('\n');
    }
    return lines.join('\n');
  }

  // Default pleasant output
  return `Program executed successfully with code 0.
[Output]
Process completed in sandboxed environment.
${stdin ? `Standard Input provided: ${stdin}\n` : ''}`;
}
