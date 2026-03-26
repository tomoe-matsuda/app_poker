# プレミアム Notion 連携 — 設計メモ

## 目的

- **プレミアム**: カード決済（Stripe）で利用権を付与し、**Notion OAuth** によりアクセストークンを **httpOnly Cookie** に保存。
- **公開時の UI**: デフォルトは **近日公開モード**（`NEXT_PUBLIC_PREMIUM_NOTION_LIVE` 未設定 or `false`）。ルームの Notion モーダルは説明と `/premium/notion` への導線が中心。
- **先行検証**: `NEXT_PUBLIC_PREMIUM_NOTION_LIVE=true` でルーム内に OAuth・一覧取得 UI を表示。

## 利用者フロー（リリース後想定）

1. `/pricing` でプレミアムに申し込み → Stripe Checkout。
2. `/premium/success` で `session_id` 検証 → `dsp_premium` Cookie。
3. ルームで Notion連携 → OAuth → `notion_oat` Cookie → DB 取得 → 投票 → OAuth で Notion 数値列を更新。

## 環境変数

| 変数 | 用途 |
|------|------|
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` | Checkout |
| `NOTION_OAUTH_*` | OAuth |
| `NEXT_PUBLIC_PREMIUM_NOTION_LIVE` | `true` でルーム内の本番連携 UI を表示 |
| `NEXT_PUBLIC_PREMIUM_REQUIRED_FOR_NOTION` | `true` で未課金はアップグレードのみ |

## セキュリティ

- 本番では **Stripe Webhook** でサブスク状態を同期し、解約時にプレミアム Cookie を無効化することを推奨。

## 関連ルート

- `/premium/notion` … 近日公開の説明（検索インデックス向けに `robots: index`）
- `/api/notion/oauth/*` … authorize / callback / list / set-points / logout

（旧・ブラウザにシークレットを保存する session API は廃止済み。）
