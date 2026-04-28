# Phase 1

## 目的

最小の pattern 記述を URL で共有し、各端末が同じ絶対時刻基準で再生できることを確認する。

## 想定スコープ

- `loopLength` を導入する
- `pattern` を導入する
- `kit` を導入する
- 複数トラックの step 再生を行う
- URL から pattern を復元する

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- `bpm`, `stepsPerBeat`, `swing` は即時反映
- URL が共有状態の正本

## 最小構成案

- まずは 1 `kit` 固定でもよい
- 2 から 3 トラック程度
- `pattern` は `0/1` のみ
- step 入力は編集可能
- URL 変更で同じ pattern を復元できる

## UI 方針

- 画面上には Phase 名を表示しない
- 機能名だけを見せる
- メトロノーム専用画面ではなく、Sequencer へ拡張できる見せ方に寄せる
