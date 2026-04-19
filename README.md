# Autonomous Clock Sequencer

Web ブラウザで動く、自律同期型シーケンサーの実験リポジトリです。

現在は Phase 0 として、メトロノームだけで時間モデルを検証しています。

公開 URL:

https://novogrammer.github.io/autonomous-clock-sequencer/

## Phase 0

Phase 0 では、`startAt` を基準に現在位置を計算する最小構成を実装しています。

- React / TypeScript
- Zustand によるシリアライズしやすい state 管理
- Tone.js によるメトロノーム音
- URL パラメーターからの state 復元
- state 変更時の URL 更新
- BPM / stepsPerBeat / swing の操作
- 端末ごとの再生補正値 `playbackOffsetMs`

主に使う URL パラメーター:

- `bpm`
- `stepsPerBeat`
- `swing`
- `startAt`

例:

```text
?bpm=120&stepsPerBeat=4&swing=0&startAt=1776412800000
```

## 使い方

```bash
npm install
npm run dev
```

テスト:

```bash
npm test
```

ビルド:

```bash
npm run build
```

このリポジトリでは nodenv のローカルバージョンとして Node.js `22.16.0` を指定しています。

## メモ

共有 URL を別タブや別ブラウザで開くと、`startAt` を基準に再生位置は復元されます。

`startAt` は共有 URL に載る絶対時刻です。端末ごとの音声出力遅延を補正する `playbackOffsetMs` は URL には載せず、ローカルの音声スケジューリングと表示確認にだけ使います。

ただしブラウザの autoplay 制限により、音声はユーザー操作なしでは開始できません。URL から開いたタブでは `音声を有効化` を押すと、現在位置に合わせてメトロノーム音が合流します。

## 今後

Phase 0 では pattern / kit / QR コード表示などはまだ実装していません。

今後の Phase で、URL による pattern 共有や複数トラックのシーケンサーへ拡張する想定です。
