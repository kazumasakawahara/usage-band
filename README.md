# usage-band

Claude Code のプロンプトの上に、このセッションの使い具合を 4 行の帯で表示する mod です。

- 1 行目: 気分の顔文字と、このセッションの費用（米ドル）
- 2 行目: 5 時間の利用上限の使用率
- 3 行目: 7 日間の利用上限の使用率
- 4 行目: コンテキスト（会話の記憶）の使用率と、使ったトークン数／上限

値は `$.session.usage()` から取り、ターンが終わるたびに更新します。`/usage-band` で表示と非表示を切り替えられます。
使用率が 70% を超えると顔文字が「そろそろ」、90% を超えると「ひっ迫」に変わります。

## English summary

usage-band draws a four-line band above the Claude Code prompt: the session cost in US dollars with a mood face, the five-hour and seven-day rate-limit usage as bars, and the context-window usage with tokens used over the window size. Values come from `$.session.usage()` and refresh after every turn. Toggle it with `/usage-band`. No setup is needed.

## インストール

ターミナルの Claude Code のプロンプトで:

```
/plugin install usage-band --marketplace kazumasakawahara/usage-band
```

`Add marketplace?` に `y`、スコープは `user` を選ぶと、以後のすべてのセッションで帯が出ます。

シェルから:

```
claude plugin install usage-band --marketplace kazumasakawahara/usage-band
```

Claude Desktop の Code タブでは `/plugin` が使えないので、プロンプト横の「+」→ Plugins → Add marketplace に `kazumasakawahara/usage-band` を入れ、Add plugin を選びます。
ターミナルから user スコープで入れたものは、Desktop のローカルセッションにも読み込まれます。

非公開リポジトリのため、GitHub でこのリポジトリを読める人で、その Mac に github.com の git 認証（SSH 鍵か `gh auth login` 後の `gh auth setup-git`）があることが前提です。

## Install (English)

```
/plugin install usage-band --marketplace kazumasakawahara/usage-band
```
