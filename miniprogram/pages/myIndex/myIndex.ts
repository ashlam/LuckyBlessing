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
import { 
  getDateInfo,
  getLunarDayName,
  getLunarMonthName 
} from './dateUtils'; // 新增日期工具导入
import { Random } from './randomService';
import { generateLotteryNumbers } from './lotteryService'; // 新增导入
import type { LotteryConfig } from './types'; 

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
  
  
    // 修改 processImage 方法中的测试代码
    processImage(filePath, seed) {
      wx.showLoading({
        title: '正在处理图片...',
        mask: true
      });
  
      // 替换版本检测为功能测试
      const testDate = new Date('2024-02-10'); // 测试龙年春节
      console.log('测试春节转换结果:', getDateInfo(testDate));
  
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
          dateInfo: getDateInfo(today), // 改为直接调用
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
  // 修改后的generateLotteryNumbers方法（约211-219行）
  generateLotteryNumbers() {
    const config = {
      selectedType: this.data.selectedType,
      selectedMode: this.data.selectedMode,
      selectedMultiplier: this.data.selectedMultiplier,
      currentSeed: this.data.currentSeed
    };
    return generateLotteryNumbers(this.random, config);
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