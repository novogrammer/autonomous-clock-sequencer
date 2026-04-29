# Phase 2

## 状態

- 仕様検討中
- Phase 1 の時間モデルと URL 共有を維持したまま、譜面の入口と差し替え操作を追加する

## 目的

あらかじめ用意した `Example Score` を入口として置きつつ、他の人の譜面はハッシュタグ経由で辿れるようにし、共有 URL から開いた後も、現在の絶対時間基準を保ったまま `kit` ごとの `Pattern Preset` を差し替えられるようにする。

## 追加するもの

- あらかじめ決めた `Example Score`
- `kit` ごとの `Pattern Preset`
- すぐ試せる譜面カタログ UI
- ハッシュタグ経由の検索 URL 導線

## 維持する原則

- 再生中通信なし
- 再生位置は Unix epoch 基準
- URL が共有状態の正本
- `bpm`, `stepsPerBeat`, `swing`, `beatsPerLoop` は共有グリッドの値として扱う

## スコープ

- あらかじめ決めた example を入口として、現在の sequencer state を素早く切り替えられる
- `Example Score` で、譜面全体をすぐ試せる
- 共有 URL から開いた後に、現在の時間軸を保ったまま `kit` ごとの `Pattern Preset` を差し替えられる
- プリセットは URL と同じ正規化規則で読み込まれる
- X や Bluesky 上のハッシュタグ検索へ遷移できる

## 非スコープ

- 再生中通信
- サーバー保存
- ユーザー作成プリセットの永続化
- 複数人による同時編集
- per-track swing や per-track timing offset

## 入口と支援機能

### Example Score

- `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing`, `kit`, `pattern` をまとめて持つ
- 読み込むと譜面全体を切り替える
- リポジトリ側があらかじめ決めた example として置く
- 「まず何を試せばよいか」を示す入口に使う
- 個数は Phase 2 の実装時に決める

### Pattern Preset

- 特定の `kit` に属する `pattern` のプリセットとして扱う
- 現在の絶対時間基準は維持しながら、`kit`, `stepsPerBeat`, `beatsPerLoop`, `pattern` を preset 側の値へ切り替える
- `bpm` と `swing` は維持する
- 適用は即時反映とする
- 共有 URL から開いた後に、同じ時間軸のまま別の解釈へ切り替えるために使う
- 譜面そのものというより、体験を補助する支援機能として扱う
- 個数は `kit` ごとに Phase 2 の実装時に決める

### Shared Scores

- 他の人が投稿した score URL は、アプリ内に静的に同梱しなくてよい
- まずはハッシュタグ検索を経由して辿れるようにする
- `Example Score` と違い、リポジトリ側で内容を保証しない

## State / URL 方針

- Phase 2 のプリセット自体は、まずはコード内の静的定義として持ってよい
- プリセット適用後の実際の state は、引き続き通常の URL state と同じ形に正規化する
- `Example Score` は URL に載る state を一式差し替える
- `Pattern Preset` は `kit`, `stepsPerBeat`, `beatsPerLoop`, `pattern` を持つ
- `Pattern Preset` 適用時は、その値へ切り替えた上で URL state を正規化する
- `Pattern Preset` 適用時も `bpm` と `swing` は維持する
- `playbackOffsetMs` や metronome on/off のようなローカル値はプリセット対象に含めない

## 公開 / 流通方針

- 譜面 URL は個別の score として共有する
- ハッシュタグは譜面群のインデックスとして使う
- 既定ハッシュタグは `#AutonomousClockSequencer` とする
- 埋め込みウィジェットが必須ではない場合、まずは検索 URL を公開導線として使ってよい
- 最初の対象は X と Bluesky を想定する
- 例:
  - X: `https://x.com/search?q=%23AutonomousClockSequencer&src=typed_query`
  - Bluesky: `https://bsky.app/search?q=%23AutonomousClockSequencer`

## UI 方針

- `Example Score` 一覧は「何を試せばよいか」が分かる入口にする
- `Example Score` と `Pattern Preset` は別のセクションとして見せる
- 名前だけでなく、必要なら短い説明文も添える
- 外部共有導線は埋め込みより検索 URL を優先してよい
- `Shared Scores` はアプリ内例示ではなく、外部の流通面として扱う
- `Example Score` は画面の上の方に置く
- `Pattern Preset` は `Pattern` に近い位置へ置く
- `Shared Scores` は画面の上の方に置く

## 想定する最小 UI

- `Example Scores`
  - 画面上部で、あらかじめ決めた譜面を呼び出す
- `Pattern Presets`
  - `Pattern` に近い位置で、特定の `kit` に属する `pattern` を現在の絶対時間基準を維持したまま差し替える
- `See Shared Scores`
  - 画面上部で、ハッシュタグ検索ページへのリンクを並べる

## 完了条件

- いくつかの既定譜面をワンクリックで試せる
- `Example Score` が `bpm`, `stepsPerBeat`, `beatsPerLoop`, `swing`, `kit`, `pattern` をまとめて切り替えられる
- `Pattern Preset` が `bpm` と `swing` を維持したまま、`kit`, `stepsPerBeat`, `beatsPerLoop`, `pattern` を適用できる
- プリセット適用後の state が URL に正しく反映される
- 共有 URL から開いた後でも、現在の時間軸を保った差し替え体験を確認できる
- 他の人の score をハッシュタグ検索から辿れる
