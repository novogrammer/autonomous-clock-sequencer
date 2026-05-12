# Phase 4

## 状態

- 実装完了
- Phase 3 までの時間モデル、URL 共有、pattern 編集補助を維持したまま、多トラック `kit` を追加する

## 目的

最小構成の `minimal` や `bass-fourths` だけではなく、より多くの track を持つ melodic / harmonic / drum 系の `kit` を導入し、同じ URL 共有モデルのまま多トラック構成がどこまで扱いやすいかを検証する。

## 追加するもの

- 多トラック `kit` の実装と比較用入口
- `note` 系、`chord` 系、`drum` 系の最小構成
- track 数が増えたときの UI / URL 長の確認項目

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- URL が共有状態の正本
- URL 圧縮は当面行わない
- 既存の `kit` と互換性のある `pattern` 形式を維持する

## スコープ

- track 数が 6 から 8 前後の `kit` を追加して使い勝手を確認する
- melodic 系では、まず半音を含まない `diatonic` な並びを優先する
- harmonic 系では、`1 track = 1 chord` の構成を優先する
- drum 系では、既存 4 track より多い構成を 1 つ追加する
- `kit` ごとの track 名、並び順、想定音域を定義する

## 非スコープ

- per-track velocity や chord inversion のような拡張
- chromatic note kit の本格対応
- 曲キーやモードを別 state として分離すること
- chord quality を URL 上で可変にすること
- URL 圧縮の導入

## 多トラック kit の考え方

### 既存 kit との関係

- `minimal` は最小ドラム構成として維持する
- `bass-fourths` は少トラック melodic kit として維持する
- 新しい多トラック `kit` は既存の入口を置き換えるのではなく、別系列として追加する

### note 系

- 最初の note 系は、半音を含まない `diatonic` な並びを優先する
- 1 track = 1 note として扱う
- まずは 1 オクターブ 7 track を基本候補とする
- chromatic は将来候補として残すが、最初の導入対象にはしない

#### 実装

- `diatonic-notes-c-major`
  - 7 tracks
  - `B4, A4, G4, F4, E4, D4, C4`
  - 上の `C` は含めず、`1 track = 1 degree` を優先する
  - 高音が上に来るよう、UI 上の並びと `pattern` 順を一致させる

### chord 系

- chord 系は、`1 track = 1 chord` として扱う
- chord tones を別 track へ分割する方式は最初の対象にしない
- まずはダイアトニックな triad を優先する
- 7th chord 系は triad 系と分けて別 kit として扱う

#### 実装

- `diatonic-triads-c-major`
  - 7 tracks
  - `Bdim, Am, G, F, Em, Dm, C`
  - triad を 1 track = 1 chord として扱う
- `diatonic-sevenths-c-major`
  - 将来候補
  - 7 tracks
  - `Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5`

### drum 系

- 既存の 4 track drum は最小構成として維持する
- 多トラック drum では、tom を含む 8 track 構成を先に試す
- `minimal` より drum set らしい入口を別 kit として追加する

#### 実装

- `drum-standard`
  - 8 tracks
  - `kick, snare, closed hat, open hat, clap, perc, low tom, high tom`
  - `minimal` を置き換えず、tom を含む別系統の drum kit として追加する
  - 初期 preset では closed/open hat の同時発音や fill 中の過密な重なりを避ける

## UI / URL 方針

- まずは 7 track 前後で、縦方向に増えた sequencer grid が読めるかを検証する
- track 数が増えても、pattern 形式自体は `_` 区切りのまま維持する
- 共有 URL の長さは browser より先に QR や共有体験で問題化しやすいので、初期候補は 8 track 前後に留める
- `kit` は当面、音色セットと track layout をまとめて持つ概念として扱ってよい
- track label は音楽表記を優先し、強制的な大文字変換は行わない

## 想定する最小 UI

- `kit` selector に多トラック候補を追加する
- track 名が増えても読める最小レイアウトを維持する
- `Example Score` と `Pattern Preset` に各 kit の入口を置く

## 現状メモ

- `diatonic-notes-c-major`
  - 7 track の note kit として追加済み
- `diatonic-triads-c-major`
  - 7 track の chord kit として追加済み
- `drum-standard`
  - 8 track の drum kit として追加済み
- 既存の URL / state 形式で 7-8 track の `pattern` を共有できることは確認済み
- 追加の比較用 preset や UI 密度確認は今後も継続できるが、Phase 4 の最小実装としては完了扱いにできる

## 完了条件

- `diatonic-notes-c-major` を試せる
- `diatonic-triads-c-major` を試せる
- `drum-standard` を試せる
- 多トラック kit でも既存の URL state と同じ形で共有できる
- track 数増加に対する UI と URL 長の課題を確認できる
