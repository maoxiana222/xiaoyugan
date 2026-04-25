export const CONSUME_REASONS = [
  "开会",
  "通勤",
  "改方案",
  "回消息",
  "陪聊",
  "做家务",
  "情绪内耗",
  "失眠",
  "生理期不适",
  "看手机太久",
];

export const RESTORE_REASONS = [
  "吃了顿好的",
  "小睡一会儿",
  "晒太阳",
  "和朋友聊天",
  "看了喜欢的内容",
  "运动了",
  "洗了个热水澡",
  "什么都没做发呆",
  "撸猫",
  "听音乐",
];

// v4.3 二级入口 — 加法（补能）大类
export const RESTORE_CATEGORIES = [
  "工作成就",
  "情感支持",
  "身体照顾",
  "创造表达",
  "其他",
] as const;
export type RestoreCategory = (typeof RESTORE_CATEGORIES)[number];

// v4.3 二级入口 — 减法（精力杀手）大类
export const CONSUME_CATEGORIES = [
  "工作决策",
  "社交/情绪劳动",
  "身体不适",
  "家务/育儿",
  "其他",
] as const;
export type ConsumeCategory = (typeof CONSUME_CATEGORIES)[number];
