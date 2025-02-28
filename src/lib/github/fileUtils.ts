/**
 * ファイル操作ユーティリティ
 * 
 * このモジュールはファイルツリーの処理、ファイルの種類の判定、
 * 無視パターンに基づくファイルのフィルタリングなどの機能を提供します。
 * 
 * @module github/fileUtils
 */

import { TreeItem } from './api';

/**
 * ファイルツリーの型定義
 */
export interface FileTree {
  path: string;
  type: 'file' | 'dir';
  children?: FileTree[];
}

/**
 * ファイルの種類を判定する
 * 
 * @param filePath - ファイルパス
 * @returns ファイルの種類
 */
export function getFileType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  
  // プログラミング言語
  const codeExtensions: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    dart: 'dart',
    sh: 'bash',
    bat: 'batch',
    ps1: 'powershell',
    sql: 'sql',
    r: 'r',
    m: 'matlab',
    pl: 'perl',
    lua: 'lua',
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    clj: 'clojure',
    hs: 'haskell',
    fs: 'fsharp',
    ml: 'ocaml',
    groovy: 'groovy',
    jl: 'julia'
  };
  
  // マークアップ・スタイルシート
  const markupExtensions: Record<string, string> = {
    html: 'html',
    htm: 'html',
    xml: 'xml',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    svg: 'svg',
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml'
  };
  
  // ドキュメント
  const docExtensions: Record<string, string> = {
    txt: 'text',
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    ppt: 'powerpoint',
    pptx: 'powerpoint',
    odt: 'openoffice',
    ods: 'openoffice',
    odp: 'openoffice'
  };
  
  // 画像
  const imageExtensions: Record<string, string> = {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    tiff: 'image',
    webp: 'image',
    ico: 'image'
  };
  
  // その他
  const otherExtensions: Record<string, string> = {
    zip: 'archive',
    rar: 'archive',
    tar: 'archive',
    gz: 'archive',
    '7z': 'archive',
    exe: 'executable',
    dll: 'binary',
    so: 'binary',
    a: 'binary',
    o: 'binary',
    class: 'binary',
    jar: 'binary',
    war: 'binary',
    ear: 'binary'
  };
  
  // 設定ファイル
  const configExtensions: Record<string, string> = {
    ini: 'config',
    conf: 'config',
    cfg: 'config',
    config: 'config',
    env: 'config'
  };
  
  // 特殊なファイル名
  if (filePath.endsWith('package.json')) return 'package-json';
  if (filePath.endsWith('tsconfig.json')) return 'tsconfig';
  if (filePath.endsWith('.gitignore')) return 'gitignore';
  if (filePath.endsWith('.GithubDocsignore')) return 'githubdocsignore';
  if (filePath.endsWith('Dockerfile')) return 'dockerfile';
  if (filePath.endsWith('docker-compose.yml') || filePath.endsWith('docker-compose.yaml')) return 'docker-compose';
  if (filePath.endsWith('Makefile')) return 'makefile';
  if (filePath.endsWith('README.md')) return 'readme';
  if (filePath.endsWith('LICENSE')) return 'license';
  
  // 拡張子による判定
  return codeExtensions[extension] || 
         markupExtensions[extension] || 
         docExtensions[extension] || 
         imageExtensions[extension] || 
         otherExtensions[extension] || 
         configExtensions[extension] || 
         'unknown';
}

/**
 * パターンがファイルパスにマッチするかを判定する
 * 
 * @param pattern - パターン
 * @param filePath - ファイルパス
 * @returns マッチするかどうか
 */
export function matchPattern(pattern: string, filePath: string): boolean {
  // 空のパターンはマッチしない
  if (!pattern) return false;
  
  // 正確なパスマッチ
  if (pattern === filePath) return true;
  
  // ファイル名のみの比較（パスの最後の部分）
  const fileName = filePath.split('/').pop() || '';
  if (pattern === fileName) return true;
  
  // ワイルドカードを正規表現に変換
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  // 先頭と末尾のマッチを強制
  const regex = new RegExp(`^${regexPattern}$`);
  
  // ファイルパス全体とファイル名のみの両方でチェック
  return regex.test(filePath) || regex.test(fileName);
}

