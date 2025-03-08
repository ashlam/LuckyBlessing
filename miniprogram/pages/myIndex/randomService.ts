// 随机数服务模块
export class Random {
  private seed: number;

  constructor(seed: string | number) {
    this.seed = this.hashCode(seed.toString());
  }

  public hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  public random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  public randInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  public generateNumbers(count: number, min: number, max: number): number[] {
    const numbers: number[] = [];
    while(numbers.length < count) {
      const num = this.randInt(min, max);
      if(!numbers.includes(num)) numbers.push(num);
    }
    return numbers.sort((a, b) => a - b);
  }
}