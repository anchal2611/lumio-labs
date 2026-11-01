/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'sql.js' {
  export interface Database {
    exec(sql: string, params?: any[]): QueryExecResult[];
    run(sql: string, params?: any[]): Database;
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
    [key: string]: any;
  }
  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => Database;
  }
  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}
