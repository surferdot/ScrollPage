// content.js (更新)

let isScrolling = false;
let scrollSpeed = 1;
let currentScrollElement = null;
let lastScrollTop = 0;
let scrollInterval = null;
const BASE_SCROLL_AMOUNT = 2.5; // 将基础滚动量从 5 减少到 2.5

// 在页面加载时读取保存的速度设置
chrome.storage.sync.get(['scrollSpeed'], function(result) {
    if (result.scrollSpeed) {
      scrollSpeed = parseFloat(result.scrollSpeed);
    }
  });

function getScrollableElement(element) {
  while (element && element !== document.body) {
    const { overflowY } = window.getComputedStyle(element);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return element;
    }
    element = element.parentElement;
  }
  return window;
}
function startScrolling(direction) {
    stopScrolling();
    isScrolling = true;
    const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    currentScrollElement = getScrollableElement(centerElement);
    
    scrollInterval = setInterval(() => {
      if (!isScrolling) {
        clearInterval(scrollInterval);
        return;
      }
  
      // 每一步降低50%的速度
      let adjustedSpeed = scrollSpeed * 0.5;
      if (scrollSpeed > 5) {
        // 对于高速滚动，先降低50%再使用指数增长
        adjustedSpeed = (5 + Math.pow(scrollSpeed - 5, 1.5)) * 0.5;
      }
  
      const scrollAmount = direction === 'up' ? -adjustedSpeed : adjustedSpeed;
      const target = currentScrollElement === window ? document.documentElement : currentScrollElement;
      
      const currentScrollTop = target.scrollTop;
      target.scrollTop += scrollAmount * BASE_SCROLL_AMOUNT;
  
      // 检查是否真的滚动了
      if (Math.abs(target.scrollTop - lastScrollTop) < 0.1) {
        // 如果没有滚动，尝试滚动窗口
        window.scrollBy(0, scrollAmount * BASE_SCROLL_AMOUNT);
      }
  
      lastScrollTop = target.scrollTop;
    }, 16); // 约60fps
  }
  

function stopScrolling() {
  isScrolling = false;
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
}

function createScrollButton(direction) {
  const button = document.createElement('div');
  button.className = `scroll-button scroll-${direction}`;
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL(`images/${direction}_arrow.svg`);
  img.alt = direction === 'up' ? 'Scroll Up' : 'Scroll Down';
  button.appendChild(img);
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isScrolling) {
      stopScrolling();
    } else {
      startScrolling(direction);
    }
  });
  return button;
}

function createScrollControls() {
  const controls = document.createElement('div');
  controls.className = 'scroll-controls';
  controls.appendChild(createScrollButton('up'));
  controls.appendChild(createScrollButton('down'));
  document.body.appendChild(controls);

  makeDraggable(controls);
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// createScrollControls();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setSpeed') {
      scrollSpeed = request.speed;
      // 当收到新的速度设置时，也将其保存
      chrome.storage.sync.set({scrollSpeed: scrollSpeed}, function() {
        console.log('Speed setting updated');
      });
    } else if (request.action === 'getSpeed') {
      sendResponse({speed: scrollSpeed});
    }
    return true;
  });

  // 初始化函数，在页面加载完成后调用
function initializeScrollControls() {
    createScrollControls();
    // 可以在这里添加其他初始化逻辑
  }
  
  // 在页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrollControls);
  } else {
    initializeScrollControls();
  }