const { existsSync } = require('fs');
const path = require('path');
const log = require('./logger');



// let millisecondsUntilNext = getMillisecondsToNextHalfHourOrHour();
// console.log("距离下一个30分钟或整点还有多少毫秒：", millisecondsUntilNext);
module.exports = async function restart(programName) {
    await killWin(programName.split('/').pop());
    await sleep(1000)
    await startWin(programName);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

}
function killWin(programName) {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        exec(`taskkill /f /im ${programName}`, (err, stdout, stderr) => {
            if (err) {
                resolve(true);
            } else {
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
        if (existsSync(path.resolve(curpath, programName))) {
            return true;
        }
    });
    log('parentPath', path.resolve(parentPath, programName));
    return parentPath ?path.resolve(parentPath, programName) : null;
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
        log('sh',sh);
        exec(sh,{
          windowsHide: true,
        } ,(err, stdout, stderr) => {
            log('err', err);
            log('stdout', stdout);
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
