/**
 * 极客博文音频胶囊交互驱动引擎 (Geek Audio Pill Client Engine)
 * 挂载位置: source/js/audio-pill.js
 * 说明:
 * 1. 采用纯原生 HTML5 Audio API，零第三方冗余依赖，极致轻量（~2KB）；
 * 2. 具备互斥排他播放机制（单例播放）：启动任一音频胶囊时自动暂停其它胶囊与全局 APlayer 播放器；
 * 3. 动态 CSS 声波跳跃动画驱动、毫秒级进度条拖拽/点击快进与实时时间戳；
 * 4. 完美支持 Hexo NexT PJAX 无刷新切页与全端响应式。
 */

(function() {
  'use strict';

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function pauseAllAudioPills(exceptPill) {
    var allPills = document.querySelectorAll('.geek-audio-pill');
    for (var i = 0; i < allPills.length; i++) {
      var pill = allPills[i];
      if (pill !== exceptPill) {
        var audio = pill.querySelector('audio');
        if (audio && !audio.paused) {
          audio.pause();
        }
        pill.classList.remove('is-playing');
        var playIcon = pill.querySelector('.icon-play');
        var pauseIcon = pill.querySelector('.icon-pause');
        if (playIcon) playIcon.style.display = 'inline-block';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }
    }

    // 若页面底部常驻网易云音乐 APlayer 正在播放，协同自动暂停以防音频混音冲撞
    try {
      var meting = document.querySelector('meting-js');
      if (meting && meting.aplayer && !meting.aplayer.audio.paused) {
        meting.aplayer.pause();
      }
    } catch (e) {}
  }

  function setupAudioPill(pill) {
    if (pill.dataset.audioInitialized === 'true') return;
    pill.dataset.audioInitialized = 'true';

    var audio = pill.querySelector('.audio-element');
    var controlBtn = pill.querySelector('.audio-control-btn');
    var playIcon = pill.querySelector('.icon-play');
    var pauseIcon = pill.querySelector('.icon-pause');
    var progressWrap = pill.querySelector('.audio-progress-wrap');
    var progressBar = pill.querySelector('.audio-progress-current');
    var currentElem = pill.querySelector('.time-current');
    var durationElem = pill.querySelector('.time-duration');

    if (!audio || !controlBtn) return;

    // 播放 / 暂停切换
    function togglePlay() {
      if (audio.paused) {
        pauseAllAudioPills(pill);
        var playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(function() {
            pill.classList.add('is-playing');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'inline-block';
          }).catch(function(err) {
            console.warn('[AudioPill] Play error:', err);
          });
        }
      } else {
        audio.pause();
        pill.classList.remove('is-playing');
        if (playIcon) playIcon.style.display = 'inline-block';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }
    }

    controlBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlay();
    });

    // 时长就绪更新
    function updateDuration() {
      if (durationElem && audio.duration) {
        durationElem.textContent = formatTime(audio.duration);
      }
    }

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);

    // 播放进度监听
    audio.addEventListener('timeupdate', function() {
      if (!audio.duration) return;
      var pct = (audio.currentTime / audio.duration) * 100;
      if (progressBar) progressBar.style.width = pct + '%';
      if (currentElem) currentElem.textContent = formatTime(audio.currentTime);
      if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    });

    // 播放结束复位
    audio.addEventListener('ended', function() {
      pill.classList.remove('is-playing');
      if (playIcon) playIcon.style.display = 'inline-block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (progressBar) progressBar.style.width = '0%';
      if (currentElem) currentElem.textContent = '0:00';
    });

    // 错误状态反馈
    audio.addEventListener('error', function() {
      pill.classList.remove('is-playing');
      pill.classList.add('is-error');
      controlBtn.title = '音频文件加载失败或网络不可达';
      if (playIcon) playIcon.className = 'fa fa-exclamation-circle';
    });

    // 点击进度条跳转 (Seek)
    if (progressWrap) {
      progressWrap.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!audio.duration) return;
        var rect = progressWrap.getBoundingClientRect();
        var clickX = e.clientX - rect.left;
        var ratio = Math.max(0, Math.min(1, clickX / rect.width));
        audio.currentTime = ratio * audio.duration;
      });
    }
  }

  function initAllAudioPills() {
    var pills = document.querySelectorAll('.geek-audio-pill');
    for (var i = 0; i < pills.length; i++) {
      setupAudioPill(pills[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAudioPills);
  } else {
    initAllAudioPills();
  }

  // PJAX 页面切换与切页清理
  window.addEventListener('pjax:send', function() {
    pauseAllAudioPills(null);
  });
  window.addEventListener('pjax:success', initAllAudioPills);
})();
