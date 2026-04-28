# Autonomous Clock Sequencer

Web ブラウザで動く、自律同期型シーケンサーの実験リポジトリです。

公開 URL:

https://novogrammer.github.io/autonomous-clock-sequencer/

## 現在の機能

- Unix epoch 基準で現在位置を計算する transport
- URL 共有によるシーケンス状態の復元
- `kit=minimal` の 4 トラック step シーケンサー
- `Sequencer` と `Metronome` の独立した on / off
- `beatsPerLoop`, `stepsPerBeat`, `swing`, `bpm` の編集
- `Clear Pattern`
- 共有 URL の QR コード表示
- 端末ごとの再生補正値 `playbackOffsetMs`

主に使う URL パラメーター:

- `bpm`
- `beatsPerLoop`
- `stepsPerBeat`
- `kit`
- `pattern`
- `swing`

例:

```text
?bpm=120&stepsPerBeat=4&beatsPerLoop=4&kit=minimal&pattern=1000100010001000_0000100000001000_1010101010101010_0000000010000000&swing=0
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

## 構成

- `src/transport`: Unix epoch 基準の時間計算
- `src/engine`: Tone.js / Web Audio を使う実行系
- `src/kit`: kit 定義と再生仕様
- `src/pattern`: pattern 編集と解釈
- `src/hooks`: React state と engine の接続、副作用管理
- `src/state`: Zustand store
- `src/url`: sequencer URL の parse / build
- `src/calibration`: calibration 表示用の純粋ロジック
- `src/measurement`: measurement 表示用の純粋ロジック
- `src/components`: UI
- `docs`: 仕様と Phase 文書

## メモ

共有 URL を別タブや別ブラウザで開くと、Unix epoch 基準の同じ再生位置を計算できます。

再生位置は Unix epoch から続く共通グリッドとして計算します。端末ごとの音声出力遅延を補正する `playbackOffsetMs` は URL には載せず、ローカルの音声スケジューリングと表示確認にだけ使います。

ただしブラウザの autoplay 制限により、音声はユーザー操作なしでは開始できません。URL から開いたタブでは `Sequencer On` または `Metronome On` を押すと、現在位置に合わせて音が合流します。

## ドキュメント

- 全体概要: `docs/overview.md`
- 時間モデル: `docs/spec/time-model.md`
- URL / state 仕様: `docs/spec/url-state.md`
- Phase 0: `docs/phases/phase-0.md`
- Phase 1: `docs/phases/phase-1.md`

## 今後

- `kit` の追加
- pattern 編集操作の拡張
- URL 共有 UI の改善
- 仕様を崩さない範囲でのシーケンサー機能拡張
