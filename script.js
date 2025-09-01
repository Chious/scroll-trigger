document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // 初始化 Lenis 平滑滾動
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // 將 Lenis 與 GSAP ScrollTrigger 整合
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Frame Animation 設定
  const frameCount = 251; // 從 frame_0001.jpg 到 frame_0251.jpg
  const images = [];
  let imagesLoaded = 0;

  // Canvas 設定
  const canvas = document.querySelector(".hero-canvas");
  const context = canvas.getContext("2d");
  let currentFrameIndex = 0; // 追蹤當前顯示的幀
  let isRendering = false; // 防止重複渲染
  let lastRenderedFrame = null; // 快取最後渲染的幀
  let scrollTriggerInstance = null; // 保存 ScrollTrigger 實例的引用

  // 設定 Canvas 尺寸
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 清除舊的快取（因為尺寸改變了）
    lastRenderedFrame = null;

    // 如果當前有顯示的幀，重新渲染（強制渲染）
    if (images[currentFrameIndex]) {
      isRendering = false; // 重置渲染狀態
      renderFrame(currentFrameIndex);
    }
  }

  setCanvasSize();
  window.addEventListener("resize", setCanvasSize);

  // 預載入所有圖片
  function preloadImages() {
    const loadingIndicator = createLoadingIndicator();

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNumber = i.toString().padStart(4, "0");
      img.src = `./frames/frame_${frameNumber}.jpg`;

      img.onload = () => {
        imagesLoaded++;
        const progress = (imagesLoaded / frameCount) * 100;
        updateLoadingProgress(progress);

        if (imagesLoaded === frameCount) {
          hideLoadingIndicator();
          initFrameAnimation();
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load frame: frame_${frameNumber}.jpg`);
        imagesLoaded++;
        if (imagesLoaded === frameCount) {
          hideLoadingIndicator();
          initFrameAnimation();
        }
      };

      images[i - 1] = img;
    }
  }

  // 創建載入指示器
  function createLoadingIndicator() {
    const loader = document.createElement("div");
    loader.id = "frame-loader";
    loader.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="text-center text-white">
          <div class="mb-4">
            <div class="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <div id="progress-bar" class="h-full bg-white rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          <p class="text-lg font-medium">Loading Frames...</p>
          <p id="progress-text" class="text-sm opacity-75">0%</p>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
    return loader;
  }

  // 更新載入進度
  function updateLoadingProgress(progress) {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    if (progressBar && progressText) {
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    }
  }

  // 隱藏載入指示器
  function hideLoadingIndicator() {
    const loader = document.getElementById("frame-loader");
    if (loader) {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => loader.remove(),
      });
    }
  }

  // 創建幀快取
  function createFrameCache(frameIndex) {
    if (!images[frameIndex]) return null;

    const img = images[frameIndex];
    if (!img.complete || img.naturalWidth === 0) return null;

    // 創建離屏 canvas 作為快取
    const cacheCanvas = document.createElement("canvas");
    const cacheContext = cacheCanvas.getContext("2d");

    cacheCanvas.width = canvas.width;
    cacheCanvas.height = canvas.height;

    const scale = Math.max(
      cacheCanvas.width / img.width,
      cacheCanvas.height / img.height
    );
    const x = cacheCanvas.width / 2 - (img.width / 2) * scale;
    const y = cacheCanvas.height / 2 - (img.height / 2) * scale;

    cacheContext.drawImage(img, x, y, img.width * scale, img.height * scale);

    return cacheCanvas;
  }

  function renderFrame(frameIndex, forceRender = false) {
    // 確保索引在有效範圍內
    frameIndex = Math.max(0, Math.min(frameCount - 1, frameIndex));

    // 如果是同一幀且正在渲染中且不是強制渲染，跳過
    if (frameIndex === currentFrameIndex && isRendering && !forceRender) {
      return;
    }

    if (!images[frameIndex]) {
      console.warn(`Image at index ${frameIndex} not loaded`);
      return;
    }

    const img = images[frameIndex];

    // 確保圖片已完全載入
    if (!img.complete || img.naturalWidth === 0) {
      console.warn(`Image at index ${frameIndex} not fully loaded`);
      return;
    }

    // 防止重複渲染（除非是強制渲染）
    if (isRendering && !forceRender) return;
    isRendering = true;

    // 更新當前幀索引
    currentFrameIndex = frameIndex;

    // 使用 requestAnimationFrame 確保平滑渲染
    requestAnimationFrame(() => {
      try {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = canvas.width / 2 - (img.width / 2) * scale;
        const y = canvas.height / 2 - (img.height / 2) * scale;

        context.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 更新快取為當前渲染的幀
        lastRenderedFrame = createFrameCache(frameIndex);

        console.log(`Rendered frame ${frameIndex}`);
      } catch (error) {
        console.warn(`Error rendering frame ${frameIndex}:`, error);
      } finally {
        isRendering = false;
      }
    });
  }

  // 安全的幀渲染函數 - 用於回滾時
  function safeRenderFrame(frameIndex) {
    frameIndex = Math.max(0, Math.min(frameCount - 1, frameIndex));

    if (images[frameIndex] && images[frameIndex].complete) {
      renderFrame(frameIndex, true); // 強制渲染
    } else if (lastRenderedFrame) {
      // 如果目標幀不可用，使用快取
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(lastRenderedFrame, 0, 0);
      console.log(`Used cached frame for index ${frameIndex}`);
    } else {
      // 最後手段：渲染第一幀
      renderFrame(0, true);
      console.log(`Fallback to frame 0`);
    }
  }

  // 初始化幀動畫
  function initFrameAnimation() {
    // 先渲染第一幀
    renderFrame(0);

    // 創建幀動畫對象
    const frameAnimation = { frame: 0 };

    // 設定 ScrollTrigger - 使用 pin 固定 hero 區域
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "+=300%", // 增加滾動距離來完整播放動畫
      scrub: 0.8,
      pin: true, // 固定 hero 區域
      anticipatePin: 1,
      animation: gsap.to(frameAnimation, {
        frame: frameCount - 1,
        ease: "none",
        duration: 1,
      }),
      onUpdate: function (self) {
        // 確保幀索引在有效範圍內
        const frameIndex = Math.max(
          0,
          Math.min(frameCount - 1, Math.round(frameAnimation.frame))
        );

        // 只有在圖片已載入時才渲染
        if (images[frameIndex] && images[frameIndex].complete) {
          renderFrame(frameIndex);
        }

        // 當動畫進行到 80% 時，開始淡出 hero 內容
        if (self.progress > 0.8) {
          const fadeProgress = (self.progress - 0.8) / 0.2;
          gsap.set(".hero-content", {
            opacity: 1 - fadeProgress,
            y: -50 * fadeProgress,
          });
        } else {
          // 確保在 80% 之前內容是完全可見的
          gsap.set(".hero-content", {
            opacity: 1,
            y: 0,
          });
        }
      },
      onComplete: function () {
        console.log("Frame animation completed");
      },
      onEnterBack: function (self) {
        console.log("Entering back, progress:", self.progress);

        // 根據當前進度計算應該顯示的幀
        const targetFrame = Math.round(self.progress * (frameCount - 1));
        const clampedFrame = Math.max(0, Math.min(frameCount - 1, targetFrame));

        console.log(`Target frame: ${targetFrame}, Clamped: ${clampedFrame}`);

        // 確保 frameAnimation 對象與滾動位置同步
        frameAnimation.frame = clampedFrame;

        // 延遲渲染，確保滾動狀態穩定
        gsap.delayedCall(0.05, () => {
          safeRenderFrame(clampedFrame);
        });
      },
      onLeave: function () {
        console.log("Leaving hero section");
      },
      onEnter: function (self) {
        console.log("Entering hero section, progress:", self.progress);

        // 確保進入時渲染正確的幀
        const targetFrame = Math.round(self.progress * (frameCount - 1));
        const clampedFrame = Math.max(0, Math.min(frameCount - 1, targetFrame));
        frameAnimation.frame = clampedFrame;

        safeRenderFrame(clampedFrame);
      },
    });

    // Hero 內容動畫
    initHeroContentAnimation();
  }

  // Hero 內容動畫
  function initHeroContentAnimation() {
    const tl = gsap.timeline();

    // 導航列動畫
    tl.to(".nav-links", {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "power2.out",
    })
      .to(
        ".logo",
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      )
      .to(
        ".nav-button",
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.8"
      );

    // Hero 標題動畫
    tl.to(
      ".header",
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      },
      "-=0.5"
    );

    // 客戶 Logo 動畫
    tl.to(
      ".client-logos img",
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.8"
    );

    // Join Teams 區域動畫 - 調整為更平滑的入場時機
    gsap.to(".join-teams h1", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".join-teams",
        start: "top 90%", // 更早開始動畫
        end: "top 30%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.to(".join-teams p", {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.3,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".join-teams",
        start: "top 85%", // 稍晚於標題
        end: "top 25%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // 開始預載入圖片
  preloadImages();
});
