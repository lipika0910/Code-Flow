import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from '../../context/ThemeContext';

export default function CodeMirrorEditor({
  value,
  onChange,
  language = 'javascript',
  fontSize = 14,
  readOnly = false,
  minHeight = '300px'
}) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { theme } = useTheme();

  // Pick language extension
  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'html':
        return html();
      case 'css':
        return css();
      case 'javascript':
      case 'js':
      default:
        return javascript();
    }
  };

  // Custom editor theme matching CodeFlow styles
  const baseTheme = EditorView.theme({
    '&': {
      fontSize: `${fontSize}px`,
      height: '100%',
      minHeight: minHeight,
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)',
      fontFamily: "var(--font-mono)"
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'inherit'
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-muted)',
      borderRight: '1px solid var(--border-subtle)'
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(139, 92, 246, 0.08)'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      color: 'var(--accent-teal)'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--accent-teal)'
    }
  });

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value || '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        getLanguageExtension(language),
        baseTheme,
        ...(theme === 'dark' ? [oneDark] : []),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, theme, fontSize, readOnly]);

  // Handle external value changes (e.g. template reset or file load)
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value || '' }
        });
      }
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className="codemirror-wrapper w-100 h-100"
      style={{ overflow: 'hidden', minHeight }}
    />
  );
}
