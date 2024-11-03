document.addEventListener('DOMContentLoaded', function() {
    const speedSlider = document.getElementById('speedSlider');
  
    // 读取保存的速度设置
    chrome.storage.sync.get(['scrollSpeed'], function(result) {
      if (result.scrollSpeed) {
        speedSlider.value = result.scrollSpeed;
      }
    });
  
    speedSlider.addEventListener('input', function() {
      const speed = parseFloat(speedSlider.value).toFixed(1);
      
      // 保存速度设置
      chrome.storage.sync.set({scrollSpeed: speed}, function() {
        console.log('Speed setting saved');
      });
  
      // 向内容脚本发送新的速度设置
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'setSpeed', speed: parseFloat(speed)});
      });
    });
  });