# codex-handoff.md

## 今回の作業対象

今回は **Phase 0** を実装する。  
最終目標はシーケンサーだが、いきなり pattern / kit / 3トラック UI は作らない。

まずは **メトロノームだけで時間モデルを検証する**。

この Phase 0 は捨て実装ではない。  
後の Phase 1 以降に接続できる土台として作る。

---

## 最終的に目指しているもの

- Webブラウザで動くシーケンサー
- スマホでも動く
- 再生中の通信はしない
- URL を共有することで各端末が同じ記述を読む
- `startAt` を基準に各端末がローカルで再生位置を計算する
- 将来的に `pattern` と `kit` を URL に載せる
- QRコードは URL の配布手段として使う

ただし今回は、そこへ到達する前段階として、時間モデルだけ検証する。

---

## Phase 0 の目的

確認したいのは以下。

1. `startAt` 基準の時間モデルが破綻しないか
2. 同じ URL を複数端末で開いたとき、近い拍位置になるか
3. BPM変更時に `startAt` を逆算し直す方式が自然に動くか
4. Tone.js でスマホを含めて最低限安定するか
5. 後からシーケンサーへ拡張できる構造になっているか

---

## Phase 0 で実装するもの

- メトロノーム再生
- React UI
- Zustand store
- Tone.js によるクリック音
- BPM 入力
- stepsPerBeat 入力
- swing 入力
- 再生 / 停止
- 現在位置の簡易表示
- URL からの state 復元
- state 変更時の URL 更新

---

## Phase 0 で実装しないもの

- pattern UI
- kit UI
- 3トラック UI
- QRコード表示
- URLコピーUIの作り込み
- デザイン作り込み
- 複雑な音色編集
- 複数ページ構成

---

## 技術

- React
- TypeScript
- Zustand
- Tone.js

---

## URL パラメーター

Phase 0 で使用するもの:

- `bpm`
- `stepsPerBeat`
- `swing`
- `startAt`

例:

`?bpm=120&stepsPerBeat=4&swing=0&startAt=1776412800000`

### 意味
- `bpm`: テンポ
- `stepsPerBeat`: 1拍あたりの分割数
- `swing`: 0 はストレート、0より大きい値は swing 有効
- `startAt`: 再生基準時刻（Unix time ミリ秒）

---

## URL 復元

- 初回ロード時に `location.search` を読む
- query param をパースして Zustand state を復元する

---

## URL 更新

- state が変化したら `history.replaceState()` で URL を更新する
- `pushState()` は基本使わない
- 毎操作で履歴を増やさない

---

## startAt 方針

- `startAt` は時間モデルの中心
- `startAt` があれば、それを基準に現在位置を計算する
- `startAt` がない状態で再生開始したら、その時点の現在時刻を `startAt` に設定する
- `startAt` は URL に反映する
- `startAt` が過去でも、その時刻を基準に現在位置を計算してよい

---

## BPM 変更方針

- BPM変更は即時反映
- ただし現在の再生位相は維持する
- そのため `startAt` を逆算し直す
- 既存の先読み予約は捨てて再スケジュールする

---

## swing 方針

- `swing=0` はストレート
- `swing>0` は swing 有効
- UI から変更できてよい
- 後の Phase 1 でもこの表現を引き継ぐ

### 初期値
- `swing` の初期値は `0`

---

## 設計の希望

### Transport 層
- 絶対時刻から現在位置を計算する
- 音は鳴らさない
- `startAt`, `bpm`, `stepsPerBeat`, `swing` を扱う

### Scheduler / Engine 層
- Tone.js を使ってクリック音を鳴らす
- 先読みスケジューリングを行う
- React state に生インスタンスを深く持たない

### State 層
- Zustand を使う
- URL と相互変換しやすい値を持つ
- シリアライズ不能なオブジェクトは避ける

### UI 層
- 簡素でよい
- 検証重視

---

## Phase 0 のUI希望

最低限以下を置く。

- 再生ボタン
- 停止ボタン
- BPM入力
- stepsPerBeat入力
- swing入力
- 現在位置の表示
- 現在URLが確認できる状態

見た目の作り込みは不要。

---

## 将来を見越した前提

今回は実装しないが、後で以下を追加する想定なので、構造上は意識してほしい。

### 将来の URL パラメーター
- `loopLength`
- `kit`
- `pattern`

### 将来の kit / pattern 方針
- `kit` は URL 解釈ルール
- `pattern` は `_` 区切りの `0/1` 文字列群
- 互換性が壊れる kit 変更は別 ID にする

例:
`pattern=1000100010001000_0000100000001000_1010101010101010`

Phase 0 ではまだこれを実装しないが、後から足しやすい構造にしてほしい。

---

## 実装優先順位

1. Zustand store の最小構造
2. URL <-> state 変換
3. Transport の最小実装
4. Tone.js でのメトロノーム再生
5. BPM / swing / startAt 連動
6. UI
7. 検証しやすい表示の追加

---

## 期待すること

- Phase 0 を動く形で実装する
- 後からシーケンサーへ拡張しやすい構造にする
- 不要な機能を入れすぎない
- 時間モデルの検証を優先する

## 期待しないこと

- 完成版UI
- 3トラックシーケンサーの先行実装
- kit / pattern の本実装
- QRコードまわりの作り込み