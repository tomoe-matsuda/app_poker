# app_poker 運用テンプレ

このプロジェクトは以下の流れで運用すると安全です。

## 1) 作業ブランチを作る

```bash
git checkout main
git pull origin main
git checkout -b feature/short-description
```

ブランチ名の例:
- `feature/login-ui`
- `fix/firebase-init`
- `chore/readme-update`

## 2) 実装してコミット

```bash
git add .
git commit -m "feat: 変更内容を短く書く"
```

コミットメッセージの例:
- `feat: add room creation form`
- `fix: handle missing firebase config`
- `chore: update docs for deployment`

## 3) GitHubへpush（Preview自動生成）

```bash
git push -u origin feature/short-description
```

push後、Vercelが自動でPreview URLを作成します。

## 4) Previewで確認

確認ポイント:
- 画面が正しく表示される
- Consoleエラーが出ない
- 主要機能が壊れていない
- スマホ表示でも崩れていない

## 5) PRを作成してmainへマージ

PRタイトル例:
- `feat: add room creation form`
- `fix: resolve firebase initialization error`

PR本文に最低限書く内容:
- 何を変更したか
- なぜ変更したか
- 確認したこと（Preview URLでの動作確認）

マージ後はVercelが本番を自動デプロイします。

## 6) 本番確認

本番URL（`*.vercel.app`）で以下を確認:
- 主要画面が開ける
- 重要操作ができる
- 致命的エラーがない

## トラブル時

- Build失敗時: Vercel `Deployments` -> 対象デプロイ -> `Build Logs` を確認
- 環境変数ミス: Vercel `Settings` -> `Environment Variables` を見直し
- 直前の状態に戻したい: 以前の成功デプロイを `Promote to Production`

## ルール（重要）

- `.env.local` はGitにコミットしない
- 秘密情報（APIキー等）を `NEXT_PUBLIC_` で公開しない
- 小さい変更でもPreviewで確認してからmainに入れる
