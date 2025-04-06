#!/usr/bin/env node
const log = require('./logger');

function getMillisecondsToNextHalfHourOrHour(durationInMinutes = 30) {
    let now = new Date(); // 获取当前时间
    let minutes = now.getMinutes(); // 获取当前的分钟数
    let nextTime;

    if (minutes < durationInMinutes) {
        // 如果当前分钟小于duration，则下一个时间点是当前小时的30分钟
        nextTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            durationInMinutes,
            0,
            0
        );
    } else {
        // 否则，下一个时间点是下一个小时的整点
        nextTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours() + 1,
            0,
            0,
            0
        );
    }

    // 计算差值（毫秒）
    let millisecondsToNext = nextTime.getTime() - now.getTime();

    return millisecondsToNext;
}

function restart() {
    log('重启...');
    if(process.platform === 'win32') {
      const restartWin = require('./restart-win');
      restartWin('ShareMouse/ShareMouse.exe');
    }
    else {
      const restartMac = require('./restart-mac');
      restartMac('ShareMouse.app');
    }
}

const args = process.argv.slice(2);
let duration = 30;
if (args.length > 0) {
  const inputDuration = parseInt(args[0], 10);
  if (!isNaN(inputDuration)) {
    duration = inputDuration;
  }
}

log(`Duration is set to ${duration} minutes.`);

function jihua() {
  restart();
  let millisecondsUntilNext = getMillisecondsToNextHalfHourOrHour(duration);
  log("距离下一个30分钟或整点还有多少毫秒：", millisecondsUntilNext);
  // restart();
  setTimeout(() => {
      restart();
      jihua();
  }, millisecondsUntilNext);
}

jihua();
