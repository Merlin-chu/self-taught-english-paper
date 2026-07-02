/**
 * 公众号关注引导 — 仅微信内显示，关注后方可使用刷题功能
 */
(function () {
  'use strict';

  var isWechat = /MicroMessenger/i.test(navigator.userAgent);
  if (!isWechat) return; // 非微信环境不拦截

  var KEY = 'follow_gate_approved';

  if (localStorage.getItem(KEY) === 'true') return; // 已确认关注

  // --- 创建遮罩层 ---
  var overlay = document.createElement('div');
  overlay.id = 'follow-gate-overlay';
  overlay.innerHTML =
    '<div style="' +
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:rgba(0,0,0,0.6);z-index:99999;' +
    'display:flex;align-items:center;justify-content:center;' +
    '">' +
    '<div style="' +
    'background:#fff;border-radius:0;padding:28px 24px 20px;' +
    'max-width:320px;width:90%;text-align:center;' +
    'font-family:\'PingFang SC\',\'Microsoft YaHei\',sans-serif;' +
    '">' +
    '<div style="font-size:1.1rem;font-weight:bold;color:#000;margin-bottom:6px;">关注公众号后刷题</div>' +
    '<p style="font-size:0.85rem;color:#666;margin:0 0 14px;">关注【美林自习室】，解锁全部真题</p>' +
    '<a href="https://weixin.qq.com/r/mp/ykV3b3DENi1JrTQM9xDY" target="_blank" style="display:block;margin:0 auto 14px;">' +
    '<img src="公众号二维码.JPG" alt="公众号二维码" ' +
    'style="width:140px;height:140px;border:1px solid #eee;display:block;margin:0 auto;">' +
    '</a>' +
    '<a href="https://weixin.qq.com/r/mp/ykV3b3DENi1JrTQM9xDY" target="_blank" ' +
    'style="display:inline-block;margin-bottom:14px;color:#333;font-weight:600;' +
    'text-decoration:none;border:1px solid #333;padding:5px 16px;font-size:0.85rem;' +
    '" onmouseover="this.style.background=\'#333\';this.style.color=\'#fff\';" ' +
    'onmouseout="this.style.background=\'transparent\';this.style.color=\'#333\';">' +
    '点击关注公众号 →</a>' +
    '<button id="follow-gate-confirm" style="' +
    'display:block;width:100%;padding:10px 0;margin:0 auto;' +
    'background:#333;color:#fff;border:none;font-size:0.95rem;' +
    'font-weight:600;cursor:pointer;' +
    '" onmouseover="this.style.background=\'#555\'" ' +
    'onmouseout="this.style.background=\'#333\'">' +
    '✅ 已关注，开始刷题</button>' +
    '</div></div>';

  document.body.appendChild(overlay);

  // 点击"已关注"按钮
  document.getElementById('follow-gate-confirm').addEventListener('click', function () {
    localStorage.setItem(KEY, 'true');
    overlay.remove();
  });
})();
