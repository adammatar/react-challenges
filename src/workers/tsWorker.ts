import * as ts from 'typescript';
import { expose } from 'comlink';

interface TestCase {
  name: string;
  input: any;
  expectedOutput: any;
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface TestResponse {
  success: boolean;
  results?: TestResult[];
  error?: string;
}

const tsWorker = {
  async runTests(code: string, testCases: TestCase[]): Promise<TestResponse> {
    console.log('Worker: Starting runTests');
    try {
      console.log('Worker: Transpiling TypeScript code');
      // Transpile TypeScript to JavaScript
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: 2, // ES5
          module: 1, // CommonJS
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      });
      console.log('Worker: Code transpiled successfully');

      console.log('Worker: Creating sandboxed environment');
      // Create a sandboxed environment
      const sandbox = new Function(`
        console.log('Sandbox: Executing code');
        ${result.outputText}
        console.log('Sandbox: Code executed, returning removeWhitespaces');
        return removeWhitespaces;
      `)();
      console.log('Worker: Sandbox created successfully');

      console.log('Worker: Running test cases');
      // Run test cases
      const results = testCases.map(test => {
        try {
          console.log('Worker: Running test:', test.name);
          // Parse the input string to get the actual value
          const input = JSON.parse(test.input);
          const result = sandbox(input);
          console.log('Worker: Test result:', result);
          const expectedOutput = JSON.parse(test.expectedOutput);
          // Compare strings directly since our function handles all whitespace
          const passed = result === expectedOutput;
          console.log('Worker: Test comparison:', {
            result,
            expectedOutput,
            passed
          });
          return {
            name: test.name,
            passed,
            error: passed ? undefined : `Expected ${JSON.stringify(expectedOutput)}, but got ${JSON.stringify(result)}`
          };
        } catch (error) {
          console.error('Worker: Test error:', error);
          return {
            name: test.name,
            passed: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      });

      console.log('Worker: All tests completed');
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Worker: Error in runTests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

expose(tsWorker); 