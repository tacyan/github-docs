/**
 * リポジトリ入力フォームコンポーネント
 * 
 * このコンポーネントはGitHubリポジトリのURLを入力するフォームを提供します。
 * リポジトリの検索機能も含まれています。
 * 
 * @module components/RepoForm
 */

'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * リポジトリ検索結果の型定義
 */
interface RepoSearchResult {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
}

/**
 * リポジトリフォームのプロパティ
 */
interface RepoFormProps {
  onSubmit: (url: string, depth: number) => void;
  isLoading?: boolean;
}

/**
 * リポジトリ入力フォームコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns リポジトリ入力フォームのJSX要素
 */
export default function RepoForm({ onSubmit, isLoading = false }: RepoFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RepoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [depth, setDepth] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  /**
   * リポジトリを検索する
   * 
   * @param query - 検索クエリ
   */
  const searchRepositories = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`);
      if (!response.ok) {
        throw new Error('リポジトリの検索に失敗しました。');
      }
      const data = await response.json();
      setSearchResults(data.items || []);
      setShowResults(true);
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 検索クエリが変更されたときの処理
   */
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchRepositories(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  /**
   * 検索結果の外側をクリックしたときに結果を非表示にする
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * リポジトリを選択したときの処理
   * 
   * @param repo - 選択されたリポジトリ
   */
  const handleRepoSelect = (repo: RepoSearchResult) => {
    setRepoUrl(repo.html_url);
    setSearchQuery('');
    setShowResults(false);
  };

  /**
   * フォームを送信したときの処理
   * 
   * @param e - フォームイベント
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onSubmit(repoUrl, depth);
    }
  };

  /**
   * 深度を増やす
   */
  const increaseDepth = () => {
    if (depth < 10) {
      setDepth(depth + 1);
    }
  };

  /**
   * 深度を減らす
   */
  const decreaseDepth = () => {
    if (depth > 1) {
      setDepth(depth - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="GitHubリポジトリを検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="GitHubリポジトリ検索"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {searchResults.map((repo) => (
              <div
                key={repo.id}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleRepoSelect(repo)}
              >
                <img
                  src={repo.owner.avatar_url}
                  alt={`${repo.owner.login}のアバター`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <div className="font-medium">{repo.full_name}</div>
                  <div className="text-sm text-gray-500 truncate">{repo.description}</div>
                  <div className="text-xs text-gray-400">⭐ {repo.stargazers_count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="GitHub URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="GitHub URL"
        />

        <div className="flex items-center space-x-2">
          <span className="text-sm whitespace-nowrap">深さ:</span>
          <button
            type="button"
            onClick={decreaseDepth}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md"
            aria-label="深さを減らす"
          >
            -
          </button>
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="w-12 p-1 text-center border border-gray-300 rounded-md"
            min="1"
            max="10"
            aria-label="再帰的深さ"
          />
          <button
            type="button"
            onClick={increaseDepth}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md"
            aria-label="深さを増やす"
          >
            +
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !repoUrl.trim()}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading || !repoUrl.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
              <span>読み込み中...</span>
            </div>
          ) : (
            '読み込み'
          )}
        </button>
      </div>
    </form>
  );
} 