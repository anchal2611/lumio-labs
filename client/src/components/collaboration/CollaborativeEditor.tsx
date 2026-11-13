import React, { useEffect, useRef, useState, useCallback } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import type * as monacoType from 'monaco-editor';
import { Socket } from 'socket.io-client';
import { Lock, Users, ArrowDown, ShieldAlert, Sparkles } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './collabEditor.css';

export interface CollabColor {
  bg: string;
  text: string;
  light: string;
  border: string;
}

export interface CollabParticipant {
  socketId: string;
  userId: string;
  userName: string;
  userRole?: string;
  userColor?: CollabColor;
  cursor?: { lineNumber: number; column: number };
  selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
  activeLockedLines?: number[];
}

export interface LineLockInfo {
  lineNumber: number;
  lineId?: string;
  userId: string;
  userName: string;
  userColor: CollabColor;
  socketId: string;
  lockedAt: number;
  lastActivity: number;
  expiresAt: number;
}

interface CollaborativeEditorProps {
  socket: Socket | null;
  roomId: string;
  language: string;
  initialCode: string;
  currentUser: { id: string; name: string; role: string };
  onCodeChange?: (code: string) => void;
  participants: CollabParticipant[];
}

class RemoteCursorWidget implements monacoType.editor.IContentWidget {
  private id: string;
  private domNode: HTMLElement;
  private position: monacoType.IPosition | null = null;