/**
 * ファイルパスが無視パターンにマッチするかを判定する
 * 
 * @param filePath - ファイルパス
 * @param ignorePatterns - 無視パターンの配列
 * @returns 無視すべきかどうか
 */
export function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  // package-lock.jsonファイルは常に除外
  if (filePath === 'package-lock.json' || filePath.endsWith('/package-lock.json')) {
    return true;
  }
  
  // 空のパターン配列の場合は無視しない
  if (!ignorePatterns || ignorePatterns.length === 0) return false;
  
  // いずれかのパターンにマッチする場合は無視する
  return ignorePatterns.some(pattern => {
    // コメント行やからの行は無視
    if (pattern.startsWith('#') || pattern.trim() === '') return false;
    
    // 否定パターン（!で始まる）の場合は逆の結果を返す
    if (pattern.startsWith('!')) {
      return !matchPattern(pattern.substring(1), filePath);
    }
    
    return matchPattern(pattern, filePath);
  });
}

/**
 * フラットなツリーアイテムの配列からネストされたファイルツリーを構築する
 * 
 * @param items - ツリーアイテムの配列
 * @param ignorePatterns - 無視パターンの配列
 * @param maxDepth - 最大深度（-1は無制限）
 * @returns ネストされたファイルツリー
 */
export function buildFileTree(
  items: TreeItem[], 
  ignorePatterns: string[] = [], 
  maxDepth: number = -1
): FileTree[] {
  const root: FileTree[] = [];
  const map: Record<string, FileTree> = {};
  
  // 最初にディレクトリを作成
  items
    .filter(item => item.type === 'tree')
    .filter(item => !shouldIgnore(item.path, ignorePatterns))
    .forEach(item => {
      const depth = item.path.split('/').length;
      if (maxDepth !== -1 && depth > maxDepth) return;
      
      map[item.path] = {
        path: item.path,
        type: 'dir',
        children: []
      };
    });
  
  // ディレクトリツリーを構築
  Object.values(map).forEach(dir => {
    const parts = dir.path.split('/');
    const dirName = parts.pop() || '';
    const parentPath = parts.join('/');
    
    if (parentPath === '') {
      root.push(dir);
    } else if (map[parentPath]) {
      map[parentPath].children = map[parentPath].children || [];
      map[parentPath].children.push(dir);
    }
  });
  
  // ファイルを追加
  items
    .filter(item => item.type === 'blob')
    .filter(item => !shouldIgnore(item.path, ignorePatterns))
    .forEach(item => {
      const depth = item.path.split('/').length;
      if (maxDepth !== -1 && depth > maxDepth) return;
      
      const parts = item.path.split('/');
      const fileName = parts.pop() || '';
      const parentPath = parts.join('/');
      
      const fileNode: FileTree = {
        path: item.path,
        type: 'file'
      };
      
      if (parentPath === '') {
        root.push(fileNode);
      } else if (map[parentPath]) {
        map[parentPath].children = map[parentPath].children || [];
        map[parentPath].children.push(fileNode);
      }
    });
  
  return root;
}

/**
 * ファイルツリーを文字列形式で表示する
 * 
 * @param tree - ファイルツリー
 * @param indent - インデント（再帰用）
 * @returns ファイルツリーの文字列表現
 */
export function formatFileTree(tree: FileTree[], indent: string = ''): string {
  let result = '';
  
  tree.forEach((item, index) => {
    const isLast = index === tree.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const childIndent = isLast ? '    ' : '│   ';
    
    result += `${indent}${prefix}${item.path.split('/').pop()}\n`;
    
    if (item.children && item.children.length > 0) {
      result += formatFileTree(item.children, indent + childIndent);
    }
  });
  
  return result;
} 