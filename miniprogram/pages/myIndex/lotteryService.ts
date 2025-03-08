// 彩票服务模块
import { Random } from './randomService';
import type { NumberItem, LotteryConfig } from './types';

export function generateLotteryNumbers(random: Random, config: LotteryConfig): NumberItem[] {
  const numbers: NumberItem[] = [];
  const totalGroups = config.selectedMode === 1 ? 
    random.randInt(1, 5) : 5;

  let remaining = config.selectedMode === 1 ? 
    [2,5,10,25,50][config.selectedMultiplier] : 1;

  for (let i = 0; i < totalGroups; i++) {
    let currentMultiplier = 1;
    if (config.selectedMode === 1) {
      currentMultiplier = i === totalGroups - 1 ? 
        remaining : random.randInt(1, remaining - (totalGroups - i - 1));
      remaining -= currentMultiplier;
    }

    const item = config.selectedType === 0 ? 
      generateSSQ(random) : 
      generateDLT(random);

    numbers.push({...item, multiplier: currentMultiplier});
  }
  return numbers;
}

function generateSSQ(random: Random): NumberItem {
  return {
    redBalls: random.generateNumbers(6, 1, 33).map(padNumber),
    blueBalls: random.generateNumbers(1, 1, 16).map(padNumber),
    multiplier: 1
  };
}

function generateDLT(random: Random): NumberItem {
  return {
    redBalls: random.generateNumbers(5, 1, 35).map(padNumber),
    blueBalls: random.generateNumbers(2, 1, 12).map(padNumber),
    multiplier: 1
  };
}

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}