# Overview

## このリポジトリについて

このリポジトリは、Web ブラウザで動作するシーケンサーの実験・実装を扱う。  
最終的には、複数端末が同じ URL を開くことで、通信なしに近い条件で同じ時間軸・同じ記述を共有できる構成を目指す。

ただし、最終形を一気に作らず、Phase ごとに中核構造を検証しながら進める。

## 進め方

- まず時間基準と URL 共有を壊さない最小単位を作る
- Phase ごとに対象範囲を限定する
- 構造は将来拡張を見越して整える
- 将来機能を先回りして実装しすぎない

## ドキュメント構成

- 共通方針: `AGENTS.md`
- 時間モデル: `docs/spec/time-model.md`
- URL / state 仕様: `docs/spec/url-state.md`
- Phase 0: `docs/phases/phase-0.md`
- Phase 1: `docs/phases/phase-1.md`

## 現在の状態

- Phase 1 の実装は完了扱いとする
- 次の仕様は Phase 2 として別途定義する
