/**
 * GitHubリポジトリ分析アプリケーション
 * 
 * このアプリケーションはGitHubリポジトリのソースコードを分析し、
 * マークダウン形式のドキュメントを自動生成します。
 * 
 * @module app/page
 */

'use client';

import { useState, useEffect } from 'react';
import RepoForm from '@/components/RepoForm';
import IgnorePatterns from '@/components/IgnorePatterns';
import FileTree from '@/components/FileTree';
import { FileTree as FileTreeType } from '@/lib/github/fileUtils';

/**
 * ホームページコンポーネント
 * 
 * @returns ホームページのJSX要素
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileTreeType[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'info' | 'bulk'>('single');
  const [docsPatterns, setDocsPatterns] = useState<string[]>([]);
  const [sourcePatterns, setSourcePatterns] = useState<string[]>([]);
  const [maxDepth, setMaxDepth] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  /**
   * 初期化時に無視パターンを読み込む
   */
  useEffect(() => {
    const loadIgnorePatterns = async () => {
      try {
        // .GithubDocsignoreを読み込む
        const docsResponse = await fetch('/.GithubDocsignore');
        if (docsResponse.ok) {
          const docsText = await docsResponse.text();
          const patterns = docsText
            .split('\n')
            .filter(line => line.trim() !== '' && !line.startsWith('#'));
          setDocsPatterns(patterns);
        }

        // .GithubDocsSourceignoreを読み込む
        const sourceResponse = await fetch('/.GithubDocsSourceignore');
        if (sourceResponse.ok) {
          const sourceText = await sourceResponse.text();
          const patterns = sourceText
            .split('\n')
            .filter(line => line.trim() !== '' && !line.startsWith('#'));
          setSourcePatterns(patterns);
        }
      } catch (error) {
        console.error('無視パターンの読み込みに失敗しました:', error);
      }
    };

    loadIgnorePatterns();
  }, []);

  /**
   * リポジトリを読み込む
   * 
   * @param url - リポジトリURL
   * @param depth - 最大深度
   */
  const handleRepoSubmit = async (url: string, depth: number) => {
    setIsLoading(true);
    setError(null);
    setRepoUrl(url);
    setMaxDepth(depth);
    setFileTree([]);
    setMarkdown('');
    setSelectedFile(null);
    setFileContent(null);

    try {
      // リポジトリ情報を取得
      const infoResponse = await fetch(`/api/github?url=${encodeURIComponent(url)}`);
      if (!infoResponse.ok) {
        const errorData = await infoResponse.json();
        throw new Error(errorData.error || 'リポジトリ情報の取得に失敗しました。');
      }
      const infoData = await infoResponse.json();
      
      // オブジェクトの各プロパティが適切に文字列化されていることを確認
      Object.keys(infoData).forEach(key => {
        if (typeof infoData[key] === 'object' && infoData[key] !== null) {
          // 既に文字列化されていない場合のみ文字列化
          if (typeof infoData[key].toString === 'function' && infoData[key].toString() === '[object Object]') {
            infoData[key] = JSON.stringify(infoData[key]);
          }
        }
      });
      
      setRepoInfo(infoData);

      // ファイルツリーを取得
      const treeResponse = await fetch('/api/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: url,
          ignorePatterns: docsPatterns,
          maxDepth: depth,
        }),
      });

      if (!treeResponse.ok) {
        const errorData = await treeResponse.json();
        throw new Error(errorData.error || 'ファイルツリーの取得に失敗しました。');
      }

      const treeData = await treeResponse.json();
      
      // ファイルツリーデータが適切な形式であることを確認
      let fileTreeData = treeData.fileTree || [];
      if (typeof fileTreeData === 'string') {
        try {
          fileTreeData = JSON.parse(fileTreeData);
        } catch (e) {
          console.error('ファイルツリーのパースに失敗しました:', e);
        }
      }
      
      setFileTree(fileTreeData);

      // マークダウンを生成
      const markdownResponse = await fetch('/api/github/markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: url,
          ignorePatterns: docsPatterns,
          sourceIgnorePatterns: sourcePatterns,
          maxDepth: depth,
        }),
      });

      if (!markdownResponse.ok) {
        const errorData = await markdownResponse.json();
        throw new Error(errorData.error || 'マークダウンの生成に失敗しました。');
      }

      const markdownData = await markdownResponse.json();
      
      // マークダウンデータが適切な形式であることを確認
      let markdownContent = markdownData.markdown || '';
      if (typeof markdownContent === 'object') {
        try {
          markdownContent = JSON.stringify(markdownContent, null, 2);
        } catch (e) {
          console.error('マークダウンの文字列化に失敗しました:', e);
        }
      }
      
      setMarkdown(markdownContent);
    } catch (error) {
      console.error('エラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 無視パターンが変更されたときの処理
   * 
   * @param newDocsPatterns - 新しい.GithubDocsignoreパターン
   * @param newSourcePatterns - 新しい.GithubDocsSourceignoreパターン
   */
  const handlePatternsChange = (newDocsPatterns: string, newSourcePatterns: string) => {
    try {
      const parsedDocsPatterns = JSON.parse(newDocsPatterns);
      const parsedSourcePatterns = JSON.parse(newSourcePatterns);
      setDocsPatterns(parsedDocsPatterns);
      setSourcePatterns(parsedSourcePatterns);
    } catch (error) {
      console.error('パターンのパースに失敗しました:', error);
      setError('無視パターンの処理中にエラーが発生しました。');
    }
  };

  /**
   * ファイルがクリックされたときの処理
   * 
   * @param path - ファイルパス
   */
  const handleFileClick = async (path: string) => {
    setSelectedFile(path);
    setFileContent(null);

    try {
      const response = await fetch('/api/github/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          filePath: path,
          branch: repoInfo?.defaultBranch || 'main',
          sourceIgnorePatterns: sourcePatterns,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ファイル内容の取得に失敗しました。');
      }

      const data = await response.json();
      
      // ファイル内容の処理
      let displayContent = '';
      
      // データが存在するか確認
      if (data.content) {
        // JSONファイルの場合は特別な処理
        if (path.endsWith('.json')) {
          // すでに文字列の場合はそのまま使用
          if (typeof data.content === 'string') {
            try {
              // 文字列がJSON形式かチェック
              const parsed = JSON.parse(data.content);
              // 整形して表示
              displayContent = JSON.stringify(parsed, null, 2);
            } catch (e) {
              // パースに失敗した場合はそのまま表示
              displayContent = data.content;
            }
          } else if (typeof data.content === 'object') {
            // オブジェクトの場合は文字列化
            displayContent = JSON.stringify(data.content, null, 2);
          } else {
            displayContent = String(data.content);
          }
        } else {
          // 通常のファイルの場合
          if (typeof data.content === 'object') {
            displayContent = JSON.stringify(data.content, null, 2);
          } else {
            displayContent = String(data.content);
          }
        }
      } else {
        displayContent = 'ファイル内容が空です。';
      }
      
      setFileContent(displayContent);
    } catch (error) {
      console.error('ファイル内容の取得に失敗しました:', error);
      setFileContent('ファイル内容の取得に失敗しました。');
    }
  };

  /**
   * マークダウンをダウンロードする
   */
  const handleDownloadMarkdown = () => {
    if (!markdown) return;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoInfo?.repoDetails?.名前 || 'github-docs'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">GitHubリポジトリ分析</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">無視パターン設定</h2>
                <IgnorePatterns
                  initialDocsPatterns={docsPatterns}
                  initialSourcePatterns={sourcePatterns}
                  onPatternsChange={handlePatternsChange}
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      className={`${
                        activeTab === 'single'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      onClick={() => setActiveTab('single')}
                    >
                      単一リポジトリ分析
                    </button>
                    <button
                      className={`${
                        activeTab === 'info'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      onClick={() => setActiveTab('info')}
                    >
                      リポジトリ情報表示
                    </button>
                    <button
                      className={`${
                        activeTab === 'bulk'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      onClick={() => setActiveTab('bulk')}
                    >
                      バルクマークダウン生成
                    </button>
                  </nav>
                </div>

                <div className="mt-4">
                  {activeTab === 'single' && (
                    <div>
                      <RepoForm onSubmit={handleRepoSubmit} isLoading={isLoading} />

                      {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                          <p>{error}</p>
                        </div>
                      )}

                      {fileTree.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">ファイルツリー</h3>
                          <FileTree tree={fileTree} onFileClick={handleFileClick} />
                        </div>
                      )}

                      {selectedFile && fileContent && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            ファイル内容: {selectedFile}
                          </h3>
                          <div className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm">{fileContent}</pre>
                          </div>
                        </div>
                      )}

                      {markdown && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900">マークダウンプレビュー</h3>
                            <button
                              onClick={handleDownloadMarkdown}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                            >
                              ダウンロード
                            </button>
                          </div>
                          <div className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'info' && (
                    <div>
                      <RepoForm onSubmit={handleRepoSubmit} isLoading={isLoading} />

                      {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                          <p>{error}</p>
                        </div>
                      )}

                      {repoInfo && repoInfo.repoDetails && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">リポジトリ情報</h3>

                          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                              <div>
                                <h4 className="text-xl font-medium">{repoInfo.repoDetails.名前}</h4>
                                <p className="text-gray-500 mt-1">{repoInfo.repoDetails.説明}</p>
                                <div className="mt-4 space-y-2">
                                  <p><span className="font-medium">所有者:</span> {repoInfo.repoDetails.所有者}</p>
                                  <p><span className="font-medium">主要言語:</span> {repoInfo.repoDetails.言語}</p>
                                  <p><span className="font-medium">ライセンス:</span> {repoInfo.repoDetails.ライセンス}</p>
                                  <p><span className="font-medium">作成日:</span> {repoInfo.repoDetails.作成日}</p>
                                  <p><span className="font-medium">最終更新日:</span> {repoInfo.repoDetails.最終更新日}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-medium mb-2">統計</h4>
                                <div className="space-y-2">
                                  <p><span className="font-medium">スター数:</span> {repoInfo.repoDetails.スター数.toLocaleString()}</p>
                                  <p><span className="font-medium">フォーク数:</span> {repoInfo.repoDetails.フォーク数.toLocaleString()}</p>
                                  <p><span className="font-medium">ウォッチャー数:</span> {repoInfo.repoDetails.ウォッチャー数.toLocaleString()}</p>
                                  <p><span className="font-medium">オープンイシュー数:</span> {repoInfo.repoDetails.オープンイシュー数.toLocaleString()}</p>
                                  <p><span className="font-medium">デフォルトブランチ:</span> {repoInfo.repoDetails.デフォルトブランチ}</p>
                                </div>
                              </div>
                            </div>

                            {repoInfo.repoDetails.言語詳細 && Object.keys(repoInfo.repoDetails.言語詳細).length > 0 && (
                              <div className="border-t border-gray-200 p-4">
                                <h4 className="text-lg font-medium mb-2">言語詳細</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {Object.entries(repoInfo.repoDetails.言語詳細).map(([lang, bytes]) => (
                                    <div key={lang} className="p-2 bg-gray-50 rounded-md">
                                      <p className="font-medium">{lang}</p>
                                      <p className="text-sm text-gray-500">{Number(bytes).toLocaleString()} バイト</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {repoInfo && repoInfo.contributors && repoInfo.contributors.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">コントリビューター</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {repoInfo.contributors.map((contributor: any) => (
                              <div key={contributor.ユーザー名} className="bg-white border border-gray-200 rounded-md p-4 flex items-center">
                                <img
                                  src={contributor.アバターURL}
                                  alt={`${contributor.ユーザー名}のアバター`}
                                  className="w-12 h-12 rounded-full mr-4"
                                />
                                <div>
                                  <h4 className="font-medium">{contributor.ユーザー名}</h4>
                                  <p className="text-sm text-gray-500">
                                    コントリビューション: {contributor.コントリビューション数.toLocaleString()}
                                  </p>
                                  <a
                                    href={contributor.プロフィールURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                  >
                                    GitHubプロフィール
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'bulk' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">バルクマークダウン生成</h3>
                      <p className="text-gray-500 mb-4">
                        複数のリポジトリのマークダウンを一括で生成します。各リポジトリのURLを1行に1つずつ入力してください。
                      </p>

                      <textarea
                        className="w-full h-40 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="https://github.com/owner/repo1&#10;https://github.com/owner/repo2&#10;https://github.com/owner/repo3"
                        aria-label="リポジトリURL（1行に1つ）"
                      />

                      <div className="mt-4 flex items-center">
                        <span className="text-sm mr-2">深さ:</span>
                        <input
                          type="number"
                          value={maxDepth}
                          onChange={(e) => setMaxDepth(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                          className="w-16 p-1 text-center border border-gray-300 rounded-md"
                          min="1"
                          max="10"
                          aria-label="再帰的深さ"
                        />
                      </div>

                      <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                            <span>処理中...</span>
                          </div>
                        ) : (
                          'バルク生成実行'
                        )}
                      </button>

                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-2">処理結果</h4>
                        <div className="bg-white border border-gray-200 p-4 rounded-md">
                          <p className="text-gray-500">まだ処理結果はありません。</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GitHubリポジトリ分析アプリケーション
          </p>
        </div>
      </footer>
    </div>
  );
}
