/**
 * GitHubリポジトリのマークダウン生成API
 * 
 * このAPIはGitHubリポジトリの情報からマークダウン形式のドキュメントを生成します。
 * 主な機能:
 * - リポジトリ情報のマークダウン生成
 * - ファイルツリーのマークダウン生成
 * - ファイル内容のマークダウン生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  parseRepoUrl, 
  getDefaultBranch, 
  getRepositoryInfo, 
  getRepositoryContributors,
  getRepoTree
} from '@/lib/github/api';
import { buildFileTree } from '@/lib/github/fileUtils';
import { 
  generateRepositoryMarkdown,
  convertMarkdownToHtml
} from '@/lib/markdown/generator';

/**
 * マークダウンを生成するAPI
 * 
 * @param request - リクエスト
 * @returns レスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      repoUrl, 
      ignorePatterns = [], 
      sourceIgnorePatterns = [],
      maxDepth = -1,
      format = 'markdown' // 'markdown' または 'html'
    } = body;
    
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
    
    // リポジトリ情報の取得
    const defaultBranch = await getDefaultBranch(repoInfo);
    const repoDetails = await getRepositoryInfo(repoUrl);
    const contributors = await getRepositoryContributors(repoUrl, 10);
    const tree = await getRepoTree(repoInfo, defaultBranch);
    
    // 最大深度の設定
    const effectiveMaxDepth = maxDepth === -1 ? -1 : maxDepth;
    
    // ファイルツリーの構築
    const fileTree = buildFileTree(tree, ignorePatterns, effectiveMaxDepth);
    
    // マークダウンの生成
    const markdown = await generateRepositoryMarkdown(
      repoInfo,
      repoDetails,
      contributors,
      fileTree,
      defaultBranch,
      ignorePatterns,
      sourceIgnorePatterns
    );
    
    // フォーマットに応じて返却
    if (format === 'html') {
      const html = convertMarkdownToHtml(markdown);
      return NextResponse.json({ html, markdown });
    } else {
      return NextResponse.json({ markdown });
    }
  } catch (error) {
    console.error('マークダウンの生成に失敗しました:', error);
    return NextResponse.json(
      { error: 'マークダウンの生成に失敗しました。' },
      { status: 500 }
    );
  }
} 