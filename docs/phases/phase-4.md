# Phase 4

## 状態

- 仕様検討中
- Phase 3 までの時間モデル、URL 共有、pattern 編集補助を維持したまま、多トラック `kit` を追加する

## 目的

最小構成の `minimal` や `bass-fourths` だけではなく、より多くの track を持つ melodic / harmonic / drum 系の `kit` を導入し、同じ URL 共有モデルのまま多トラック構成がどこまで扱いやすいかを検証する。

## 追加するもの

- 多トラック `kit` の候補整理
- `note` 系、`chord` 系、`drum` 系の最小構成
- track 数が増えたときの UI / URL 長の検証方針

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- URL が共有状態の正本
- URL 圧縮は当面行わない
- 既存の `kit` と互換性のある `pattern` 形式を維持する

## スコープ

- track 数が 6 から 8 前後の `kit` を追加候補として整理する
- melodic 系では、まず半音を含まない `diatonic` な並びを優先する
- harmonic 系では、`1 track = 1 chord` の構成を優先する
- drum 系では、既存 4 track より多い `basic` 構成を検討する
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

#### 候補

- `diatonic-notes-c-major`
  - 7 tracks
  - `C, D, E, F, G, A, B`

### chord 系

- chord 系は、`1 track = 1 chord` として扱う
- chord tones を別 track へ分割する方式は最初の対象にしない
- まずはダイアトニックな triad を優先する
- 7th chord 系は triad 系と分けて別 kit として扱う

#### 候補

- `diatonic-triads-c-major`
  - 7 tracks
  - `C, Dm, Em, F, G, Am, Bdim`
- `diatonic-sevenths-c-major`
  - 7 tracks
  - `Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5`

### drum 系

- 既存の 4 track drum は最小構成として維持する
- 多トラック drum では、まず 6 track 前後の `basic` 構成を優先する
- tom を含む 8 track 構成はその次の候補とする

#### 候補

- `drum-basic`
  - 6 tracks
  - `kick, snare, closed hat, open hat, clap, perc`
- `drum-extended`
  - 8 tracks
  - `kick, snare, closed hat, open hat, clap, perc, low tom, high tom`

## UI / URL 方針

- まずは 7 track 前後で、縦方向に増えた sequencer grid が読めるかを検証する
- track 数が増えても、pattern 形式自体は `_` 区切りのまま維持する
- 共有 URL の長さは browser より先に QR や共有体験で問題化しやすいので、初期候補は 8 track 前後に留める
- `kit` は当面、音色セットと track layout をまとめて持つ概念として扱ってよい

## 想定する最小 UI

- `kit` selector に多トラック候補を追加する
- track 名が増えても読める最小レイアウトを維持する
- 必要なら `Example Score` や `Pattern Preset` に多トラック kit 用の入口を追加する

## 完了条件

- 少なくとも 1 つの note 系多トラック kit を試せる
- 少なくとも 1 つの chord 系多トラック kit を試せる
- 少なくとも 1 つの drum 系多トラック kit を試せる
- 多トラック kit でも既存の URL state と同じ形で共有できる
- track 数増加に対する UI と URL 長の課題を確認できる
