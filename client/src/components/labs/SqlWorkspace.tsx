import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Database,
  Play,
  RotateCcw,
  Table as TableIcon,
  Columns,
  Key,
  Clock,
  Sparkles,
  AlertCircle,
  History,
  Copy,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  sqlEngine,
  SAMPLE_DATABASES,
  SampleDatabaseId,
  TableSchema,
  SqlQueryResult,
} from '../../services/sqlEngine';
import { useToast } from '../../contexts/ToastContext';

export const SqlWorkspace: React.FC = () => {
  const [selectedDb, setSelectedDb] = useState<SampleDatabaseId>('university');
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [expandedTable, setExpandedTable] = useState<string | null>('students');
  const [query, setQuery] = useState<string>(
    `-- Query: Multi-table Academic Performance Join
SELECT 
    s.student_id,
    s.name AS student_name,
    s.department,
    c.title AS course_title,
    e.score,
    e.grade
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
INNER JOIN courses c ON e.course_id = c.course_id
WHERE e.score >= 85.0
ORDER BY e.score DESC;`
  );
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const initDb = async () => {
      setIsInitializing(true);
      await sqlEngine.init();
      sqlEngine.loadDatabase(selectedDb);
      setSchema(sqlEngine.getSchema());
      setIsInitializing(false);

      // Run initial query
      const initialRes = sqlEngine.executeQuery(query);
      setResult(initialRes);
    };
    initDb();
  }, [selectedDb]);

  const handleRunQuery = () => {
    if (!query.trim()) return;
    const res = sqlEngine.executeQuery(query);
    setResult(res);
    setHistory((prev) => [query, ...prev.slice(0, 9)]);
    setSchema(sqlEngine.getSchema());

    if (res.error) {
      toast.error('SQL Execution Error', res.error);
    } else {
      toast.success('Query Executed', `${res.rowsAffected} rows in ${res.executionTimeMs}ms`);
    }
  };

  const handleResetDb = () => {
    sqlEngine.resetCurrentDatabase();
    setSchema(sqlEngine.getSchema());
    handleRunQuery();
    toast.info('Database Reset', 'Sample database reverted to default state.');
  };

  const handleSwitchDb = (dbId: SampleDatabaseId) => {
    setSelectedDb(dbId);
    sqlEngine.loadDatabase(dbId);
    setSchema(sqlEngine.getSchema());

    // Switch default query based on DB
    if (dbId === 'university') {
      setQuery('SELECT * FROM students LIMIT 10;');
    } else if (dbId === 'library') {
      setQuery('SELECT b.title, a.name AS author, b.copies_available FROM books b JOIN authors a ON b.author_id = a.author_id;');
    } else if (dbId === 'employee') {
      setQuery('SELECT e.first_name, e.last_name, e.job_title, e.salary, d.name AS department FROM employees e JOIN departments d ON e.dept_id = d.dept_id;');
    } else {
      setQuery('SELECT o.order_id, c.name, o.order_date, o.total_amount FROM orders o JOIN customers c ON o.customer_id = c.customer_id;');
    }
  };

  return (
    <div className="flex flex-col h-[820px] bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Top Database Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-navy-900 font-bold text-xs">
            <Database className="w-4 h-4 text-teal-600" />
            <span>SQLite 3 WebAssembly Engine</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {SAMPLE_DATABASES.map((db) => (
              <button
                key={db.id}
                onClick={() => handleSwitchDb(db.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedDb === db.id
                    ? 'bg-primary text-white shadow-2xs font-semibold'
                    : 'text-brand-muted hover:text-navy-900'
                }`}
              >
                {db.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDb}
          >
            Reset Database
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
            onClick={handleRunQuery}
          >
            Run SQL Query
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Schema Explorer & Right Query / Results Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Schema Explorer */}
        <div className="w-72 bg-slate-50/70 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200/80 bg-white">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center justify-between">
              <span>Schema Tables ({schema.length})</span>
              <Badge variant="aqua" size="sm">
                Active
              </Badge>
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {schema.map((tbl) => {
              const isExpanded = expandedTable === tbl.name;
              return (
                <div
                  key={tbl.name}
                  className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedTable(isExpanded ? null : tbl.name)}
                    className="w-full flex items-center justify-between p-2.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>{tbl.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tbl.rowCount} rows
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/50 space-y-1">
                      {tbl.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between text-[11px] p-1 rounded hover:bg-white text-slate-700"
                        >
                          <div className="flex items-center gap-1.5">
                            {col.pk ? (
                              <Key className="w-3 h-3 text-amber-500 shrink-0" />
                            ) : (
                              <Columns className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <span className={col.pk ? 'font-bold text-navy-900' : ''}>
                              {col.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {col.type || 'ANY'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Monaco SQL Editor & Tabular Results */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* SQL Editor Area */}
          <div className="h-[280px] border-b border-slate-200/80 relative">
            <Editor
              height="100%"
              language="sql"
              value={query}
              theme="light"
              onChange={(val) => setQuery(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Results Output Header */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-navy-900">Query Output</span>
              {result && !result.error && (
                <span className="text-slate-500 font-mono text-[11px]">
                  {result.values.length} rows returned in {result.executionTimeMs}ms
                </span>
              )}
            </div>
            {result?.error && (
              <Badge variant="danger" size="sm">
                Error
              </Badge>
            )}
          </div>

          {/* Tabular Output Table */}
          <div className="flex-1 overflow-auto p-4">
            {result?.error ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">SQL Execution Error</h5>
                  <p className="mt-0.5 font-mono">{result.error}</p>
                </div>
              </div>
            ) : result && result.columns.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-navy-900 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="p-2.5 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {result.values.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-700 whitespace-nowrap">
                            {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Write a SQL query above and click &quot;Run SQL Query&quot; to see relational output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
