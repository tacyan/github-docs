/**
 * GitHubリポジトリ情報取得API
 * 
 * このAPIはGitHubリポジトリの情報を取得し、JSON形式で返します。
 * 主な機能:
 * - リポジトリの基本情報取得
 * - コントリビューター情報取得
 * - ファイルツリー取得
 * - ファイル内容取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  parseRepoUrl, 
  getDefaultBranch, 
  getRepositoryInfo, 
  getRepositoryContributors,
  getRepoTree,
  getFileContent
} from '@/lib/github/api';
import { buildFileTree, shouldIgnore } from '@/lib/github/fileUtils';

/**
 * リポジトリ情報を取得するAPI
 * 
 * @param request - リクエスト
 * @returns レスポンス
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoUrl = searchParams.get('url');
  
  if (!repoUrl) {
    return NextResponse.json(
      { error: 'リポジトリURLが指定されていません。' },
      { status: 400 }
    );
  }
  
  try {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: '無効なGitHub URLです。' },
        { status: 400 }
      );
    }
    
    const defaultBranch = await getDefaultBranch(repoInfo);
    const repoDetails = await getRepositoryInfo(repoUrl);
    const contributors = await getRepositoryContributors(repoUrl, 10);
    
    return NextResponse.json({
      repoInfo,
      defaultBranch,
      repoDetails,
      contributors
    });
  } catch (error) {
    console.error('リポジトリ情報の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'リポジトリ情報の取得に失敗しました。' },
      { status: 500 }
    );
  }
}

/**
 * リポジトリ情報を取得するPOST API
 * 
 * @param request - リクエスト
 * @returns レスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, ignorePatterns = [], maxDepth = -1 } = body;
    
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'リポジトリURLが指定されていません。' },
        { status: 400 }
      );
    }
    
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: '無効なGitHub URLです。' },
        { status: 400 }
      );
    }
    
    const defaultBranch = await getDefaultBranch(repoInfo);
    const tree = await getRepoTree(repoInfo, defaultBranch);
    
    // 最大深度の設定
    const effectiveMaxDepth = maxDepth === -1 ? -1 : maxDepth;
    
    // ファイルツリーの構築
    const fileTree = buildFileTree(tree, ignorePatterns, effectiveMaxDepth);
    
    return NextResponse.json({
      repoInfo,
      defaultBranch,
      fileTree
    });
  } catch (error) {
    console.error('リポジトリ情報の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'リポジトリ情報の取得に失敗しました。' },
      { status: 500 }
    );
  }
} 