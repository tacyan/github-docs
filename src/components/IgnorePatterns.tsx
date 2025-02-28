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
 * デフォルトの.GithubDocsignoreパターン
 */
const defaultDocsIgnorePatterns = [
  '# Byte-compiled / optimized / DLL files',
  '__pycache__/',
  '*.py[cod]',
  '*$py.class',
  '',
  '# C extensions',
  '*.so',
  '',
  '# Distribution / packaging',
  '.Python',
  '',
  '# Node.js dependencies',
  'package-lock.json',
  'node_modules/',
  '',
  'build/',
  'develop-eggs/',
  'dist/',
  'downloads/',
  'eggs/',
  '.eggs/',
  'lib/',
  'lib64/',
  'parts/',
  'sdist/',
  'var/',
  'wheels/',
  'share/python-wheels/',
  '*.egg-info/',
  '.installed.cfg',
  '*.egg',
  'MANIFEST',
  '',
  '# PyInstaller',
  '#  Usually these files are written by a python script from a template',
  '#  before PyInstaller builds the exe, so as to inject date/other infos into it.',
  '*.manifest',
  '*.spec',
  '',
  '# Installer logs',
  'pip-log.txt',
  'pip-delete-this-directory.txt',
  '',
  '# Unit test / coverage reports',
  'htmlcov/',
  '.tox/',
  '.nox/',
  '.coverage',
  '.coverage.*',
  '.cache',
  'nosetests.xml',
  'coverage.xml',
  '*.cover',
  '*.py,cover',
  '.hypothesis/',
  '.pytest_cache/',
  'cover/',
  '',
  '# Translations',
  '*.mo',
  '*.pot',
  '',
  '# Django stuff:',
  '*.log',
  'local_settings.py',
  'db.sqlite3',
  'db.sqlite3-journal',
  '',
  '# Flask stuff:',
  'instance/',
  '.webassets-cache',
  '',
  '# Scrapy stuff:',
  '.scrapy',
  '',
  '# Sphinx documentation',
  'docs/_build/',
  '',
  '# PyBuilder',
  '.pybuilder/',
  'target/',
  '',
  '# Jupyter Notebook',
  '.ipynb_checkpoints',
  '',
  '# IPython',
  'profile_default/',
  'ipython_config.py',
  '',
  '# pyenv',
  '#   For a library or package, you might want to ignore these files since the code is',
  '#   intended to run in multiple environments; otherwise, check them in:',
  '# .python-version',
  '',
  '# pipenv',
  '#   According to pypa/pipenv#598, it is recommended to include Pipfile.lock in version control.',
  '#   However, in case of collaboration, if having platform-specific dependencies or dependencies',
  '#   having no cross-platform support, pipenv may install dependencies that don\'t work, or not',
  '#   install all needed dependencies.',
  '#Pipfile.lock',
  '',
  '# poetry',
  '#   Similar to Pipfile.lock, it is generally recommended to include poetry.lock in version control.',
  '#   This is especially recommended for binary packages to ensure reproducibility, and is more',
  '#   commonly ignored for libraries.',
  '#   https://python-poetry.org/docs/basic-usage/#commit-your-poetrylock-file-to-version-control',
  '#poetry.lock',
  '',
  '# pdm',
  '#   Similar to Pipfile.lock, it is generally recommended to include pdm.lock in version control.',
  '#pdm.lock',
  '#   pdm stores project-wide configurations in .pdm.toml, but it is recommended to not include it',
  '#   in version control.',
  '#   https://pdm.fming.dev/#use-with-ide',
  '.pdm.toml',
  '',
  '# PEP 582; used by e.g. github.com/David-OConnor/pyflow and github.com/pdm-project/pdm',
  '__pypackages__/',
  '',
  '# Celery stuff',
  'celerybeat-schedule',
  'celerybeat.pid',
  '',
  '# SageMath parsed files',
  '*.sage.py',
  '',
  '# Environments',
  '.env',
  '.venv',
  'env/',
  'venv/',
  'ENV/',
  'env.bak/',
  'venv.bak/',
  '',
  '# Spyder project settings',
  '.spyderproject',
  '.spyproject',
  '',
  '# Rope project settings',
  '.ropeproject',
  '',
  '# mkdocs documentation',
  '/site',
  '',
  '# mypy',
  '.mypy_cache/',
  '.dmypy.json',
  'dmypy.json',
  '',
  '# Pyre type checker',
  '.pyre/',
  '',
  '# pytype static type analyzer',
  '.pytype/',
  '',
  '# Cython debug symbols',
  'cython_debug/',
  '',
  '# PyCharm',
  '#  JetBrains specific template is maintained in a separate JetBrains.gitignore that can',
  '#  be found at https://github.com/github/gitignore/blob/main/Global/JetBrains.gitignore',
  '#  and can be added to the global gitignore or merged into this file.  For a more nuclear',
  '#  option (not recommended) you can uncomment the following to ignore the entire idea folder.',
  '#.idea/',
  '',
  'SourceSageAssets',
  '',
  '.git',
  '.CodeLumiaignore',
  '.gitattributes',
  '.gitignore',
  'LICENSE',
  '.github',
  '*.png',
  '*.jpg',
  '*.ipynb',
  '*.sqlite',
  '*.jpg',
  'requirements.txt',
  'LICENSE*',
  '*.zip',
  'environment.yml',
  '*.svg',
  '*.jpeg',
  '*.gif'
];

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
  // 初期値が空の場合はデフォルトのパターンを使用
  const [docsPatterns, setDocsPatterns] = useState<string[]>(
    initialDocsPatterns.length > 0 ? initialDocsPatterns : defaultDocsIgnorePatterns
  );
  const [sourcePatterns, setSourcePatterns] = useState<string[]>(initialSourcePatterns);
  const [docsText, setDocsText] = useState(
    initialDocsPatterns.length > 0 ? initialDocsPatterns.join('\n') : defaultDocsIgnorePatterns.join('\n')
  );
  const [sourceText, setSourceText] = useState(initialSourcePatterns.join('\n'));

  /**
   * 初期値が変更されたときの処理
   */
  useEffect(() => {
    // 初期値が空でない場合のみ更新
    if (initialDocsPatterns.length > 0) {
      setDocsPatterns(initialDocsPatterns);
      setDocsText(initialDocsPatterns.join('\n'));
    }
    
    setSourcePatterns(initialSourcePatterns);
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

  /**
   * ENTERキーが押されたときの処理
   * 最終行が空でない場合は改行を追加する
   * 
   * @param e - キーボードイベント
   * @param textValue - 現在のテキスト値
   * @param setText - テキスト設定関数
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    textValue: string,
    setText: (value: string) => void
  ) => {
    // ENTERキーが押された場合
    if (e.key === 'Enter') {
      const lines = textValue.split('\n');
      const lastLine = lines[lines.length - 1];
      
      // テキストエリア要素への参照を保存
      const textareaElement = e.currentTarget;
      
      // 最終行が空でない場合
      if (lastLine.trim() !== '') {
        // カーソル位置を取得
        const cursorPosition = textareaElement.selectionStart;
        
        // カーソルが最終行の末尾にある場合のみ処理
        if (cursorPosition === textValue.length) {
          e.preventDefault(); // デフォルトの改行動作を防止
          
          // 改行を追加
          const newText = textValue + '\n';
          setText(newText);
          
          // 次のレンダリング後にカーソル位置を設定
          setTimeout(() => {
            // テキストエリアの要素を取得して、カーソル位置を設定
            if (textareaElement) {
              textareaElement.selectionStart = newText.length;
              textareaElement.selectionEnd = newText.length;
              textareaElement.focus();
              
              // スクロール位置を最終行に合わせる
              textareaElement.scrollTop = textareaElement.scrollHeight;
            }
          }, 0);
        } else {
          // カーソルが最終行の末尾にない場合は、カーソルを最終行に移動
          e.preventDefault(); // デフォルトの改行動作を防止
          
          // 次のレンダリング後にカーソル位置を設定
          setTimeout(() => {
            if (textareaElement) {
              textareaElement.selectionStart = textValue.length;
              textareaElement.selectionEnd = textValue.length;
              textareaElement.focus();
              
              // スクロール位置を最終行に合わせる
              textareaElement.scrollTop = textareaElement.scrollHeight;
            }
          }, 0);
        }
      } else {
        // 最終行が空の場合でも、カーソルを最終行に移動
        e.preventDefault(); // デフォルトの改行動作を防止
        
        // 次のレンダリング後にカーソル位置を設定
        setTimeout(() => {
          if (textareaElement) {
            textareaElement.selectionStart = textValue.length;
            textareaElement.selectionEnd = textValue.length;
            textareaElement.focus();
            
            // スクロール位置を最終行に合わせる
            textareaElement.scrollTop = textareaElement.scrollHeight;
          }
        }, 0);
      }
    }
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
              必要に応じて追加のパターンを入力してください。
            </p>
            <textarea
              value={docsText}
              onChange={handleDocsTextChange}
              onKeyDown={(e) => handleKeyDown(e, docsText, setDocsText)}
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
              onKeyDown={(e) => handleKeyDown(e, sourceText, setSourceText)}
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