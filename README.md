# token-pet

Claude Code の入力欄の上に、アカウント全体とこのセッションのトークン使用量を、目盛り付きのゲージで表示する mod です。

```
╭──────────────────────────────────────────────────────╮
│ (=^･ω･^=) ごきげん  💰$28.47                          │
│ 🌍 7日間      ▰▰▰▱▱▱▱▱▱▱▱▱▱▱┊▱▱▱▱┊▱▱  17% ✨          │
│ 🍙 セッション ▰▰▰▰▱▱▱▱▱▱▱▱▱▱┊▱▱▱▱┊▱▱  22% 220k/1.0M ✨ │
╰──────────────────────────────────────────────────────╯
```

- 1 行目: 顔文字と一言、このセッションの費用（米ドル）
- 🌍 の行: 利用上限（5 時間・7 日間・予算など、アカウントにあるものだけ）の使用率
- 🍙 の行: コンテキスト（会話の記憶）の使用率と、使ったトークン数／上限

ゲージは 70% と 90% の位置に目盛りがあり、塗りの色が緑→黄→赤に変わります。
どれかが 70% を超えると顔文字が「そろそろ要注意…」、90% を超えると「ほぼ満腹！ /compact か休憩を」になり、
利用上限が 90% を超えた瞬間にトーストで知らせます。

値は `$.session.usage()` と `session.measure` イベントから取り、応答のたびに更新されます。設定は要りません。

## 置き場所と読み込み方

- **Mac（CLI・Claude Desktop の Code タブ）**: 正本は `~/.claude/mods/token-pet`。`~/.claude/settings.json` の `env` 欄に
  `"CLAUDE_CODE_PLUGIN_DIRS": "/Users/<user>/.claude/mods/token-pet"` を書いてあるので、CLI と Desktop の両方が同じフォルダを読む。
  フォルダを編集すると開いているセッションに即反映される。
- **このリポジトリ**: Mac の正本の写し。Mac で直したら `~/Dev-Work/usage-band` に写して commit・push する。
- **クラウドの Claude Code**: コンテナごとに新しいので、インストールして使う（下記）。

## インストール

ターミナルの Claude Code のプロンプトで:

```
/plugin install token-pet --marketplace kazumasakawahara/usage-band
```

`Add marketplace?` に `y`、スコープは `user`。シェルからは:

```
claude plugin install token-pet --marketplace kazumasakawahara/usage-band
```

クラウドの環境では、環境の設定（セッションのタイトルバーの環境メニュー → Edit）の Setup script にこの 1 行を入れておくと、
新しいセッションごとに自動で入る。リポジトリが非公開のままだと Setup script からは取れないので、公開にするか、毎回プロンプトで打つ。

Mac で `CLAUDE_CODE_PLUGIN_DIRS` から読んでいる状態で重ねてインストールすると帯が 2 本出る。Mac ではインストールしない。

## English summary

token-pet draws a bordered gauge panel above the Claude Code prompt: the session cost, each account rate limit
(five-hour, seven-day, spend limit when present) and the context-window usage, with tick marks at 70% and 90%
and a mood face that changes as usage grows. It toasts once when a rate limit crosses 90%. Values come from
`$.session.usage()` and `session.measure`. Install with `/plugin install token-pet --marketplace kazumasakawahara/usage-band`.
