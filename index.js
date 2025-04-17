#!/usr/bin/env node
const log = require('./logger');

const platform = process.platform === 'win32' ? 'win' : 'mac';
const platformModule = require(`./restart-${platform}`);

// 重试函数，接受一个异步函数，最大重试次数和重试延迟函数
function withRetry(fn, maxRetries = 3, delayFn = (retryCount) => retryCount * 1000) {
    return async () => {
        let retryCount = 0;

        while (retryCount <= maxRetries) {
            try {
                const suffix = retryCount > 0 ? `(第${retryCount}次重试)` : '';
                return await fn(suffix);
            } catch (error) {
                retryCount++;
                if (retryCount > maxRetries) {
                    log(`操作失败: ${error.message}，已达到最大重试次数`);
                    throw error;
                }

                const delay = delayFn(retryCount);
                log(`操作失败: ${error.message}，${delay / 1000}秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

function formatTimeLeft(ms) {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}分${seconds}秒`;
}

const checkAndRestart = withRetry(async (force = false) => {
    const processName = platform === 'win' ? 'ShareMouse.exe' : 'ShareMouse';
    if (force) {
        log('重启ShareMouse...');
        await platformModule.restart(processName);
    } else {
        const isRunning = await platformModule.isProcessRunning(processName);
        if (!isRunning) {
            log('进程未运行，正在重启...');
            await platformModule.restart(processName);
        } else {
            log('进程正在运行中...');
        }
    }
});

// 每5分钟检查一次进程状态
const CHECK_INTERVAL = 5 * 60 * 1000; // 5分钟
// 每30分钟强制重启一次
const FORCE_RESTART_INTERVAL = 30 * 60 * 1000; // 30分钟

async function startMonitoring() {
    log('开始监控进程...');
    let lastForceRestart = null;

    while (true) {
        const now = Date.now();
        const timeUntilNextRestart = FORCE_RESTART_INTERVAL - (now - lastForceRestart);

        // 检查是否需要强制重启
        if (lastForceRestart === null || now - lastForceRestart >= FORCE_RESTART_INTERVAL) {
            await checkAndRestart(true);
            lastForceRestart = now;
            log(`距离下次重启还有: ${formatTimeLeft(FORCE_RESTART_INTERVAL)}`);
        } else {
            // 检查进程是否在运行
            await checkAndRestart();
            log(`距离下次重启还有: ${formatTimeLeft(timeUntilNextRestart)}`);
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

startMonitoring().catch(error => {
    log('监控出错:', error);
});
