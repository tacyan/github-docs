/**
 * マークダウン生成ユーティリティ
 * 
 * このモジュールはGitHubリポジトリの情報からマークダウン形式のドキュメントを
 * 生成するための機能を提供します。
 * 
 * @module markdown/generator
 */

import { marked } from 'marked';
import { RepoInfo, RepoDetails, Contributor, getFileContent } from '../github/api';
import { FileTree, getFileType, shouldIgnore } from '../github/fileUtils';
import hljs from 'highlight.js';

/**
 * マークダウンのコードブロックをシンタックスハイライトする
 */
marked.setOptions({
  // @ts-ignore - markedの型定義が古い可能性があります
  highlight: function(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('ハイライト処理エラー:', err);
      }
    }
    return code;
  }
});

/**
 * リポジトリ情報のマークダウンを生成する
 * 
 * @param repoDetails - リポジトリの詳細情報
 * @returns マークダウン文字列
 */
export function generateRepoInfoMarkdown(repoDetails: RepoDetails): string {
  let markdown = `# ${repoDetails.名前}\n\n`;
  
  markdown += `## リポジトリ情報\n\n`;
  markdown += `- **説明**: ${repoDetails.説明}\n`;
  markdown += `- **所有者**: ${repoDetails.所有者}\n`;
  markdown += `- **主要言語**: ${repoDetails.言語}\n`;
  markdown += `- **ライセンス**: ${repoDetails.ライセンス}\n`;
  markdown += `- **作成日**: ${repoDetails.作成日}\n`;
  markdown += `- **最終更新日**: ${repoDetails.最終更新日}\n\n`;
  
  markdown += `## 統計\n\n`;
  markdown += `- **スター数**: ${repoDetails.スター数.toLocaleString()}\n`;
  markdown += `- **フォーク数**: ${repoDetails.フォーク数.toLocaleString()}\n`;
  markdown += `- **ウォッチャー数**: ${repoDetails.ウォッチャー数.toLocaleString()}\n`;
  markdown += `- **オープンイシュー数**: ${repoDetails.オープンイシュー数.toLocaleString()}\n`;
  markdown += `- **デフォルトブランチ**: ${repoDetails.デフォルトブランチ}\n\n`;
  
  if (repoDetails.言語詳細 && Object.keys(repoDetails.言語詳細).length > 0) {
    markdown += `## 言語詳細\n\n`;
    
    const totalBytes = Object.values(repoDetails.言語詳細).reduce((sum, bytes) => sum + bytes, 0);
    
    markdown += `| 言語 | 割合 | バイト数 |\n`;
    markdown += `| --- | --- | --- |\n`;
    
    Object.entries(repoDetails.言語詳細)
      .sort((a, b) => b[1] - a[1])
      .forEach(([lang, bytes]) => {
        const percentage = (bytes / totalBytes * 100).toFixed(1);
        markdown += `| ${lang} | ${percentage}% | ${bytes.toLocaleString()} |\n`;
      });
    
    markdown += '\n';
  }
  
  return markdown;
}

/**
 * コントリビューター情報のマークダウンを生成する
 * 
 * @param contributors - コントリビューター情報の配列
 * @returns マークダウン文字列
 */
export function generateContributorsMarkdown(contributors: Contributor[]): string {
  if (!contributors || contributors.length === 0) {
    return '';
  }
  
  let markdown = `## コントリビューター\n\n`;
  
  contributors.forEach(contributor => {
    markdown += `### ${contributor.ユーザー名}\n\n`;
    markdown += `- **コントリビューション数**: ${contributor.コントリビューション数.toLocaleString()}\n`;
    markdown += `- **プロフィール**: [GitHub](${contributor.プロフィールURL})\n`;
    
    if (contributor.アバターURL) {
      markdown += `\n![${contributor.ユーザー名}](${contributor.アバターURL})\n\n`;
    }
  });
  
  return markdown;
}

/**
 * ファイルツリーのマークダウンを生成する
 * 
 * @param tree - ファイルツリー
 * @param indent - インデント（再帰用）
 * @returns マークダウン文字列
 */
export function generateFileTreeMarkdown(tree: FileTree[], indent: string = ''): string {
  let markdown = '';
  
  tree.forEach(item => {
    const name = item.path.split('/').pop() || '';
    const icon = item.type === 'dir' ? '📁' : '📄';
    
    markdown += `${indent}${icon} ${name}\n`;
    
    if (item.children && item.children.length > 0) {
      markdown += generateFileTreeMarkdown(item.children, `${indent}  `);
    }
  });
  
  return markdown;
}

