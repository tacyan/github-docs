This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

このアプリケーションをVercelにデプロイするには、以下の手順に従ってください：

### 準備

1. [Vercelアカウント](https://vercel.com/signup)を作成します（まだ持っていない場合）
2. `.env.example`ファイルを参考に、必要な環境変数を設定します
3. GitHubリポジトリにコードをプッシュします

### デプロイ方法

#### GitHubからの自動デプロイ

1. [Vercelダッシュボード](https://vercel.com/dashboard)にログインします
2. 「New Project」をクリックします
3. GitHubリポジトリをインポートします
4. 環境変数を設定します（`.env.example`を参照）
5. 「Deploy」ボタンをクリックします

#### Vercel CLIを使用したデプロイ

1. Vercel CLIをインストールします：
   ```bash
   npm i -g vercel
   ```

2. プロジェクトディレクトリで以下のコマンドを実行します：
   ```bash
   vercel login
   vercel
   ```

3. 画面の指示に従って設定を完了します

### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

- `GITHUB_TOKEN`: GitHubのアクセストークン
- `NEXT_PUBLIC_API_URL`: APIのURL
- `NEXT_PUBLIC_APP_URL`: アプリケーションのURL
- `MAX_REPO_SIZE_MB`: 処理する最大リポジトリサイズ（MB）
- `MAX_FILE_SIZE_KB`: 処理する最大ファイルサイズ（KB）

詳細については[Next.jsデプロイドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。
