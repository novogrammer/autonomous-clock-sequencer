# Phase 2

## 状態

- 仕様検討中
- Phase 1 の時間モデルと URL 共有を維持したまま、譜面の入口と差し替え操作を追加する

## 目的

すぐ試せる譜面カタログを用意し、共有 URL から開いた後も、現在の時間軸を保ったまま `kit` や `pattern` を差し替えられるようにする。

## 追加するもの

- 全部込みの `Score Preset`
- 時間軸を維持して差し替える `Swap Preset`
- すぐ試せる譜面カタログ UI
- ハッシュタグ経由の検索 URL 導線

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- URL が共有状態の正本
- `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop` は共有グリッドの値として扱う

## スコープ

- プリセットから現在の sequencer state を素早く切り替えられる
- 全部込みのプリセットで、譜面全体をすぐ試せる
- 共有 URL から開いた後に、現在の時間軸を保ったまま `kit` や `pattern` を差し替えられる
- プリセットは URL と同じ正規化規則で読み込まれる
- X や Bluesky 上のハッシュタグ検索へ遷移できる

## 非スコープ

- 再生中通信
- サーバー保存
- ユーザー作成プリセットの永続化
- 複数人による同時編集
- per-track swing や per-track timing offset

## プリセットの種類

### Score Preset

- `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing`, `kit`, `pattern` をまとめて持つ
- 読み込むと譜面全体を切り替える
- 入口としてのデモ、展示用の既定譜面、共有用の作例に使う

### Swap Preset

- 現在の時間軸を維持しながら一部の状態だけを差し替える
- 最初の対象は `kit`、`pattern`、または `kit + pattern`
- `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing` は維持する
- 共有 URL から開いた後に、同じ時間軸のまま別の解釈へ切り替えるために使う

## State / URL 方針

- Phase 2 のプリセット自体は、まずはコード内の静的定義として持ってよい
- プリセット適用後の実際の state は、引き続き通常の URL state と同じ形に正規化する
- `Score Preset` は URL に載る state を一式差し替える
- `Swap Preset` は URL に載る state のうち、対象フィールドだけを差し替える
- `playbackOffsetMs` や metronome on/off のようなローカル値はプリセット対象に含めない

## 公開 / 流通方針

- 譜面 URL は個別の score として共有する
- ハッシュタグは譜面群のインデックスとして使う
- 埋め込みウィジェットが必須ではない場合、まずは検索 URL を公開導線として使ってよい
- 最初の対象は X と Bluesky を想定する
- 例:
  - X: `https://x.com/search?q=%23autonomousclocksequencer&src=typed_query`
  - Bluesky: `https://bsky.app/search?q=%23autonomousclocksequencer`

## UI 方針

- プリセット一覧は「何を試せばよいか」が分かる入口にする
- `Score Preset` と `Swap Preset` は別のセクションとして見せる
- まずは少数の既定プリセットで十分とする
- 名前だけでなく、必要なら短い説明文も添える
- 外部共有導線は埋め込みより検索 URL を優先してよい

## 想定する最小 UI

- `Score Presets`
  - 全部込みの譜面を呼び出す
- `Swap Presets`
  - 現在の時間軸を維持して `kit` や `pattern` を差し替える
- `See Shared Scores`
  - ハッシュタグ検索ページへのリンクを並べる

## 完了条件

- いくつかの既定譜面をワンクリックで試せる
- `Score Preset` が `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing`, `kit`, `pattern` をまとめて切り替えられる
- `Swap Preset` が `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing` を維持したまま `kit` や `pattern` を差し替えられる
- プリセット適用後の state が URL に正しく反映される
- 共有 URL から開いた後でも、現在の時間軸を保った差し替え体験を確認できる