/**
 * ファイルの内容をマークダウンに変換する
 * 
 * @param repoInfo - リポジトリ情報
 * @param filePath - ファイルパス
 * @param branch - ブランチ名
 * @param ignorePatterns - 無視パターン
 * @param sourceIgnorePatterns - ソースコード内の無視パターン
 * @returns マークダウン文字列のPromise
 */
export async function generateFileContentMarkdown(
  repoInfo: RepoInfo,
  filePath: string,
  branch: string,
  ignorePatterns: string[] = [],
  sourceIgnorePatterns: string[] = []
): Promise<string> {
  try {
    // 無視パターンに一致するファイルは除外
    if (shouldIgnore(filePath, ignorePatterns)) {
      return '';
    }
    
    const fileType = getFileType(filePath);
    const content = await getFileContent(repoInfo, filePath, branch, ignorePatterns);
    
    // ソースコード内の無視パターンに一致する行をフィルタリング
    let filteredContent = content;
    if (sourceIgnorePatterns.length > 0) {
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !shouldIgnore(line, sourceIgnorePatterns));
      filteredContent = filteredLines.join('\n');
    }
    
    let markdown = `### ${filePath}\n\n`;
    
    // コードブロックの言語を決定
    let language = '';
    switch (fileType) {
      case 'javascript':
        language = 'javascript';
        break;
      case 'typescript':
        language = 'typescript';
        break;
      case 'python':
        language = 'python';
        break;
      case 'html':
        language = 'html';
        break;
      case 'css':
        language = 'css';
        break;
      case 'json':
        language = 'json';
        break;
      case 'markdown':
        language = 'markdown';
        break;
      case 'yaml':
        language = 'yaml';
        break;
      default:
        language = '';
    }
    
    markdown += `\`\`\`${language}\n${filteredContent}\n\`\`\`\n\n`;
    
    return markdown;
  } catch (error) {
    console.error(`ファイル内容の取得に失敗しました (${filePath}):`, error);
    return `### ${filePath}\n\n> ファイル内容の取得に失敗しました。\n\n`;
  }
}

/**
 * リポジトリ全体のマークダウンを生成する
 * 
 * @param repoInfo - リポジトリ情報
 * @param repoDetails - リポジトリの詳細情報
 * @param contributors - コントリビューター情報
 * @param fileTree - ファイルツリー
 * @param branch - ブランチ名
 * @param ignorePatterns - 無視パターン
 * @param sourceIgnorePatterns - ソースコード内の無視パターン
 * @returns マークダウン文字列のPromise
 */
export async function generateRepositoryMarkdown(
  repoInfo: RepoInfo,
  repoDetails: RepoDetails,
  contributors: Contributor[],
  fileTree: FileTree[],
  branch: string,
  ignorePatterns: string[] = [],
  sourceIgnorePatterns: string[] = []
): Promise<string> {
  let markdown = '';
  
  // リポジトリ情報
  markdown += generateRepoInfoMarkdown(repoDetails);
  
  // コントリビューター情報
  markdown += generateContributorsMarkdown(contributors);
  
  // ファイルツリー
  markdown += `## ファイル構造\n\n`;
  markdown += generateFileTreeMarkdown(fileTree);
  markdown += '\n';
  
  // ファイル内容
  markdown += `## ファイル内容\n\n`;
  
  // ファイルツリーをフラットな配列に変換
  const flattenTree = (tree: FileTree[]): FileTree[] => {
    return tree.reduce((acc: FileTree[], item) => {
      acc.push(item);
      if (item.children && item.children.length > 0) {
        acc.push(...flattenTree(item.children));
      }
      return acc;
    }, []);
  };
  
  const flatFiles = flattenTree(fileTree).filter(item => item.type === 'file');
  
  // ファイル内容を順番に処理
  for (const file of flatFiles) {
    // 無視パターンに一致するファイルは除外
    if (shouldIgnore(file.path, ignorePatterns)) {
      continue;
    }
    
    try {
      // awaitを使用して非同期処理の結果を待つ
      const fileMarkdown = await generateFileContentMarkdown(
        repoInfo,
        file.path,
        branch,
        ignorePatterns,
        sourceIgnorePatterns
      );
      markdown += fileMarkdown;
    } catch (error) {
      console.error(`ファイル内容の生成に失敗しました (${file.path}):`, error);
      markdown += `### ${file.path}\n\n> ファイル内容の取得に失敗しました。\n\n`;
    }
  }
  
  return markdown;
}

/**
 * マークダウンをHTMLに変換する
 * 
 * @param markdown - マークダウン文字列
 * @returns HTML文字列
 */
export function convertMarkdownToHtml(markdown: string): string {
  return marked.parse(markdown);
} 