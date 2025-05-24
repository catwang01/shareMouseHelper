const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function isProcessRunning(programName) {
    try {
        const { stdout } = await execAsync(`pgrep -x ${programName.split('.')[0]}`);
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
}

async function restart(programName) {
    await killMac(programName);
    await sleep(1000)
    await startMac(programName);
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

function killMac(programName) {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        exec(`pkill -x ${programName.split('.')[0]}`, (err, stdout, stderr) => {
            if (err) {
                resolve(true);
            } else {
                resolve(stdout);
            }
        });
    });
}

function startMac(programName) {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec;
        exec(`open -a /Applications/${programName}.app`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}