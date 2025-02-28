/**
 * 無視パターン設定コンポーネント
 * 
 * このコンポーネントは.GithubDocsignoreと.GithubDocsSourceignoreの
 * パターンを編集するためのインターフェースを提供します。
 * 
 * @module components/IgnorePatterns
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * 無視パターン設定のプロパティ
 */
interface IgnorePatternsProps {
  initialDocsPatterns?: string[];
  initialSourcePatterns?: string[];
  onPatternsChange: (docsPatterns: string, sourcePatterns: string) => void;
}

/**
 * 無視パターン設定コンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns 無視パターン設定のJSX要素
 */
export default function IgnorePatterns({
  initialDocsPatterns = [],
  initialSourcePatterns = [],
  onPatternsChange
}: IgnorePatternsProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'source'>('docs');
  const [docsPatterns, setDocsPatterns] = useState<string[]>(initialDocsPatterns);
  const [sourcePatterns, setSourcePatterns] = useState<string[]>(initialSourcePatterns);
  const [docsText, setDocsText] = useState(initialDocsPatterns.join('\n'));
  const [sourceText, setSourceText] = useState(initialSourcePatterns.join('\n'));

  /**
   * 初期値が変更されたときの処理
   */
  useEffect(() => {
    setDocsPatterns(initialDocsPatterns);
    setSourcePatterns(initialSourcePatterns);
    setDocsText(initialDocsPatterns.join('\n'));
    setSourceText(initialSourcePatterns.join('\n'));
  }, [initialDocsPatterns, initialSourcePatterns]);

  /**
   * .GithubDocsignoreのテキストが変更されたときの処理
   * 
   * @param e - テキストエリアのイベント
   */
  const handleDocsTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setDocsText(newText);
    const newPatterns = newText.split('\n').filter(line => line.trim() !== '');
    setDocsPatterns(newPatterns);
    // 配列を文字列として渡す
    onPatternsChange(JSON.stringify(newPatterns), JSON.stringify(sourcePatterns));
  };

  /**
   * .GithubDocsSourceignoreのテキストが変更されたときの処理
   * 
   * @param e - テキストエリアのイベント
   */
  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSourceText(newText);
    const newPatterns = newText.split('\n').filter(line => line.trim() !== '');
    setSourcePatterns(newPatterns);
    // 配列を文字列として渡す
    onPatternsChange(JSON.stringify(docsPatterns), JSON.stringify(newPatterns));
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'docs'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('docs')}
        >
          .GithubDocsignore
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'source'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('source')}
        >
          .GithubDocsSourceignore
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'docs' ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              リポジトリ分析時に無視するファイルやディレクトリを指定します。.gitignoreと同様の形式で記述します。
            </p>
            <textarea
              value={docsText}
              onChange={handleDocsTextChange}
              className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y"
              placeholder="# 例: node_modules/"
              aria-label=".GithubDocsignoreパターン"
            />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              ソースコード内で無視する行のパターンを指定します。各行は正規表現として扱われます。
            </p>
            <textarea
              value={sourceText}
              onChange={handleSourceTextChange}
              className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y"
              placeholder="# 例: ^\s*\/\/.*$"
              aria-label=".GithubDocsSourceignoreパターン"
            />
          </div>
        )}
      </div>
    </div>
  );
} 