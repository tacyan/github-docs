/**
 * GitHub API操作ライブラリ
 * 
 * このモジュールはGitHubのAPIを使用してリポジトリ情報の取得、ファイル内容の取得、
 * ツリー構造の取得などの機能を提供します。
 * 
 * @module github/api
 */

import { Octokit } from 'octokit';
import axios from 'axios';

// Octokitインスタンスの作成（認証なし）
const octokit = new Octokit();

/**
 * リポジトリ情報の型定義
 */
export interface RepoInfo {
  owner: string;
  repo: string;
  branch?: string;
}

/**
 * リポジトリの詳細情報の型定義
 */
export interface RepoDetails {
  名前: string;
  説明: string;
  所有者: string;
  言語: string;
  ライセンス: string;
  作成日: string;
  最終更新日: string;
  スター数: number;
  フォーク数: number;
  ウォッチャー数: number;
  オープンイシュー数: number;
  デフォルトブランチ: string;
  言語詳細?: Record<string, number>;
}

/**
 * コントリビューター情報の型定義
 */
export interface Contributor {
  ユーザー名: string;
  コントリビューション数: number;
  アバターURL: string;
  プロフィールURL: string;
}

/**
 * ファイルツリーのアイテム型定義
 */
export interface TreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

/**
 * URLからリポジトリ情報を抽出する
 * 
 * @param url - GitHubリポジトリのURL
 * @returns リポジトリ情報オブジェクト
 */
export function parseRepoUrl(url: string): RepoInfo | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match ? { owner: match[1], repo: match[2].replace('.git', '') } : null;
}

/**
 * リポジトリのデフォルトブランチを取得する
 * 
 * @param repoInfo - リポジトリ情報
 * @returns デフォルトブランチ名
 */
export async function getDefaultBranch(repoInfo: RepoInfo): Promise<string> {
  try {
    const { data } = await octokit.rest.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo
    });
    return data.default_branch;
  } catch (error) {
    console.error('デフォルトブランチの取得に失敗しました:', error);
    throw new Error('リポジトリ情報の取得に失敗しました。');
  }
}

/**
 * リポジトリの詳細情報を取得する
 * 
 * @param repoUrl - GitHubリポジトリのURL
 * @returns リポジトリの詳細情報
 */
export async function getRepositoryInfo(repoUrl: string): Promise<RepoDetails> {
  const repoInfo = parseRepoUrl(repoUrl);
  if (!repoInfo) {
    throw new Error('無効なGitHub URLです。');
  }

  try {
    // リポジトリの基本情報を取得
    const { data: repo } = await octokit.rest.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo
    });

    // 言語の詳細情報を取得
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner: repoInfo.owner,
      repo: repoInfo.repo
    });

    // 日付のフォーマット
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ja-JP');
    };

    return {
      名前: repo.name,
      説明: repo.description || '説明なし',
      所有者: repo.owner.login,
      言語: repo.language || '不明',
      ライセンス: repo.license?.name || 'ライセンス情報なし',
      作成日: formatDate(repo.created_at),
      最終更新日: formatDate(repo.updated_at),
      スター数: repo.stargazers_count,
      フォーク数: repo.forks_count,
      ウォッチャー数: repo.subscribers_count,
      オープンイシュー数: repo.open_issues_count,
      デフォルトブランチ: repo.default_branch,
      言語詳細: Object.keys(languages).length > 0 ? languages : undefined
    };
  } catch (error) {
    console.error('リポジトリ情報の取得に失敗しました:', error);
    throw new Error('リポジトリ情報の取得に失敗しました。');
  }
}

/**
 * リポジトリのコントリビューター情報を取得する
 * 
 * @param repoUrl - GitHubリポジトリのURL
 * @param maxContributors - 取得する最大コントリビューター数
 * @returns コントリビューター情報の配列
 */
export async function getRepositoryContributors(
  repoUrl: string, 
  maxContributors: number = 10
): Promise<Contributor[]> {
  const repoInfo = parseRepoUrl(repoUrl);
  if (!repoInfo) {
    throw new Error('無効なGitHub URLです。');
  }

  try {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      per_page: maxContributors
    });

    return contributors.map(contributor => ({
      ユーザー名: contributor.login,
      コントリビューション数: contributor.contributions,
      アバターURL: contributor.avatar_url,
      プロフィールURL: contributor.html_url
    }));
  } catch (error) {
    console.error('コントリビューター情報の取得に失敗しました:', error);
    throw new Error('コントリビューター情報の取得に失敗しました。');
  }
}

/**
 * リポジトリのファイルツリーを取得する
 * 
 * @param repoInfo - リポジトリ情報
 * @param branch - ブランチ名
 * @returns ファイルツリー
 */
export async function getRepoTree(
  repoInfo: RepoInfo, 
  branch: string
): Promise<TreeItem[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      tree_sha: branch,
      recursive: '1'
    });
    
    return data.tree;
  } catch (error) {
    console.error('リポジトリツリーの取得に失敗しました:', error);
    throw new Error('リポジトリの内容を取得できませんでした。');
  }
}

/**
 * ファイルの内容を取得する
 * 
 * @param repoInfo - リポジトリ情報
 * @param filePath - ファイルパス
 * @param branch - ブランチ名
 * @returns ファイルの内容
 */
export async function getFileContent(
  repoInfo: RepoInfo,
  filePath: string,
  branch: string
): Promise<string> {
  try {
    const url = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/${branch}/${filePath}`;
    
    // JSONファイルの場合は特別な処理を行う
    if (filePath.endsWith('.json')) {
      // responseTypeを'text'に設定して生のテキストを取得
      const response = await axios.get(url, { responseType: 'text' });
      return response.data;
    } else {
      const response = await axios.get(url);
      
      // レスポンスがオブジェクトの場合は文字列化
      if (typeof response.data === 'object' && response.data !== null) {
        return JSON.stringify(response.data, null, 2);
      }
      
      return response.data;
    }
  } catch (error) {
    console.error(`ファイル内容の取得に失敗しました (${filePath}):`, error);
    throw new Error(`ファイルの取得に失敗しました: ${filePath}`);
  }
} 