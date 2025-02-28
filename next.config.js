/**
 * Next.js設定ファイル
 * 
 * このファイルはNext.jsアプリケーションの設定を定義します。
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // ビルド時のESLintチェックを無効化
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時の型チェックを無効化
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig; 