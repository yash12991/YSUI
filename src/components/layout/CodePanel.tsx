'use client';

import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '@/styles/components/codePanel.module.css';
import { ComponentType, ProjectFile } from '@/types';
import {
  FileCode2,
  Copy,
  Check,
  Folder,
  FolderOpen,
  File,
  FileJson,
  FileText,
  Code2 as CodeIcon,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface CodePanelProps {
  code: string;
  componentList: ComponentType[];
  files?: ProjectFile[];
  onCodeChange?: (code: string) => void;
}

interface FileTreeNode {
  type: 'file' | 'folder';
  name: string;
  path: string;
  children?: FileTreeNode[];
  content?: string;
}

function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.push({ type: 'file', name: part, path: file.path, content: file.content });
      } else {
        let folder = current.find(n => n.type === 'folder' && n.name === part) as FileTreeNode | undefined;
        if (!folder) {
          folder = { type: 'folder', name: part, path: parts.slice(0, i + 1).join('/'), children: [] };
          current.push(folder);
        }
        if (!folder.children) folder.children = [];
        current = folder.children;
      }
    }
  }

  function sortNodes(nodes: FileTreeNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  }

  sortNodes(root);
  return root;
}

function fileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'json') return FileJson;
  if (ext === 'css') return FileText;
  if (ext === 'md') return FileText;
  if (ext === 'tsx' || ext === 'ts') return CodeIcon;
  if (ext === 'yml' || ext === 'yaml') return FileText;
  return File;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  componentList,
  files = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const visibleFiles = files.length > 0 ? files : [{ path: 'GeneratedUI.tsx', content: code }];
  const activeFile = visibleFiles.find((file) => file.path === activePath) || visibleFiles[0];
  const activeCode = activeFile?.content || code;

  const tree = useMemo(() => buildFileTree(visibleFiles), [visibleFiles]);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = activeCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = activeCode ? activeCode.split('\n').length : 0;
  const language = activeFile?.path.endsWith('.json')
    ? 'json'
    : activeFile?.path.endsWith('.css')
      ? 'css'
      : activeFile?.path.endsWith('.md')
        ? 'markdown'
        : activeFile?.path.endsWith('.html')
          ? 'html'
          : 'tsx';

  function renderTree(nodes: FileTreeNode[], depth: number = 0): React.ReactNode {
    return nodes.map(node => {
      const padLeft = depth * 12;
      if (node.type === 'folder') {
        const isExpanded = expandedPaths.has(node.path);
        const FolderIcon = isExpanded ? FolderOpen : Folder;
        return (
          <React.Fragment key={node.path}>
            <button
              className={`${styles.fileTreeItem} ${styles.fileTreeFolder}`}
              onClick={() => toggleExpand(node.path)}
              type="button"
              title={node.path}
              style={{ paddingLeft: 8 + padLeft }}
            >
              <ChevronRight size={10} className={`${styles.fileTreeChevron} ${isExpanded ? styles.fileTreeChevronExpanded : ''}`} />
              <FolderIcon size={13} className={styles.fileTreeFolderIcon} />
              <span className={styles.fileTreeLabel}>{node.name}</span>
            </button>
            {isExpanded && node.children && renderTree(node.children, depth + 1)}
          </React.Fragment>
        );
      }

      const IconComponent = fileIcon(node.path);
      const isActive = node.path === activePath;
      return (
        <button
          key={node.path}
          className={`${styles.fileTreeItem} ${isActive ? styles.fileTreeItemActive : ''}`}
          onClick={() => setActivePath(node.path)}
          type="button"
          title={node.path}
          style={{ paddingLeft: 20 + padLeft }}
        >
          <IconComponent size={13} className={styles.fileTreeFileIcon} />
          <span className={styles.fileTreeLabel}>{node.name}</span>
        </button>
      );
    });
  }

  if (!activeCode) {
    return (
      <div className={styles.codePanel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FileCode2 size={15} className={styles.headerIconSvg} />
            <span className={styles.headerTitle}>Code</span>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.codeWireframe}>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>1</span>
              <span className={styles.codeKeyword} style={{ width: '42px' }} />
              <span className={styles.codeString} style={{ width: '55px' }} />
              <span className={styles.codeKeyword} style={{ width: '30px' }} />
              <span className={styles.codeString} style={{ width: '50px' }} />
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>2</span>
              <span className={styles.codeKeyword} style={{ width: '42px' }} />
              <span className={styles.codeBlock} style={{ width: '70px' }} />
              <span className={styles.codeKeyword} style={{ width: '30px' }} />
              <span className={styles.codeString} style={{ width: '80px' }} />
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>3</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>4</span>
              <span className={styles.codeKeyword} style={{ width: '50px' }} />
              <span className={styles.codeBlock} style={{ width: '25px' }} />
              <span className={styles.codeKeyword} style={{ width: '60px' }} />
              <span className={styles.codeBlock} style={{ width: '35px' }} />
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>5</span>
              <span className={styles.codeIndent} />
              <span className={styles.codeKeyword} style={{ width: '35px' }} />
              <span className={styles.codeBlock} style={{ width: '15px' }} />
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>6</span>
              <span className={styles.codeIndent} />
              <span className={styles.codeIndent} />
              <span className={styles.codeTag} style={{ width: '45px' }} />
              <span className={styles.codeString} style={{ width: '55px' }} />
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>7</span>
              <span className={styles.codeIndent} />
              <span className={styles.codeBlock} style={{ width: '30px' }} />
            </div>
          </div>
          <div className={styles.emptyTitle}>No code yet</div>
          <div className={styles.emptyHint}>
            Generated code will appear here. Use the chat to describe your UI.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.codePanel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileCode2 size={15} className={styles.headerIconSvg} />
          <span className={styles.headerTitle}>Project Files</span>
          {files.length > 0 && <span className={styles.fileCount}>{files.length} files</span>}
        </div>
        <div className={styles.headerActions}>
          <span className={styles.activeFileTab}>{activeFile?.path || 'GeneratedUI.tsx'}</span>
          <button
            className={`${styles.actionButton} ${copied ? styles.actionButtonSuccess : ''}`}
            onClick={handleCopy}
            id="copy-code-button"
          >
            {copied ? (
              <><Check size={13} /> Copied!</>
            ) : (
              <><Copy size={13} /> Copy</>
            )}
          </button>
        </div>
      </div>

      <div className={styles.projectCodeArea}>
        <aside className={styles.fileTree}>
          {renderTree(tree)}
        </aside>
        <div className={styles.codeContainer}>
          <div className={styles.codeWrapper}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                background: 'transparent',
                fontSize: '0.82rem',
              }}
            >
              {activeCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {componentList.length > 0 && (
        <div className={styles.componentList}>
          {componentList.map((comp) => (
            <span key={comp} className={styles.componentBadge}>
              {comp}
            </span>
          ))}
          <span className={styles.lineCount}>{lineCount} lines</span>
        </div>
      )}
    </div>
  );
};
