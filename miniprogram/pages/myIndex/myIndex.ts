// 在Page({}) 之前添加类型声明
interface NumberItem {
  redBalls: string[];
  blueBalls: string[];
  multiplier: number;
}

// 使用全局声明来避免相对模块名问题
declare module 'lunar' {
  // 这里可以添加模块的具体类型声明
  export function solarToLunar(year: number, month: number, day: number): any;
}

// 引入农历计算库
const lunarCalendar = require('../../libs/lunar.js');


// 随机数生成器
class Random {
  constructor(seed) {
    this.seed = this.hashCode(seed); // 将种子转换为哈希值
  }

  // 计算字符串的哈希值
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // 转换为 32 位整数
    }
    return hash;
  }

  // 生成随机数（0 到 1 之间）
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // 生成指定范围的随机整数
  randInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

// 在 data 部分新增配置项
Page({
  data: {
    blessing: '',
    dateInfo: '',
    numbers: [],
    lotteryTypes: ['双色球', '大乐透'], // 彩票类型
    selectedType: 0, // 默认选择双色球
    imagePath: '', // 图片路径
    isGenerated: false, // 是否已生成号码
    currentSeed: null, // 当前随机数种子
    modeOptions: ['单倍模式', '倍数模式'],
    multiplierOptions: ['2倍', '5倍', '10倍', '25倍', '50倍'], // 新增倍数选项
    selectedMultiplier: 1, // 默认选5倍（索引1）
    selectedMode: 0
  },
  
    // 添加哈希计算方法
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // 转换为 32 位整数
      }
      return hash;
    },
  
    // 修改 chooseImage 方法中的文件信息获取
    // ... 添加祝福语生成方法
    generateBlessing() {
      const blessings = [
        '心想事成', '万事如意', '福星高照', 
        '好运连连', '吉星高照', '财运亨通'
      ];
      return blessings[this.random.randInt(0, blessings.length - 1)];
    },
  
    // 添加日期信息生成
    // 修改 getDateInfo 方法
    getDateInfo(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // 获取星期（0-6对应周日到周六）
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDay = weekDays[date.getDay()];
      
      const lunar = lunarCalendar.solarToLunar(year, month, day);
      
      // 根据源码实际返回结构验证
      if (!lunar || typeof lunar.lunarMonth !== 'number' || typeof lunar.lunarDay !== 'number') {
        console.error('农历数据异常', lunar);
        return {
          solarDate: `${year}年${month}月${day}日`,
          weekDay: `星期${weekDay}`,
          lunarDate: '农历数据异常'
        };
      }

      // 调整月份处理（源码中lunarMonth是真实月份，1=正月）
      const adjustedMonth = lunar.lunarMonth;
      const isLeap = lunar.lunarLeapMonth === adjustedMonth;
      const monthStr = isLeap ? `闰${this.getLunarMonthName(adjustedMonth)}` : this.getLunarMonthName(adjustedMonth);
      
      return {
        solarDate: `${year}年${month}月${day}日`,
        weekDay: `星期${weekDay}`,
        lunarDate: `农历${monthStr}${this.getLunarDayName(lunar.lunarDay)}` // 修改日显示方式
      };
    },

    // 新增农历日转换方法
    getLunarDayName(day) {
      const units = ['','一','二','三','四','五','六','七','八','九','十'];
      const tens = ['初','十','廿','卅'];
      let res = '';
      
      if(day > 30) return '未知';
      if(day === 10) return '初十';
      
      res = tens[Math.floor(day/10)];
      res += units[day%10] || '';
      
      // 特殊处理
      if(day === 20) res = '二十';
      if(day === 30) res = '三十';
      
      return res + (res ? '日' : '');
    },

    // 修改农历月份转换方法
    getLunarMonthName(month) {
      const names = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
      return names[month - 1] || '';
    },
  
    generateRandomNumbers(count, min, max) {
      const numbers = [];
      while(numbers.length < count) {
        const num = this.random.randInt(min, max);
        if(!numbers.includes(num)) numbers.push(num);
      }
      return numbers.sort((a, b) => a - b);
    },  // ← 确保这个逗号存在
  
    // 修改 processImage 方法中的测试代码
    processImage(filePath, seed) {
      wx.showLoading({
        title: '正在处理图片...',
        mask: true
      });
  
      // 替换版本检测为功能测试
      const testDate = new Date('2024-02-10'); // 测试龙年春节
      console.log('测试春节转换结果:', this.getDateInfo(testDate));
  
      setTimeout(() => {
        const today = new Date();
        // 种子处理逻辑
        const baseSeed = (this.data.originalSeed === null || typeof this.data.originalSeed !== 'number') 
          ? seed 
          : this.data.originalSeed;
        
        const fullSeed = baseSeed.toString() + today.toDateString();
        
        // 更新种子状态
        this.setData({ originalSeed: seed });
        
        // 初始化随机数生成器
        this.random = new Random(fullSeed);
        
        // 生成界面数据
        this.setData({
          blessing: this.generateBlessing(),
          dateInfo: this.getDateInfo(today), // 现在返回对象
          numbers: this.generateLotteryNumbers(),
          isGenerated: true,
          currentSeed: fullSeed
        });
        
        wx.hideLoading();
      }, 1000);
    },
  
    chooseImage() {
      wx.chooseImage({
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          console.log('图片临时路径:', tempFilePath);
  
          this.setData({ 
            imagePath: tempFilePath,
            originalSeed: null,
            currentSeed: null
          });
  
          wx.getImageInfo({
            src: tempFilePath,
            success: (infoRes) => {
              const fs = wx.getFileSystemManager();
              try {
                // 使用 statSync 替代 getFileInfoSync
                const fileStats = fs.statSync(tempFilePath);
                const featureString = 
                  `${infoRes.width}x${infoRes.height}_${infoRes.type}_${fileStats.size}`;
                  
                const seed = this.hashCode(featureString);
                
                this.setData({ imagePath: tempFilePath });
                this.processImage(tempFilePath, seed);
              } catch (err) {
                console.error('获取文件信息失败:', err);
              }
            }
          });
        }
      });
    },

  // 新增的倍数选择处理方法
  changeMultiplier(e) {
    this.setData({
      selectedMultiplier: Number(e.detail.value)
    });
    if (this.data.isGenerated && this.data.selectedMode === 1) {
      this.processImage(this.data.imagePath, this.data.originalSeed);
    }
  },

  // 新增模式切换处理方法
  changeMode(e) {
    this.setData({
      selectedMode: Number(e.detail.value)
    });
    if (this.data.isGenerated) {
      this.processImage(this.data.imagePath, this.data.originalSeed);
    }
  },
  // 修改 generateLotteryNumbers 方法
  generateLotteryNumbers() {
    const type = this.data.lotteryTypes[this.data.selectedType];
    const numbers = [];
    
    // 根据模式确定组数
    const totalGroups = this.data.selectedMode === 1 ? 
      this.random.randInt(1, 5) : 5; // 单倍模式固定5组

    // 计算总倍数（仅在倍数模式生效）
    let totalMultiplier = 1;
    if (this.data.selectedMode === 1) {
      const multiplierMap = {0: 2, 1: 5, 2:10, 3:25, 4:50};
      totalMultiplier = multiplierMap[this.data.selectedMultiplier];
    }

    // 分配倍数逻辑（仅在倍数模式）
    let remaining = totalMultiplier;
    for (let i = 0; i < totalGroups; i++) {
      let currentMultiplier = 1;
      if (this.data.selectedMode === 1) {
        currentMultiplier = i === totalGroups - 1 ? 
          remaining : this.random.randInt(1, remaining - (totalGroups - i - 1));
        remaining -= currentMultiplier;
      }

      if (type === '双色球') {
        const redBalls = this.generateRandomNumbers(6, 1, 33).map(num => num.toString().padStart(2, '0'));
        const blueBall = this.generateRandomNumbers(1, 1, 16).map(num => num.toString().padStart(2, '0'));
        numbers.push({
          redBalls: redBalls,
          blueBalls: blueBall,
          multiplier: currentMultiplier
        });
      } else {
        // 添加缺失的变量定义
        const frontBalls = this.generateRandomNumbers(5, 1, 35).map(num => num.toString().padStart(2, '0'));
        const backBalls = this.generateRandomNumbers(2, 1, 12).map(num => num.toString().padStart(2, '0'));
        numbers.push({
            redBalls: frontBalls,
            blueBalls: backBalls,
            multiplier: currentMultiplier
        });
      }
    }
    return numbers;
  },
  // 在Page对象中添加reset方法
  reset() {
    this.setData({
      isGenerated: false,
      numbers: [],
      imagePath: '',
      currentSeed: null,
      originalSeed: null
    });
  },
  // 在reset方法后添加导出方法
  // 修改 exportResult 方法
  exportResult() {
    // 过滤有效号码组并重新生成序号
    const validNumbers = this.data.numbers
      .filter(item => this.data.selectedMode !== 1 || item.multiplier > 0)
      .map((item, index) => ({
        ...item,
        displayIndex: index + 1
      }));
    
    let exportText = `【${this.data.lotteryTypes[this.data.selectedType]}】\n`;
    exportText += `日期：${this.data.dateInfo.solarDate} ${this.data.dateInfo.weekDay}\n`;  // 恢复星期显示
    exportText += `农历：${this.data.dateInfo.lunarDate}\n`;
    exportText += `祝福：${this.data.blessing}\n\n`;  // 添加祝福语
    
    validNumbers.forEach(item => {
      exportText += `第${item.displayIndex}组：${item.redBalls.join(' ')} + ${item.blueBalls.join(' ')}`;
      if (this.data.selectedMode === 1) {
        exportText += ` ×${item.multiplier}倍`;
      }
      exportText += '\n';
    });
  
    // 替换旧的content生成逻辑
    wx.setClipboardData({
      data: exportText.trim(),  // 使用trim()去除首尾空白
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        wx.showToast({
          title: '复制失败',
          icon: 'error'
        });
      }
    });
  },
});