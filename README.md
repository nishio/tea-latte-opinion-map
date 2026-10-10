# 午後ティーの新作、あなたの「好き」はどこにある？

午後の紅茶 TEA LATTE 2商品の公開SNS投稿を、広聴AIで整理した個人制作のデモです。

収集1,485件 → 語による候補選別と文面重複除去後548件 → 原文照合・修正後377意見。
便宜抽出であり、世論・支持率・売上順位を推定するものではありません。キリンの公式企画ではありません。

- トップ：短い読みどころと軽量な意見の地図
- `report/`：広聴AIの標準公開ビューア
- `methodology.json`：選別条件、分析方法、公開前の修正と限界、読みどころの出典
- `data/reports/report.json`：公開用の要約・座標・群情報。原文全件、投稿者一覧、埋め込みは含みません。

## ソースと再現

分析と標準ビューアには [digitaldemocracy2030/kouchou-ai](https://github.com/digitaldemocracy2030/kouchou-ai/tree/c297bc97bb2bbce42964a90d7501c2d3592aeaf0) を使用しました。標準ビューアのソースコードはこの固定commitの `apps/public-viewer/`、共有型は `packages/report-schema/`、静的パッケージ処理は `apps/api/src/services/shell_export.py` です。標準ビューアのコードは変更していません。

[対応ソースの全アーカイブ](https://github.com/digitaldemocracy2030/kouchou-ai/archive/c297bc97bb2bbce42964a90d7501c2d3592aeaf0.tar.gz)

固定commitを取得し、Node.js 24 / pnpm 9.15.4で次を実行すると標準ビューアのシェルを作れます。

```bash
pnpm install --frozen-lockfile --ignore-scripts
NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH=/tea-latte-opinion-map pnpm --filter @kouchou-ai/public-viewer build:shell
```

`package_shell` で公開データを配置し、トップはこのリポジトリの `index.html` / `landing.css` / `landing.js` を使っています。元のAI概要は、対象範囲と読み方を伝える紹介文へ編集しました。トップの短い分類名も編集しています。生データは再配布していないため、分析入力の完全な再実行はこの公開リポジトリ単体ではできません。

## ライセンス・訂正

標準ビューアとこのサイトのコードはGNU AGPL v3に従います（`LICENSE`）。上流著作権表示を保持します。投稿に関する権利は各投稿者に帰属します。公開データはAI要約であり、誤りや削除済みリンクが含まれる可能性があります。訂正・除外の連絡はこのリポジトリのIssueへお願いします。
