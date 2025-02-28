/**
 * GitHubファイル内容取得API
 * 
 * このAPIはGitHubリポジトリのファイル内容を取得し、JSON形式で返します。
 * 主な機能:
 * - ファイル内容の取得
 * - ソースコード内の無視パターンに基づくフィルタリング
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseRepoUrl, getFileContent } from '@/lib/github/api';
import { shouldIgnore } from '@/lib/github/fileUtils';

/**
 * ファイル内容を取得するAPI
 * 
 * @param request - リクエスト
 * @returns レスポンス
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoUrl = searchParams.get('url');
  const filePath = searchParams.get('path');
  const branch = searchParams.get('branch') || 'main';
  
  if (!repoUrl) {
    return NextResponse.json(
      { error: 'リポジトリURLが指定されていません。' },
      { status: 400 }
    );
  }
  
  if (!filePath) {
    return NextResponse.json(
      { error: 'ファイルパスが指定されていません。' },
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
    
    const content = await getFileContent(repoInfo, filePath, branch);
    
    return NextResponse.json({
      filePath,
      content
    });
  } catch (error) {
    console.error(`ファイル内容の取得に失敗しました (${filePath}):`, error);
    return NextResponse.json(
      { error: `ファイル内容の取得に失敗しました: ${filePath}` },
      { status: 500 }
    );
  }
}

/**
 * ファイル内容を取得するPOST API（フィルタリング機能付き）
 * 
 * @param request - リクエスト
 * @returns レスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, filePath, branch = 'main', sourceIgnorePatterns = [] } = body;
    
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'リポジトリURLが指定されていません。' },
        { status: 400 }
      );
    }
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'ファイルパスが指定されていません。' },
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
    
    const content = await getFileContent(repoInfo, filePath, branch);
    
    // ソースコード内の無視パターンに一致する行をフィルタリング
    let filteredContent = content;
    if (sourceIgnorePatterns.length > 0) {
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !shouldIgnore(line, sourceIgnorePatterns));
      filteredContent = filteredLines.join('\n');
    }
    
    return NextResponse.json({
      filePath,
      content: filteredContent,
      originalContent: content
    });
  } catch (error) {
    console.error('ファイル内容の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'ファイル内容の取得に失敗しました。' },
      { status: 500 }
    );
  }
} 