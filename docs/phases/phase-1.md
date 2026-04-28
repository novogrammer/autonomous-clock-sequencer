# Phase 1

## 目的

最小の pattern 記述を URL で共有し、各端末が同じ絶対時刻基準で再生できることを確認する。

## 追加するもの

- `beatsPerLoop` を導入する
- `pattern` を導入する
- `kit` を導入する
- 複数トラックの step 再生を行う
- URL から pattern を復元する

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- `bpm`, `stepsPerBeat`, `swing` は即時反映
- URL が共有状態の正本

## `stepsPerBeat` の位置付け

- `stepsPerBeat` は 1 拍あたりの step 数を表す
- Phase 1 では metronome 用の補助値ではなく、シーケンサーの時間グリッド定義として扱う
- `stepsPerBeat` は transport の step 計算、pattern の時間解釈、swing の適用単位に影響する
- 同じ pattern を同じ意味で共有するため、URL 共有対象に含める
- UI 上の見せ方は `stepsPerBeat` のままでもよいが、必要なら `Steps / Beat` や `Grid` のような表示名を検討してよい

## スコープ

- 単一ページ内で step シーケンサーを編集して再生できる
- URL を共有すれば、別端末でも同じ `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop`, `kit`, `pattern` を復元できる
- 各端末は現在の絶対時刻から再生位置を計算し、同じ pattern を同じ時間軸で再生する
- 最小の `kit` 定義に従って、複数トラックを Tone.js で鳴らす
- オプション機能としてメトロノーム click を併設できる

## 非スコープ

- 再生中通信
- URL 圧縮
- サーバー保存
- 複数 `kit` の高度な切り替え UI
- ステップごとの velocity や probability
- ミュート、ソロ、エフェクト、サンプル管理
- パターン複数保存
- メトロノーム click の共有同期設定

## 最小構成

- `kit` はまず 1 種類でもよい
- トラック数は 3 を基準とする
- `beatsPerLoop` は 4 を初期値とする
- `pattern` はトラックごとの `0/1` 文字列を `_` で連結した 1 文字列とする
- 各トラックの長さは `stepsPerBeat * beatsPerLoop` に合わせる
- 編集 UI は step の on/off 切り替えのみを扱う
- メトロノーム click は on/off 可能な補助機能として扱う
- `beatsPerLoop` と `stepsPerBeat` の組で 1 ループの総 step 数が決まる
- 例:
  `stepsPerBeat=4, beatsPerLoop=4` なら総 step 数は 16
  `stepsPerBeat=3, beatsPerLoop=4` なら総 step 数は 12

## 導出値

- `loopLength` は URL の一次パラメーターではなく導出値とする
- `loopLength = stepsPerBeat * beatsPerLoop`
- pattern の各トラック長、loop 内 step 位置、UI の step grid 長はこの導出値を使う

## URL 仕様

- Phase 1 で主に使う URL パラメーター:
  `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop`, `kit`, `pattern`
- 例:
  `?bpm=120&stepsPerBeat=4&swing=0&beatsPerLoop=4&kit=minimal&pattern=1000100010001000_0000100000001000_1010101010101010`
- `beatsPerLoop` は整数として扱う
- `pattern` は `kit` で定義されたトラック順に従う
- `pattern` 読み込み時は `docs/spec/url-state.md` の共通原則に従う
- `kit` が未知の場合は Phase 1 の既定 `kit` にフォールバックする
- メトロノーム click の on/off は URL 共有対象にしない
- `stepsPerBeat` が異なると同じ `pattern` でも時間解釈が変わるため、必ず URL 共有対象に含める
- `beatsPerLoop` が異なると 1 ループの総 step 数が変わるため、必ず URL 共有対象に含める

## kit 仕様

- Phase 1 では既定 `kit` を 1 つ用意する
- 既定 `kit` の ID は `minimal` とする
- `kit` は少なくとも以下を定義する:
  トラック数
  トラック順
  各トラックの表示名
  各トラックの発音ルール
- `minimal` のトラック順は以下で固定する:
  `kick`, `snare`, `closedHat`, `openHat`
- `minimal` の各トラックは以下の発音ルールを持つ:
  `kick`: 低く短い音
  `snare`: 中高域の短いノイズ系の音
  `closedHat`: 高域の短いノイズ系の音
  `openHat`: `closedHat` より長い高域の音
- Phase 1 では Tone.js の最小構成で実装できる音色を優先し、サンプル再生は必須にしない
- `closedHat` と `openHat` は Phase 1 では choke しなくてよい
- まずは互換性重視で、既定 `kit` の ID は固定値にする

## pattern 仕様

- `pattern` は 1 つの文字列
- 各トラックは `0/1` のみを使う
- `1` は発音、`0` は無音
- 各トラック文字列の長さは `stepsPerBeat * beatsPerLoop` と一致させる
- 足りない場合は末尾を `0` で補完する
- 長すぎる場合は末尾を切り捨てる
- 不正文字は `0` 扱いにする
- トラック数が不足している場合は不足トラックを `0` 埋めで補完する
- トラック数が多すぎる場合は既定 `kit` のトラック数まで切り捨てる
- `minimal` の `pattern` は上記トラック順で解釈する

## UI 方針

- 画面上には Phase 名を表示しない
- 機能名だけを見せる
- メトロノーム専用画面ではなく、Sequencer へ拡張できる見せ方に寄せる
- 各トラックは step の on/off を視認しやすく表示する
- 編集 UI は検証しやすさを優先し、凝った演出より明瞭さを優先する

## UI 構成

- ヘッダには機能名のみを表示する
- 再生 / 停止を行える
- `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop`, `kit` を編集できる
- トラックごとの step grid を表示する
- URL を確認できる
- メトロノーム click を個別に on/off できる
- calibration 系 UI を残す場合は、シーケンサー本体の補助として扱う

## State 仕様

- URL に載る state は少なくとも以下を持つ:
  `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop`, `kit`, `pattern`
- runtime 専用の再生オブジェクトは state に入れない
- URL からの復元時には全値を正規化する
- UI 編集時も URL と同じ制約で正規化する
- メトロノーム click の on/off はローカル state として扱う

## Transport / Engine 仕様

- Transport は引き続き音を鳴らさず、絶対時刻から beat / step 位置を計算する
- Engine は現在 step をもとに、各トラックの `pattern` を参照して発音する
- メトロノーム click を残す場合も、sequencer と同じ transport を使う
- BPM 変更時は既存の先読み予約を捨てて再スケジュールする
- `stepsPerBeat` 変更時も共有グリッド優先で step 解釈を更新する
- `swing` 変更時は奇数 step の発音時刻を新設定で再計算する
- `pattern` 編集時は次回先読みから新しい内容を反映する

## 完了条件

- URL 共有だけで別端末が同じシーケンスを再生できる
- `beatsPerLoop`, `kit`, `pattern` を URL から復元できる
- step grid から `pattern` を編集できる
- 再生中に `bpm`, `stepsPerBeat`, `swing` を変えても共有グリッド基準で破綻しない
- `pattern` の不正値や不足値で停止せず、既定ルールで復元できる
- メトロノーム click を有効にした場合も sequencer と同じ時間基準で追従する
- 画面上に Phase 名を表示しない
