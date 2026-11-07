import { SupportedLanguage } from '../types/lab';
import { apiPost } from './api';

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

interface ExecutionResponse {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  timeMs?: number;
  memoryKb?: number;
  provider?: string;
}

export async function executeCode(
  language: SupportedLanguage,
  code: string,
  stdin = '',
): Promise<ExecutionResult> {
  try {
    const result = await apiPost<ExecutionResponse>('/execute', { language, code, stdin });
    const exitCode = result.exitCode ?? 0;
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode,
      timeMs: result.timeMs ?? 0,
      memoryKb: result.memoryKb ?? 0,
      status: exitCode === 0 ? 'success' : exitCode === 124 ? 'timeout' : 'error',
      isSimulated: result.provider?.includes('Simulator') ?? false,
      provider: result.provider || 'LUMIO Execution Engine',
    };
  } catch (error) {
    return {
      stdout: '',
      stderr: error instanceof Error ? error.message : 'Execution service is unavailable.',
      exitCode: 1,
      timeMs: 0,
      memoryKb: 0,
      status: 'error',
      isSimulated: false,
      provider: 'LUMIO Execution API',
    };
  }
}
