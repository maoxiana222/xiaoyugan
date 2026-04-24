export const BLIND_BOX_ACTIONS: string[] = [
  "闭眼 1 分钟",
  "喝一大口温水",
  "站起来伸个懒腰",
  "走到窗边看 30 秒",
  "给自己一个拥抱",
  "深呼吸 3 次",
  "摸摸自己的头说「辛苦了」",
  "听一首很短的歌",
  "吃一颗糖",
  "给信任的人发个表情",
  "把手机翻过去 5 分钟",
  "洗一下脸",
  "闻一闻喜欢的味道",
  "看一张存着的可爱照片",
  "写下一句此刻的感受",
  "涂涂护手霜",
  "整理一小块桌面",
  "慢慢咀嚼一口零食",
  "趴在桌上 2 分钟",
  "对着镜子笑一下",
];

export function pickBlindBoxAction(): string {
  return BLIND_BOX_ACTIONS[Math.floor(Math.random() * BLIND_BOX_ACTIONS.length)]!;
}
