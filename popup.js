document.addEventListener('DOMContentLoaded', function() {
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.querySelector('.speed-value');
  const presetButtons = document.querySelectorAll('.preset-button');

  // 更新速度显示和按钮状态
  function updateSpeedDisplay(speed) {
    speedValue.textContent = speed + 'x';
    speedSlider.value = speed;
    presetButtons.forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === parseFloat(speed));
    });
  }

  // 设置速度并发送到content script
  function setSpeed(speed) {
    const adjustedSpeed = parseFloat(speed);
    updateSpeedDisplay(adjustedSpeed);
    
    // 保存速度设置
    chrome.storage.sync.set({scrollSpeed: adjustedSpeed}, function() {
      console.log('Speed setting saved');
    });

    // 向内容脚本发送新的速度设置
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'setSpeed', speed: adjustedSpeed});
    });
  }

  // 读取保存的速度设置
  chrome.storage.sync.get(['scrollSpeed'], function(result) {
    if (result.scrollSpeed) {
      updateSpeedDisplay(result.scrollSpeed);
    }
  });

  // 滑块事件监听
  speedSlider.addEventListener('input', function() {
    setSpeed(this.value);
  });

  // 预设按钮事件监听
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      setSpeed(this.dataset.speed);
    });
  });
});