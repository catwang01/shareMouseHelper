const notifier = require('node-notifier');

notifier.notify({
  title: '测试通知',
  message: 'notifier 工作正常！',
  sound: true,
  wait: true
}, (err, response, metadata) => {
  if (err) {
    console.error('通知发送失败:', err);
  } else {
    console.log('通知已发送', response, metadata);
  }
});

notifier.on('click', function (notifierObject, options, event) {
  console.log('你点击了通知！');
});

notifier.on('timeout', function (notifierObject, options) {
  console.log('通知已超时自动消失');
}); 