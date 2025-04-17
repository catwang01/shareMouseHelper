const log = require('./logger');

/**
 * 重试函数，接受一个异步函数，最大重试次数和重试延迟函数
 * @param {Function} fn 要执行的函数
 * @param {number} maxRetries 最大重试次数
 * @param {Function} delayFn 计算重试延迟的函数
 * @returns {Function} 包装后的函数
 */
function withRetry(fn, maxRetries = 3, delayFn = (retryCount) => retryCount * 1000) {
    return async (...args) => {
        let retryCount = 0;

        while (retryCount <= maxRetries) {
            try {
                return await fn(...args);
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

/**
 * 格式化剩余时间为分钟和秒
 * @param {number} ms 毫秒数
 * @returns {string} 格式化后的字符串
 */
function formatTimeLeft(ms) {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}分${seconds}秒`;
}

module.exports = {
    withRetry,
    formatTimeLeft
}; 