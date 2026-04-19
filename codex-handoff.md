# codex-handoff.md

## 現在の状態

このリポジトリは **Phase 0** として、メトロノームを中心に `startAt` 基準の時間モデルを検証している。

Phase 0 は実装済みで、以下が動く状態になっている。

- `startAt` 基準のメトロノーム再生
- BPM / stepsPerBeat / swing の操作
- BPM 変更時は `startAt` を維持したまま位置を再計算
- URL からの state 復元
- state 変更時の URL 更新
- Tone.js によるメトロノーム音
- playback calibration
- microphone measurement
- Vitest による純粋ロジックのテスト

直近の手元確認では、画面上の基本動作はぱっと見で動いている。

---

## 目指しているもの

最終的には、Web ブラウザで動く自律同期型シーケンサーを目指す。

- 再生中の通信はしない
- URL を共有することで各端末が同じ記述を読む
- 各端末は `startAt` を基準にローカルで現在位置を計算する
- 将来的に `pattern` と `kit` を URL に載せる
- QR コードは URL の配布手段として扱う

まだ pattern / kit / QR コードは実装していない。

---

## 技術

- React
- TypeScript
- Zustand
- Tone.js
- Vitest
- Vite

---

## 現在の構成

- `src/transport`: `startAt` 基準の時間計算
- `src/engine`: Tone.js / Web Audio を使う実行系
- `src/hooks`: React state と engine の接続、副作用管理
- `src/state`: Zustand store
- `src/url`: Phase 0 URL の parse / build
- `src/calibration`: calibration 表示用の純粋ロジック
- `src/measurement`: measurement 表示用の純粋ロジック
- `src/components`: UI

責務分離の方針として、React / Zustand 側には Tone.js や AudioNode の実行オブジェクトを持たせない。実行系は `engine`、React との接続は `hooks` に寄せている。

---

## 重要な設計メモ

### `startAt`

- `startAt` は共有 URL に載る絶対時刻
- Unix time ミリ秒で扱う
- 再生位置は `startAt` と現在時刻から都度計算する
- `startAt` が過去でも、その値を基準に現在位置を計算してよい

### `playbackOffsetMs`

- `playbackOffsetMs` は端末ごとのローカル再生補正値
- URL には載せない
- `startAt` に混ぜない
- 音声スケジューリングと表示確認にだけ使う

### BPM 変更

- BPM 変更は即時反映する
- `startAt` は再計算しない
- Unix time 基準の共有グリッドを優先する
- 操作した端末の現在位相維持より、同じ URL の各端末で同じグリッドになることを優先する

### URL 更新

- 通常の URL 更新は `history.replaceState()` を使う
- `pushState()` は基本使わない
- 操作ごとに履歴を増やさない

---

## Phase 0 の URL パラメーター

現在使うもの:

- `bpm`
- `stepsPerBeat`
- `swing`
- `startAt`

例:

```text
?bpm=120&stepsPerBeat=4&swing=0&startAt=1776412800000
```

将来使う想定のもの:

- `loopLength`
- `kit`
- `pattern`

---

## 将来の kit / pattern 方針

まだ実装しないが、以下を前提にしている。

- `kit` は URL の解釈ルール
- `kit` はトラック数、トラック順、各トラックの意味を定義する
- 互換性が壊れる kit 変更は別 ID にする
- `pattern` は 1 つの文字列
- 各トラックは kit で定義された順番に並ぶ
- 各トラックは `0/1` 文字列
- 区切りは `_`

例:

```text
pattern=1000100010001000_0000100000001000_1010101010101010
```

pattern 読み込み時は、足りなければ補完、長すぎれば切り捨て、不正文字は警告しつつ `0` 扱いにする。エラーで停止しない。

---

## テスト

実行:

```bash
npm test
```

現在のテスト対象:

- `src/transport/transport.test.ts`
  - `startAt` からの beat / step 計算
  - loop 内位置
  - BPM 変更時も `startAt` を変えない位置計算
  - swing による奇数 step 遅延

- `src/calibration/timeSignal.test.ts`
  - 10 秒境界の flash state
  - 通常秒の flash state
  - 120ms 以降の idle

- `src/measurement/measurementStats.test.ts`
  - 結果なし
  - 平均
  - 標準偏差

ビルド:

```bash
npm run build
```

---

## 直近で行った整理

- `MetronomePanel` の副作用を hooks に分離
- `PlaybackCalibrationPanel` の engine lifecycle を hook に分離
- `MicrophoneMeasurementPanel` の engine lifecycle と測定結果 state を hook に分離
- `Readout` を共通コンポーネント化
- calibration の時刻表示ロジックを `src/calibration` に分離
- measurement の統計計算を `src/measurement` に分離
- 数値入力の変更処理を名前付き handler に整理

---

## 次の候補

優先度が高いのは、追加リファクタリングより実機・ブラウザ確認。

確認したいこと:

1. メトロノームの再生・停止
2. BPM 変更時に `startAt` が変わらず、共有グリッド基準で位置が再計算されること
3. URL に `bpm`, `stepsPerBeat`, `swing`, `startAt` だけが共有対象として入ること
4. `playbackOffsetMs` が URL に混ざらないこと
5. playback calibration が blocked にならず開始・停止できること
6. microphone measurement がマイク許可後に ready になり、停止できること

その後の実装候補:

- Phase 0 の検証手順を README に追記する
- `loopLength` の扱いを state / URL に追加するか検討する
- Phase 1 として pattern / kit の最小 URL モデルを設計する
- QR コードは URL 配布手段として後で追加する

---

## まだやらないこと

- pattern UI
- kit UI
- 3トラックシーケンサー UI
- QR コード表示
- 複雑な音色編集
- 完成版としてのデザイン作り込み
