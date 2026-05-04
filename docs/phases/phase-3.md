# Phase 3

## 状態

- 仕様検討中
- Phase 2 までの時間モデルと URL 共有を維持したまま、pattern 編集時の補助操作を追加する

## 目的

`beatsPerLoop` や `stepsPerBeat` を変更したときに、現在の pattern を単に先頭から残すだけではなく、音楽的な意図に寄せた編集補助を与える。

ただし、共有 URL の正規化規則そのものは保守的に維持し、推測的な変換は明示的な UI 操作として分離する。

## 追加するもの

- `beatsPerLoop` を広げるときの `repeat` 系補助操作
- `stepsPerBeat` を変えるときの beat-relative な再配置補助操作
- pattern 編集補助を置く最小 UI

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- URL が共有状態の正本
- URL / state の正規化規則は保守的に維持する
- 推測を含む変換は明示的な編集操作として扱う
- 編集補助の有効 / 無効は、まずは URL に載せないローカル設定として扱う

## スコープ

- `beatsPerLoop` を増やすときに、既存 pattern を繰り返して拡張する補助操作を提供する
- `stepsPerBeat` を変えるときに、beat 基準の位置関係を保つ再配置操作を提供する
- 補助操作の結果は通常の URL state と同じ形に正規化される
- 編集補助は `Pattern` 周辺の UI から呼び出せる

## 非スコープ

- URL 読み込み時の自動推測変換
- `stepsPerBeat` / `beatsPerLoop` 変更時の暗黙的な自動複製
- probability, velocity, ratchet など step 情報の拡張
- pattern の複数保存
- per-track な変換ルールの個別最適化

## 編集補助の考え方

### URL / state 正規化との分離

- URL や state の通常正規化では、Phase 1 / Phase 2 と同じく推測的な再配置を行わない
- 補完が必要な領域は引き続き `0` で埋める
- 編集補助はユーザーが明示的に選んだ場合だけ適用する

### Extend With Repeat

- `beatsPerLoop` を増やしたいときの補助操作として扱う
- `beatsPerLoop` を増やしたときだけ効く
- 既存 loop を後方へ繰り返して、新しい長さへ pattern を広げる
- 例:
  - `4/4` の 1 loop を `4/8` へ広げるとき、前半 16 step を後半へ複製する
- 通常の値変更だけでは自動複製しない
- 明示操作の結果は通常の pattern 文字列へ落とし込む
- `beatsPerLoop` を小さくするときには適用しない

### Resample By Beat

- `stepsPerBeat` を変更したいときの補助操作として扱う
- `stepsPerBeat` を変更したときだけ効く
- 古い `step index` を前から残すのではなく、各音を beat 基準の位置へ写像する
- 再配置は少なくとも以下を満たす:
  - beat 番号は維持する
  - beat 内の相対位置を、新しい `stepsPerBeat` に応じて近い位置へ写す
- 例:
  - `stepsPerBeat=4` から `8` へ変えるとき、旧 beat 内 step `0,1,2,3` は新 beat 内 step `0,2,4,6` へ対応づける
- 写像は beat ごとに行い、少なくとも以下のような考え方で扱う:
  - `beatIndex = floor(step / oldStepsPerBeat)`
  - `offsetInBeat = step % oldStepsPerBeat`
  - `newOffsetInBeat = round(offsetInBeat * newStepsPerBeat / oldStepsPerBeat)`
  - `newOffsetInBeat` は `0` 以上 `newStepsPerBeat - 1` 以下へ clamp する
  - `newStep = beatIndex * newStepsPerBeat + newOffsetInBeat`
- 細かい step から粗い step へ寄せるときも、上記の round による近い位置への再配置として扱う
- 重なりが起きても停止せず、同一 step への集約として `1` 扱いにする

## UI 方針

- 補助操作は `Pattern` 周辺にまとめる
- 通常の値変更と、推測を含む変換操作は見分けがつくようにする
- `stepsPerBeat` / `beatsPerLoop` の単純な変更だけでは、既存 pattern を暗黙変換しない
- `Extend With Repeat` と `Resample By Beat` は、何が起きるかを短い文言で添える
- 補助操作は URL 正規化の代替ではなく、編集体験を助けるローカル操作として見せる
- 補助操作の有効 / 無効は、まずはチェックボックスなどのローカル UI で切り替えられる形を想定してよい
- 補助設定の永続化方法は今すぐ固定せず、必要なら後で検討する

## 想定する最小 UI

- `Pattern Tools`
  - `Extend With Repeat`
    - 現在の loop を繰り返して pattern を広げる
  - `Resample By Beat`
    - `stepsPerBeat` の変更に合わせて beat 基準で pattern を再配置する

## 完了条件

- `beatsPerLoop` を広げる補助操作で、既存 loop を繰り返して pattern を拡張できる
- `stepsPerBeat` 変更用の補助操作で、beat 基準の位置関係を保った再配置ができる
- 補助操作の結果が通常の URL state と同じ形に正規化される
- 通常の URL 読み込みや値変更だけでは、推測的な自動変換を行わない
