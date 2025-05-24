const { existsSync } = require('fs');
const path = require('path');
const log = require('./logger');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);




async function isProcessRunning(programName) {
    try {
        const { stdout } = await execAsync(`tasklist | findstr /i /c:"${programName}"`);
        return stdout.toLowerCase().includes(programName.toLowerCase());
    } catch (error) {
        return false;
    }
}

async function restart(programName) {
    if (await isProcessRunning(programName)) {
        log('程序正在运行，先杀死进程...');
        await killWin(programName.split('/').pop());
        await sleep(1000)
    }
    await startWin(programName);
    // 添加系统通知
    try {
        const notifier = require('node-notifier');
        notifier.notify({
            title: 'ShareMouse 已重启',
            message: `${programName} 已成功重启`,
            sound: true
        });
    } catch (e) {
        // 忽略通知异常
    }
}

module.exports = {
    restart,
    isProcessRunning
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

}
function killWin(programName) {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        const taskkill = `taskkill /f /im ${programName}.exe`;
        log('executing command:', 'taskkill', taskkill);
        exec(taskkill, (err, stdout, stderr) => {
            if (err) {
                log("结束进程时遇到错误", err);
                resolve(true);
            } else {
                log('结束进程成功', stdout);
                resolve(stdout);
            }
        });
    });
}

function findProgramWin(programName) {
    const parentPath = [
        'C:/Program Files/',
        'C:/Program Files (x86)/',
        'D:/Program Files/',
        'D:/Program Files (x86)/',
        'E:/Program Files/',
        'E:/Program Files (x86)/',
    ].find((curpath) => {
        const programPath = path.resolve(curpath, programName, programName + '.exe');
        if (existsSync(programPath)) {
            return true;
        }
        return false;
    });
    const ret = parentPath ? path.resolve(parentPath, programName, programName + '.exe') : null;
    log('parentPath', ret);
    return ret;
}
/**
 * 启动windows 程序
 * @param {*} programName 
 * @returns 
 */
function startWin(programName) {
    const programPath = findProgramWin(programName);
    if (!programPath) {
        log('未找到程序');
        return;
    }
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        const sh = `start "" "${programPath}"`;
        log('executing command:', 'sh', sh);
        exec(sh, {
            windowsHide: true,
        }, (err, stdout, stderr) => {
            if (err) {
                log('err', err);
            }
            if (stderr) {
                log('stdout', stdout);
            }
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}
