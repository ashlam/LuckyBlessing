// 集中管理类型声明

export interface NumberItem {
  redBalls: string[];
  blueBalls: string[];
  multiplier: number;
}

export interface DateInfo {
  solarDate: string;
  weekDay: string;
  lunarDate: string;
}

export interface LotteryConfig {
  selectedType: number;
  selectedMode: number;
  selectedMultiplier: number;
  currentSeed: string | null;
}