  constructor(userId: string, userName: string, userColor: CollabColor) {
    this.id = `remote-cursor-${userId}`;
    this.domNode = document.createElement('div');
    this.domNode.className = 'collab-cursor-widget';
    this.domNode.style.pointerEvents = 'none';
    this.domNode.style.position = 'absolute';
    this.domNode.style.zIndex = '45';

    this.domNode.innerHTML = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: flex-start;">
        <div class="collab-cursor-label" style="background-color: ${userColor.bg}; color: ${userColor.text};">
          <span>${userName}</span>
        </div>
        <div class="collab-cursor-caret" style="background-color: ${userColor.bg}; box-shadow: 0 0 5px ${userColor.bg};"></div>
      </div>
    `;
  }

  getId(): string {
    return this.id;
  }

  getDomNode(): HTMLElement {
    return this.domNode;
  }

  getPosition(): monacoType.editor.IContentWidgetPosition | null {
    if (!this.position) return null;
    return {
      position: this.position,
      preference: [1], // monaco.editor.ContentWidgetPositionPreference.EXACT
    };
  }

  setPosition(pos: monacoType.IPosition | null): void {
    this.position = pos;
  }

  updateUserInfo(userName: string, userColor: CollabColor): void {
    const label = this.domNode.querySelector('.collab-cursor-label') as HTMLElement;
    const caret = this.domNode.querySelector('.collab-cursor-caret') as HTMLElement;
    if (label) {
      label.style.backgroundColor = userColor.bg;
      label.style.color = userColor.text;
      label.innerHTML = `<span>${userName}</span>`;
    }
    if (caret) {
      caret.style.backgroundColor = userColor.bg;
      caret.style.boxShadow = `0 0 5px ${userColor.bg}`;
    }
  }
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  socket,
  roomId,
  language,
  initialCode,
  currentUser,
  onCodeChange,
  participants,
}) => {
  const toast = useToast();
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monacoType | null>(null);

  const socketRef = useRef<Socket | null>(socket);
  socketRef.current = socket;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const [locks, setLocks] = useState<Record<number, LineLockInfo>>({});
  const locksRef = useRef<Record<number, LineLockInfo>>({});
  locksRef.current = locks;

  const currentVersionRef = useRef<number>(1);
  const isApplyingRemoteChangeRef = useRef<boolean>(false);
  const lastServerCodeRef = useRef<string>(initialCode);

  // Widget and decoration tracking
  const cursorWidgetsRef = useRef<Map<string, RemoteCursorWidget>>(new Map());
  const selectionDecorationsRef = useRef<string[]>([]);
  const lockDecorationsRef = useRef<string[]>([]);
  const dynamicStyleTagRef = useRef<HTMLStyleElement | null>(null);

  // Banner status message for auto-redirections
  const [redirectBanner, setRedirectBanner] = useState<{
    fromLine: number;
    toLine: number;
    ownerName: string;
    id: number;
  } | null>(null);

  // Injects dynamic CSS rules for participant cursor and lock background colors
  const updateDynamicStyles = useCallback((activeLocks: Record<number, LineLockInfo>, parts: CollabParticipant[]) => {
    let css = '';

    // Participant selection tints
    for (const p of parts) {
      if (p.userColor && p.userId !== currentUser.id) {
        css += `
          .collab-selection-${p.userId} {
            background-color: ${p.userColor.light} !important;
            border-radius: 2px;
          }
        `;
      }
    }

    // Locked line highlights
    for (const lock of Object.values(activeLocks)) {
      if (lock.userColor) {
        css += `
          .collab-locked-line-${lock.userId} {
            background-color: ${lock.userColor.light} !important;
            border-left: 3px solid ${lock.userColor.border} !important;
          }
        `;
      }
    }

    if (!dynamicStyleTagRef.current) {
      const style = document.createElement('style');
      style.id = 'collab-dynamic-styles';
      document.head.appendChild(style);
      dynamicStyleTagRef.current = style;
    }
    dynamicStyleTagRef.current.textContent = css;
  }, [currentUser.id]);

  // Update line lock decorations in Monaco
  const updateLockDecorations = useCallback((currentLocks: Record<number, LineLockInfo>) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations: monacoType.editor.IModelDeltaDecoration[] = [];

    for (const lock of Object.values(currentLocks)) {
      newDecorations.push({
        range: new monaco.Range(lock.lineNumber, 1, lock.lineNumber, 1),
        options: {
          isWholeLine: true,
          className: `collab-locked-line-${lock.userId}`,
          glyphMarginClassName: 'collab-lock-glyph',
          glyphMarginHoverMessage: {
            value: `🔒 **Line ${lock.lineNumber} Locked**\n\nCurrently being edited by **${lock.userName}**`,
          },
          hoverMessage: {
            value: `🔒 **Line ${lock.lineNumber} is locked by ${lock.userName}**\n\nOther participants cannot edit this line until unlocked.`,
          },
        },
      });
    }

    lockDecorationsRef.current = editor.deltaDecorations(lockDecorationsRef.current, newDecorations);
  }, []);

  // Update remote cursors and selection ranges
  const updateRemoteCursorsAndSelections = useCallback(
    (parts: CollabParticipant[]) => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const activeUserIds = new Set<string>();
      const newSelectionDecorations: monacoType.editor.IModelDeltaDecoration[] = [];

      for (const p of parts) {
        if (p.userId === currentUser.id || !p.userColor) continue;
        activeUserIds.add(p.userId);

        // 1. ContentWidget for remote cursor
        let widget = cursorWidgetsRef.current.get(p.userId);
        if (!widget) {
          widget = new RemoteCursorWidget(p.userId, p.userName, p.userColor);
          editor.addContentWidget(widget);
          cursorWidgetsRef.current.set(p.userId, widget);
        } else {
          widget.updateUserInfo(p.userName, p.userColor);
        }

        if (p.cursor && typeof p.cursor.lineNumber === 'number') {
          widget.setPosition({
            lineNumber: p.cursor.lineNumber,
            column: p.cursor.column || 1,
          });
          editor.layoutContentWidget(widget);
        } else {
          widget.setPosition(null);
          editor.layoutContentWidget(widget);
        }

        // 2. Selection highlights
        if (p.selection && (p.selection.startLineNumber !== p.selection.endLineNumber || p.selection.startColumn !== p.selection.endColumn)) {
          newSelectionDecorations.push({
            range: new monaco.Range(
              p.selection.startLineNumber,
              p.selection.startColumn,
              p.selection.endLineNumber,
              p.selection.endColumn
            ),
            options: {
              className: `collab-selection-${p.userId}`,
              inlineClassName: `collab-selection-${p.userId}`,
              hoverMessage: { value: `Selection by **${p.userName}**` },
            },
          });
        }
      }

      // Cleanup widgets for participants who left
      for (const [userId, widget] of cursorWidgetsRef.current.entries()) {
        if (!activeUserIds.has(userId)) {
          editor.removeContentWidget(widget);
          widget.getDomNode().remove();
          cursorWidgetsRef.current.delete(userId);
        }
      }

      selectionDecorationsRef.current = editor.deltaDecorations(
        selectionDecorationsRef.current,
        newSelectionDecorations
      );
    },
    [currentUser.id]
  );

  // Redirection logic: moves cursor to next available line downward
  const redirectUserToAvailableLine = useCallback(
    (fromLine: number, ownerName: string) => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const model = editor.getModel();
      if (!model) return;

      const totalLines = model.getLineCount();
      const currentLocks = locksRef.current;

      // 1. Search downward for the first unoccupied line
      let targetLine = -1;
      for (let l = fromLine + 1; l <= totalLines; l++) {
        const lock = currentLocks[l];
        if (!lock || lock.userId === currentUser.id) {
          targetLine = l;
          break;
        }
      }

      // 2. If no available line below, automatically create a new line at the end
      if (targetLine === -1) {
        const lastLineNum = totalLines;
        const lastLineText = model.getLineContent(lastLineNum);
        const indentMatch = model.getLineContent(fromLine).match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        const newlineText = '\n' + indent;

        const endCol = lastLineText.length + 1;
        isApplyingRemoteChangeRef.current = true;
        model.pushEditOperations(
          [],
          [
            {
              range: new monaco.Range(lastLineNum, endCol, lastLineNum, endCol),
              text: newlineText,
              forceMoveMarkers: true,
            },
          ],
          () => null
        );
        isApplyingRemoteChangeRef.current = false;

        targetLine = lastLineNum + 1;

        // Sync the created line to other participants
        socketRef.current?.emit('doc_change', {
          roomId: roomIdRef.current,
          baseVersion: currentVersionRef.current,
          changes: [
            {
              range: {
                startLineNumber: lastLineNum,
                startColumn: endCol,
                endLineNumber: lastLineNum,
                endColumn: endCol,
              },
              text: newlineText,
            },
          ],
          fullCode: model.getValue(),
        });
      }

      // 3. Move cursor to target line and reveal
      const targetLineText = model.getLineContent(targetLine);
      const targetIndent = (targetLineText.match(/^\s*/)?.[0] || '').length;
      const targetCol = targetIndent + 1;

      editor.setPosition({ lineNumber: targetLine, column: targetCol });
      editor.revealLineInCenterIfOutsideViewport(targetLine);
      editor.focus();

      // 4. Request lock on the newly acquired line
      socketRef.current?.emit('request_lock', {
        roomId: roomIdRef.current,
        lineNumber: targetLine,
      });

      // 5. Notify user
      const bannerData = {
        fromLine,
        toLine: targetLine,
        ownerName,
        id: Date.now(),
      };
      setRedirectBanner(bannerData);
      setTimeout(() => {
        setRedirectBanner((current) => (current?.id === bannerData.id ? null : current));
      }, 5000);

      toast.info(
        'Line Locked',
        `Line ${fromLine} is currently being edited by ${ownerName}. You've been moved to Line ${targetLine}.`
      );
    },
    [roomId, socket, currentUser.id, toast]
  );

  // Setup Monaco onMount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Enable glyph margin for lock indicators
    editor.updateOptions({
      glyphMargin: true,
      cursorBlinking: 'smooth',
      renderLineHighlight: 'all',
      smoothScrolling: true,
      minimap: { enabled: false },
      automaticLayout: true,
      wordWrap: 'on',
      fontSize: 14,
    });

    // 1. Intercept typing on locked lines before mutation
    editor.onKeyDown((e) => {
      // Allow navigation keys
      if (
        e.keyCode === monaco.KeyCode.UpArrow ||
        e.keyCode === monaco.KeyCode.DownArrow ||
        e.keyCode === monaco.KeyCode.LeftArrow ||
        e.keyCode === monaco.KeyCode.RightArrow ||
        e.keyCode === monaco.KeyCode.PageUp ||
        e.keyCode === monaco.KeyCode.PageDown ||
        e.keyCode === monaco.KeyCode.Home ||
        e.keyCode === monaco.KeyCode.End
      ) {
        return;
      }

      // Allow modifier-only keys
      if (
        e.keyCode === monaco.KeyCode.Shift ||
        e.keyCode === monaco.KeyCode.Ctrl ||
        e.keyCode === monaco.KeyCode.Alt ||
        e.keyCode === monaco.KeyCode.Meta
      ) {
        return;
      }

      // Allow copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyC) {
        return;
      }

      const pos = editor.getPosition();
      if (!pos) return;
      const currentLine = pos.lineNumber;

      const activeLock = locksRef.current[currentLine];
      if (activeLock && activeLock.userId !== currentUser.id) {
        // Line is locked by another participant!
        e.preventDefault();
        e.stopPropagation();

        redirectUserToAvailableLine(currentLine, activeLock.userName);
        return;
      }

      // If line is free, proactively request lock
      if (!activeLock) {
        socketRef.current?.emit('request_lock', {
          roomId: roomIdRef.current,
          lineNumber: currentLine,
        });
      }
    });

    // 2. Cursor position & selection change listener
    editor.onDidChangeCursorPosition((e) => {
      const selection = editor.getSelection();
      socketRef.current?.emit('cursor_move', {
        roomId: roomIdRef.current,
        cursor: { lineNumber: e.position.lineNumber, column: e.position.column },
        selection: selection
          ? {
              startLineNumber: selection.startLineNumber,
              startColumn: selection.startColumn,
              endLineNumber: selection.endLineNumber,
              endColumn: selection.endColumn,
            }
          : undefined,
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      const pos = editor.getPosition();
      if (!pos) return;
      socketRef.current?.emit('cursor_move', {
        roomId: roomIdRef.current,
        cursor: { lineNumber: pos.lineNumber, column: pos.column },
        selection: {
          startLineNumber: e.selection.startLineNumber,
          startColumn: e.selection.startColumn,
          endLineNumber: e.selection.endLineNumber,
          endColumn: e.selection.endColumn,
        },
      });
    });

    // 3. Document change listener
    editor.onDidChangeModelContent((event) => {
      if (isApplyingRemoteChangeRef.current) return;

      const model = editor.getModel();
      if (!model) return;

      // Ensure no change in event touches a line locked by another user
      for (const ch of event.changes) {
        const startL = ch.range.startLineNumber;
        const endL = ch.range.endLineNumber;
        for (let l = startL; l <= endL; l++) {
          const lock = locksRef.current[l];
          if (lock && lock.userId !== currentUser.id) {
            // Revert illegal edit!
            if (lastServerCodeRef.current !== undefined) {
              isApplyingRemoteChangeRef.current = true;
              model.setValue(lastServerCodeRef.current);
              isApplyingRemoteChangeRef.current = false;
            }
            redirectUserToAvailableLine(l, lock.userName);
            return;
          }
        }
      }

      const fullCode = model.getValue();
      lastServerCodeRef.current = fullCode;
      onCodeChange?.(fullCode);

      // Emit fine-grained document change
      const changes = event.changes.map((ch) => ({
        range: {
          startLineNumber: ch.range.startLineNumber,
          startColumn: ch.range.startColumn,
          endLineNumber: ch.range.endLineNumber,
          endColumn: ch.range.endColumn,
        },
        text: ch.text,
        rangeLength: ch.rangeLength,
      }));

      socketRef.current?.emit('doc_change', {
        roomId: roomIdRef.current,
        baseVersion: currentVersionRef.current,
        changes,
        fullCode,
      });
    });

    // Initial render of decorations
    updateLockDecorations(locksRef.current);
    updateRemoteCursorsAndSelections(participants);
  };

  // Socket event subscriptions
  useEffect(() => {
    if (!socket) return;

    // Room initial snapshot
    socket.on('room_init', ({ code, version, locks: initLocks, participants: initParticipants }: any) => {
      currentVersionRef.current = version || 1;
      if (initLocks) {
        setLocks(initLocks);
        locksRef.current = initLocks;
        updateDynamicStyles(initLocks, initParticipants || []);
        updateLockDecorations(initLocks);
      }
      if (editorRef.current && typeof code === 'string') {
        const model = editorRef.current.getModel();
        if (model && model.getValue() !== code) {
          isApplyingRemoteChangeRef.current = true;
          model.setValue(code);
          lastServerCodeRef.current = code;
          onCodeChange?.(code);
          isApplyingRemoteChangeRef.current = false;
        }
      }
    });

    // Fine-grained change applied from another participant
    socket.on('doc_change_applied', ({ senderId, version, changes, fullCode, locks: updatedLocks }: any) => {
      currentVersionRef.current = version;
      if (updatedLocks) {
        setLocks(updatedLocks);
        locksRef.current = updatedLocks;
        updateDynamicStyles(updatedLocks, participants);
        updateLockDecorations(updatedLocks);
      }

      if (senderId !== currentUser.id && editorRef.current) {
        const model = editorRef.current.getModel();
        const monaco = monacoRef.current;
        if (model && monaco && Array.isArray(changes)) {
          isApplyingRemoteChangeRef.current = true;
          try {
            const monacoEdits = changes.map((ch: any) => ({
              range: new monaco.Range(
                ch.range.startLineNumber,
                ch.range.startColumn,
                ch.range.endLineNumber,
                ch.range.endColumn
              ),
              text: ch.text,
              forceMoveMarkers: true,
            }));
            model.pushEditOperations([], monacoEdits, () => null);
            const updatedCode = model.getValue();
            lastServerCodeRef.current = updatedCode;
            onCodeChange?.(updatedCode);
          } catch {
            if (typeof fullCode === 'string' && model.getValue() !== fullCode) {
              model.setValue(fullCode);
              lastServerCodeRef.current = fullCode;
              onCodeChange?.(fullCode);
            }
          } finally {
            isApplyingRemoteChangeRef.current = false;
          }
        }
      }
    });

    // Change acknowledged by server
    socket.on('doc_change_ack', ({ version, locks: updatedLocks }: any) => {
      currentVersionRef.current = version;
      if (updatedLocks) {
        setLocks(updatedLocks);
        locksRef.current = updatedLocks;
        updateDynamicStyles(updatedLocks, participants);
        updateLockDecorations(updatedLocks);
      }
    });

    // Change rejected due to line lock conflict
    socket.on('doc_change_rejected', ({ conflict, fullCode, version, locks: updatedLocks }: any) => {
      currentVersionRef.current = version;
      if (updatedLocks) {
        setLocks(updatedLocks);
        locksRef.current = updatedLocks;
        updateDynamicStyles(updatedLocks, participants);
        updateLockDecorations(updatedLocks);
      }

      if (editorRef.current && typeof fullCode === 'string') {
        const model = editorRef.current.getModel();
        if (model && model.getValue() !== fullCode) {
          isApplyingRemoteChangeRef.current = true;
          model.setValue(fullCode);
          lastServerCodeRef.current = fullCode;
          onCodeChange?.(fullCode);
          isApplyingRemoteChangeRef.current = false;
        }
      }

      if (conflict) {
        toast.warning('Line Locked', conflict.reason || 'Editing rejected: line is locked by another participant.');
        if (conflict.targetLine && editorRef.current) {
          editorRef.current.setPosition({ lineNumber: conflict.targetLine, column: 1 });
          editorRef.current.revealLineInCenterIfOutsideViewport(conflict.targetLine);
          editorRef.current.focus();
        }
      }
    });

    // Lock updates broadcast
    socket.on('locks_updated', ({ locks: updatedLocks }: { locks: Record<number, LineLockInfo> }) => {
      setLocks(updatedLocks);
      locksRef.current = updatedLocks;
      updateDynamicStyles(updatedLocks, participants);
      updateLockDecorations(updatedLocks);
    });

    // Lock rejected response
    socket.on('lock_rejected', ({ requestedLine, conflictOwner, redirectLine }: any) => {
      if (redirectLine && conflictOwner) {
        redirectUserToAvailableLine(requestedLine, conflictOwner.userName);
      }
    });

    // Remote cursor updated
    socket.on('cursor_updated', (data: any) => {
      if (data.userId !== currentUserRef.current.id && editorRef.current) {
        let widget = cursorWidgetsRef.current.get(data.userId);
        if (!widget && data.userName && data.userColor) {
          widget = new RemoteCursorWidget(data.userId, data.userName, data.userColor);
          editorRef.current.addContentWidget(widget);
          cursorWidgetsRef.current.set(data.userId, widget);
        }
        if (widget && data.cursor) {
          widget.setPosition({
            lineNumber: data.cursor.lineNumber,
            column: data.cursor.column || 1,
          });
          editorRef.current.layoutContentWidget(widget);
        }
      }
    });

    // Fallback/Full sync code updated
    socket.on('code_updated', ({ code: updatedCode, senderId }: any) => {
      if (senderId !== currentUserRef.current.id && editorRef.current && typeof updatedCode === 'string') {
        const model = editorRef.current.getModel();
        if (model && model.getValue() !== updatedCode) {
          isApplyingRemoteChangeRef.current = true;
          model.setValue(updatedCode);
          lastServerCodeRef.current = updatedCode;
          onCodeChange?.(updatedCode);
          isApplyingRemoteChangeRef.current = false;
        }
      }
    });

    return () => {
      socket.off('room_init');
      socket.off('doc_change_applied');
      socket.off('doc_change_ack');
      socket.off('doc_change_rejected');
      socket.off('locks_updated');
      socket.off('lock_rejected');
      socket.off('cursor_updated');
      socket.off('code_updated');
    };
  }, [socket, roomId, currentUser.id, onCodeChange, participants, redirectUserToAvailableLine, updateDynamicStyles, updateLockDecorations, toast]);

  // Update styles and decorations when participants change
  useEffect(() => {
    updateDynamicStyles(locks, participants);
    updateRemoteCursorsAndSelections(participants);
  }, [participants, locks, updateDynamicStyles, updateRemoteCursorsAndSelections]);

  // Cleanup dynamic styles on unmount
  useEffect(() => {
    return () => {
      dynamicStyleTagRef.current?.remove();
      dynamicStyleTagRef.current = null;
    };
  }, []);

  const lockedLinesList = Object.values(locks);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-950">
      {/* Smart Line Lock Status Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Line Locks:</span>
          </div>

          {lockedLinesList.length === 0 ? (
            <span className="text-slate-500 text-[11px] italic">No lines currently locked</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {lockedLinesList.map((lock) => {
                const isMe = lock.userId === currentUser.id;
                return (
                  <span
                    key={`${lock.lineNumber}-${lock.userId}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border"
                    style={{
                      backgroundColor: lock.userColor?.light || 'rgba(59, 130, 246, 0.15)',
                      borderColor: lock.userColor?.border || '#3b82f6',
                      color: lock.userColor?.border || '#93c5fd',
                    }}
                    title={`Line ${lock.lineNumber} owned by ${lock.userName}`}
                  >
                    <span className="font-bold">L{lock.lineNumber}</span>
                    <span className="text-slate-300">· {isMe ? 'You' : lock.userName}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>Auto-Conflict Prevention Active</span>
          </span>
        </div>
      </div>

      {/* Auto-Redirection Notification Banner */}
      {redirectBanner && (
        <div className="bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-between animate-fadeIn z-20">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Line <strong className="text-amber-100">{redirectBanner.fromLine}</strong> is currently being edited by{' '}
              <strong className="text-amber-100">{redirectBanner.ownerName}</strong>. You've been automatically shifted
              downward to Line <strong className="text-amber-100">{redirectBanner.toLine}</strong>.
            </span>
          </div>
          <button
            onClick={() => setRedirectBanner(null)}
            className="text-amber-400 hover:text-amber-100 text-xs font-semibold px-2 py-0.5 rounded hover:bg-amber-900/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          defaultValue={initialCode}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            glyphMargin: true,
            lineNumbers: 'on',
            automaticLayout: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
};
