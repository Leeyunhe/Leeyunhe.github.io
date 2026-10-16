/**
 * 一键生成精美极客“技术分享长图 / 金句海报” (Post Share Poster Engine)
 * 挂载位置: source/js/post-poster.js
 * 说明:
 * 1. 采用纯前端 HTML5 Canvas 2D 视网膜 Retina 2x 高清即时渲染，零第三方臃肿框架；
 * 2. 搭载本地解耦 QRCode 引擎 (/lib/qrcode/qrcode.min.js)，按需动态加载；
 * 3. 自动抓取文章元数据：标题、发布日期、分类/标签、著者 (Leeyunhe)、金句/导读与专属二维码；
 * 4. 搭载 Mac 三色拟态装饰、主题橙渐变、自适应换行与毛玻璃交互弹窗；
 * 5. 完整支持 PJAX 页面切换与全移动端扫码/保存体验。
 */

(function() {
  'use strict';

  var qrCodeLoaded = false;
  var qrCodeLoading = false;
  var qrCodeCallbacks = [];

  // 按需动态加载 qrcode.min.js
  function loadQRCode(callback) {
    if (window.QRCode) {
      qrCodeLoaded = true;
      return callback();
    }
    qrCodeCallbacks.push(callback);
    if (qrCodeLoading) return;
    qrCodeLoading = true;

    var script = document.createElement('script');
    script.src = '/lib/qrcode/qrcode.min.js';
    script.onload = function() {
      qrCodeLoaded = true;
      qrCodeLoading = false;
      while (qrCodeCallbacks.length) {
        var cb = qrCodeCallbacks.shift();
        try { cb(); } catch (e) { console.error(e); }
      }
    };
    script.onerror = function() {
      qrCodeLoading = false;
      console.error('[PostPoster] Failed to load qrcode.min.js');
    };
    document.head.appendChild(script);
  }

  // 辅助函数：绘制圆角矩形 (带现代 roundRect 与平滑后退 fallback)
  function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, [radius.tl, radius.tr, radius.br, radius.bl]);
    } else {
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
      ctx.closePath();
    }
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // 辅助函数：智能中英文混排文本折行
  function wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    // 按照 CJK 汉字或西文字词拆解
    var tokens = text.match(/[\u4e00-\u9fa5]|[\u3000-\u303f]|[\uff00-\uffef]|[^\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\s]+|\s+/g) || [text];
    var lines = [];
    var currentLine = '';

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      var testLine = currentLine + token;
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
        currentLine = token.trimStart();
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }
    return lines;
  }

  // 生成二维码 Canvas/Image
  function generateQRCode(url, callback) {
    var tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    new window.QRCode(tempContainer, {
      text: url,
      width: 240,
      height: 240,
      colorDark: '#1a1e24',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H
    });

    setTimeout(function() {
      var canvas = tempContainer.querySelector('canvas');
      var img = tempContainer.querySelector('img');
      var qrElement = canvas || img;
      callback(qrElement);
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }, 40);
  }

  // Canvas 2D Retina 2x 高清海报渲染器
  function renderPoster(data, callback) {
    var title = data.title || document.title.replace(/ \| .*$/, '');
    var date = data.date || '';
    var url = data.url || window.location.href;
    var author = data.author || 'Leeyunhe';
    var category = data.category || '';
    var tags = data.tags ? data.tags.split(',').filter(Boolean) : [];
    var description = data.description || '';

    // 若无明确摘要，智能抓取正文首段文字
    if (!description) {
      var postBody = document.querySelector('.post-body');
      if (postBody) {
        var paragraphs = postBody.querySelectorAll('p');
        for (var p = 0; p < paragraphs.length; p++) {
          var t = paragraphs[p].textContent.trim();
          if (t.length > 25) {
            description = t;
            break;
          }
        }
      }
    }
    if (!description) {
      description = '探索技术架构细节与深度实践，欢迎长按扫码查阅完整技术博文与工程源码。';
    }

    var W = 750;
    var P = 48;
    var contentW = W - P * 2;

    // 创建虚拟画板预计算高度
    var measureCanvas = document.createElement('canvas');
    var mCtx = measureCanvas.getContext('2d');

    // 预计算标题折行
    mCtx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    var titleLines = wrapText(mCtx, title, contentW);
    var titleH = titleLines.length * 48;

    // 预计算金句/导读折行
    mCtx.font = 'normal 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    var descLines = wrapText(mCtx, description, contentW - 56);
    if (descLines.length > 5) {
      descLines = descLines.slice(0, 5);
      descLines[4] = descLines[4].replace(/[\.,，。…\s]+$/, '') + '...';
    }
    var quoteH = Math.max(120, descLines.length * 36 + 60);

    // 计算总高度
    var H = 12 + 65; // 顶部条 + Mac 控制栏
    H += titleH + 20; // 标题
    if (category || tags.length > 0) {
      H += 38; // 分类与标签徽章栏
    }
    H += 34; // 著者与发布日期
    H += 24; // 呼吸分割线
    H += quoteH + 28; // 导读金句卡片
    H += 164; // 二维码与底部指引卡片
    H += 48; // 水印
    H += 20; // 底部留白

    // 绘制正式 Canvas
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // 1. 底板白色卡片
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 2. 顶部初音葱绿到品牌暖橙的流光色带 (8px)
    var grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#fc6423');
    grad.addColorStop(0.4, '#ff8038');
    grad.addColorStop(1, '#39c5bb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 8);

    // 3. Mac 三色拟态圆点 (左) 与极客手记品牌徽章 (右)
    var macY = 46;
    // 红
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath();
    ctx.arc(P + 8, macY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // 黄
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(P + 30, macY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // 绿
    ctx.fillStyle = '#27c93f';
    ctx.beginPath();
    ctx.arc(P + 52, macY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 右侧品牌铭牌
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#8c959f';
    ctx.textAlign = 'right';
    ctx.fillText("LEEYUNHE · 极客技术手记", W - P, macY + 5);
    ctx.textAlign = 'left';

    // 顶部横隔线
    ctx.strokeStyle = '#edf0f2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P, 72);
    ctx.lineTo(W - P, 72);
    ctx.stroke();

    var currentY = 112;

    // 4. 分类与标签胶囊徽章
    if (category || tags.length > 0) {
      var badgeX = P;
      if (category) {
        ctx.font = '600 13px -apple-system, sans-serif';
        var catText = '📂 ' + category;
        var catW = ctx.measureText(catText).width + 20;
        ctx.fillStyle = 'rgba(252, 100, 35, 0.08)';
        ctx.strokeStyle = 'rgba(252, 100, 35, 0.25)';
        drawRoundRect(ctx, badgeX, currentY - 18, catW, 26, 13, true, true);
        ctx.fillStyle = '#fc6423';
        ctx.fillText(catText, badgeX + 10, currentY);
        badgeX += catW + 10;
      }

      var maxTags = Math.min(tags.length, 3);
      for (var tIdx = 0; tIdx < maxTags; tIdx++) {
        var tag = tags[tIdx];
        ctx.font = '500 13px -apple-system, sans-serif';
        var tagText = '#' + tag;
        var tagW = ctx.measureText(tagText).width + 18;
        if (badgeX + tagW > W - P) break;
        ctx.fillStyle = '#f6f8fa';
        ctx.strokeStyle = '#e1e4e8';
        drawRoundRect(ctx, badgeX, currentY - 18, tagW, 26, 13, true, true);
        ctx.fillStyle = '#57606a';
        ctx.fillText(tagText, badgeX + 9, currentY);
        badgeX += tagW + 8;
      }
      currentY += 36;
    }

    // 5. 文章大标题
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1f2328';
    for (var l = 0; l < titleLines.length; l++) {
      ctx.fillText(titleLines[l], P, currentY);
      currentY += 48;
    }
    currentY += 4;

    // 6. 著者与发布日期
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#656d76';
    var metaText = '📅 ' + (date || '近期发布') + '   ·   ✍️ 著者: ' + author + '   ·   🌐 原创技术沉淀';
    ctx.fillText(metaText, P, currentY);
    currentY += 24;

    // 分割线
    ctx.strokeStyle = '#f0f2f5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P, currentY);
    ctx.lineTo(W - P, currentY);
    ctx.stroke();
    currentY += 24;

    // 7. 核心导读金句微卡片
    var quoteBoxY = currentY;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, P, quoteBoxY, contentW, quoteH, 12, true, true);

    // 装饰性左上角大引号
    ctx.font = '72px Georgia, serif';
    ctx.fillStyle = 'rgba(252, 100, 35, 0.16)';
    ctx.fillText('“', P + 16, quoteBoxY + 54);

    // 导读正文
    ctx.font = 'normal 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#334155';
    var textY = quoteBoxY + 38;
    for (var d = 0; d < descLines.length; d++) {
      ctx.fillText(descLines[d], P + 36, textY);
      textY += 36;
    }
    currentY = quoteBoxY + quoteH + 28;

    // 8. 二维码生成与底栏嵌入
    loadQRCode(function() {
      generateQRCode(url, function(qrEl) {
        var footerY = currentY;
        var footerH = 152;

        // 底部微卡片
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        drawRoundRect(ctx, P, footerY, contentW, footerH, 12, true, true);

        // 二维码白底框
        var qrSize = 120;
        var qrBoxX = P + 16;
        var qrBoxY = footerY + (footerH - qrSize) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        drawRoundRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 8, true, true);

        // 绘制二维码图像
        if (qrEl) {
          ctx.drawImage(qrEl, qrBoxX + 6, qrBoxY + 6, qrSize - 12, qrSize - 12);
        }

        // 二维码右侧文字说明
        var textLeft = qrBoxX + qrSize + 22;
        var rightTextY = footerY + 44;

        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('长按识别二维码 · 查阅完整博文', textLeft, rightTextY);

        rightTextY += 28;
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('探索技术全景、源码工程与架构推演', textLeft, rightTextY);

        rightTextY += 26;
        ctx.font = '500 13px -apple-system, "SF Mono", Menlo, Consolas, monospace';
        ctx.fillStyle = '#fc6423';
        var domain = (url.replace(/^https?:\/\//, '').split('/')[0] || 'leeyunhe.github.io') + ' / posts';
        ctx.fillText('🔗 ' + domain, textLeft, rightTextY);

        // 9. 底部极客版权水印
        var watermarkY = footerY + footerH + 34;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('LEEYUNHE TECH BLOG · 坚持深度思考与技术沉淀', W / 2, watermarkY);
        ctx.textAlign = 'left';

        // 导出高清 Data URL
        var resultUrl = canvas.toDataURL('image/png');
        callback(resultUrl);
      });
    });
  }

  // 绑定海报生成交互事件
  function initPostPoster() {
    var triggerBtn = document.getElementById('btn-post-poster');
    if (!triggerBtn) return;

    var modal = document.getElementById('post-poster-modal');
    var closeBtn = document.getElementById('post-poster-close-btn');
    var cancelBtn = document.getElementById('post-poster-cancel-btn');
    var backdrop = modal ? modal.querySelector('.post-poster-backdrop') : null;
    var loadingElem = document.getElementById('post-poster-loading');
    var previewElem = document.getElementById('post-poster-preview');
    var previewImg = document.getElementById('post-poster-img');
    var downloadBtn = document.getElementById('post-poster-download-btn');

    function closeModal() {
      if (!modal) return;
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openModal() {
      if (!modal) return;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (backdrop) backdrop.onclick = closeModal;

    // 键盘 Esc 关闭支持
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
        closeModal();
      }
    });

    var cachedPosterUrl = null;

    triggerBtn.onclick = function() {
      openModal();

      // 如果已有缓存海报直接展示
      if (cachedPosterUrl) {
        if (loadingElem) loadingElem.style.display = 'none';
        if (previewElem) previewElem.style.display = 'flex';
        return;
      }

      if (loadingElem) loadingElem.style.display = 'flex';
      if (previewElem) previewElem.style.display = 'none';
      triggerBtn.classList.add('is-loading');

      var postData = {
        title: triggerBtn.getAttribute('data-title'),
        date: triggerBtn.getAttribute('data-date'),
        url: triggerBtn.getAttribute('data-url') || window.location.href,
        category: triggerBtn.getAttribute('data-category'),
        tags: triggerBtn.getAttribute('data-tags'),
        description: triggerBtn.getAttribute('data-description'),
        author: triggerBtn.getAttribute('data-author') || 'Leeyunhe'
      };

      renderPoster(postData, function(posterUrl) {
        cachedPosterUrl = posterUrl;
        triggerBtn.classList.remove('is-loading');

        if (previewImg) previewImg.src = posterUrl;
        if (downloadBtn) {
          downloadBtn.href = posterUrl;
          var slug = (postData.title || 'post-poster').replace(/[\\/:*?"<>|]+/g, '_');
          downloadBtn.download = 'Leeyunhe-Blog-' + slug + '.png';
        }

        if (loadingElem) loadingElem.style.display = 'none';
        if (previewElem) previewElem.style.display = 'flex';
      });
    };
  }

  // 页面初始化与 PJAX 支持
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostPoster);
  } else {
    initPostPoster();
  }

  window.addEventListener('pjax:success', initPostPoster);
})();
