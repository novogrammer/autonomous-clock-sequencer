# Time Model

## 時間基準

- 再生位置は Unix epoch から続く共通グリッドとして計算する
- 再生開始時刻を state や URL には持たない
- 各端末は現在の Unix time ミリ秒から現在位置を計算する

## BPM 変更

- BPM 変更は即時反映する
- Unix time 基準の共有グリッドを優先する
- 既存の先読み予約は捨てて再スケジュールする

## swing

- `swing=0` はストレート
- `swing>0` は swing 有効
- 値は swing の強さを表す

## step / beat

- `stepsPerBeat` は 1 拍あたりの step 数
- step 位置は絶対時刻から都度再計算する
- loop や pattern が追加されても、基準は絶対時刻側に置く
