/**
 * ファイルツリー表示コンポーネント
 * 
 * このコンポーネントはリポジトリのファイル構造をツリー形式で表示します。
 * ディレクトリの展開/折りたたみ機能も含まれています。
 * 
 * @module components/FileTree
 */

'use client';

import { useState } from 'react';
import { FileTree as FileTreeType } from '@/lib/github/fileUtils';

/**
 * ファイルツリーアイテムのプロパティ
 */
interface FileTreeItemProps {
  item: FileTreeType;
  depth: number;
  onFileClick?: (path: string) => void;
}

/**
 * ファイルツリーのプロパティ
 */
interface FileTreeProps {
  tree: FileTreeType[];
  onFileClick?: (path: string) => void;
}

/**
 * ファイルツリーアイテムコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns ファイルツリーアイテムのJSX要素
 */
function FileTreeItem({ item, depth, onFileClick }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isDirectory = item.type === 'dir';
  const hasChildren = isDirectory && item.children && item.children.length > 0;
  const name = item.path.split('/').pop() || '';

  /**
   * アイテムをクリックしたときの処理
   */
  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else if (onFileClick) {
      onFileClick(item.path);
    }
  };

  /**
   * ファイルの種類に基づいてアイコンを取得する
   * 
   * @returns アイコンのJSX要素
   */
  const getIcon = () => {
    if (isDirectory) {
      return isExpanded ? '📂' : '📁';
    }

    // ファイル拡張子に基づいてアイコンを決定
    const extension = name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '📄 JS';
      case 'html':
      case 'htm':
        return '📄 HTML';
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return '📄 CSS';
      case 'json':
        return '📄 JSON';
      case 'md':
        return '📄 MD';
      case 'py':
        return '📄 PY';
      case 'java':
        return '📄 JAVA';
      case 'c':
      case 'cpp':
      case 'h':
        return '📄 C/C++';
      case 'go':
        return '📄 GO';
      case 'rb':
        return '📄 RB';
      case 'php':
        return '📄 PHP';
      case 'sh':
      case 'bash':
        return '📄 SH';
      case 'yml':
      case 'yaml':
        return '📄 YAML';
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 rounded-md ${
          !isDirectory && 'hover:bg-gray-100 cursor-pointer'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-2">{getIcon()}</span>
        <span className={`${isDirectory ? 'font-medium' : ''}`}>{name}</span>
        {hasChildren && (
          <button
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {item.children!.map((child, index) => (
            <FileTreeItem
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ファイルツリーコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns ファイルツリーのJSX要素
 */
export default function FileTree({ tree, onFileClick }: FileTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * ツリーをフィルタリングする
   * 
   * @param items - ファイルツリーアイテムの配列
   * @param term - 検索語
   * @returns フィルタリングされたファイルツリーアイテムの配列
   */
  const filterTree = (items: FileTreeType[], term: string): FileTreeType[] => {
    if (!term) return items;

    return items
      .map(item => {
        if (item.path.toLowerCase().includes(term.toLowerCase())) {
          return item;
        }

        if (item.children && item.children.length > 0) {
          const filteredChildren = filterTree(item.children, term);
          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren
            };
          }
        }

        return null;
      })
      .filter((item): item is FileTreeType => item !== null);
  };

  const filteredTree = filterTree(tree, searchTerm);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="ファイルを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="ファイル検索"
        />
      </div>

      <div className="p-2 max-h-96 overflow-y-auto">
        {filteredTree.length > 0 ? (
          filteredTree.map((item, index) => (
            <FileTreeItem
              key={`${item.path}-${index}`}
              item={item}
              depth={0}
              onFileClick={onFileClick}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? '一致するファイルがありません。' : 'ファイルがありません。'}
          </div>
        )}
      </div>
    </div>
  );
} 