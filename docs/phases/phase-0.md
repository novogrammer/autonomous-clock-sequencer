# Phase 0

## 目的

メトロノームのみで時間モデルを検証する。

## スコープ

- メトロノーム再生
- `bpm`, `stepsPerBeat`, `swing` の URL 共有
- 絶対時刻基準での再生位置計算
- 再生中パラメータ変更時の即時反映
- playback calibration
- microphone measurement

## 主に使う URL パラメーター

- `bpm`
- `stepsPerBeat`
- `swing`

## UI 方針

- 検証しやすさを優先する
- 初期段階では見た目の作り込みより構造の明瞭さを重視する
- 画面上には Phase 名を表示しない

## 補助機能

- `playbackOffsetMs` を使った再生補正を行える
- playback calibration はメトロノーム本体とは別の補助機能として扱う
- microphone measurement は検証用の補助機能として扱う

## 完了条件

- メトロノームが絶対時刻基準で安定して再生される
- URL から `bpm`, `stepsPerBeat`, `swing` を復元できる
- URL 更新が `replaceState()` ベースで同期される
- BPM 変更時に既存の先読み予約を捨てて再スケジュールできる
