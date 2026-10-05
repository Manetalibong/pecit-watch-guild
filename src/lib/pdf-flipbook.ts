import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { PageFlip } from "page-flip";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ViewerMode = "flip" | "scroll";

type ViewerState = {
  pageFlip: PageFlip | null;
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  aspect: number; // height / width
  baseWidth: number; // viewport width at scale 1
  pageCache: Map<number, string>;
  thumbCache: Map<number, string>;
  renderChain: Promise<unknown>;
  flipPageEls: HTMLElement[];
  currentIndex: number;
  currentMode: ViewerMode;
  scrollObserver: IntersectionObserver | null;
  thumbObserver: IntersectionObserver | null;
  scrollListener: (() => void) | null;
  resizeListener: (() => void) | null;
  resizeTimer: number | null;
  scrollZoom: number;
};

type UiRefs = {
  root: HTMLElement;
  stage: HTMLElement;
  bookHost: HTMLElement;
  scrollHost: HTMLElement;
  scrollInner: HTMLElement;
  loading: HTMLElement;
  loadingBar: HTMLElement;
  loadingText: HTMLElement;
  pageLabel: HTMLElement;
  pageInput: HTMLInputElement;
  pageTotal: HTMLElement;
  thumbPanel: HTMLElement;
  thumbGrid: HTMLElement;
  modeFlipBtn: HTMLButtonElement;
  modeScrollBtn: HTMLButtonElement;
};

const stateByRoot = new WeakMap<HTMLElement, ViewerState>();

function getState(root: HTMLElement): ViewerState {
  let state = stateByRoot.get(root);
  if (!state) {
    state = {
      pageFlip: null,
      pdfDoc: null,
      numPages: 0,
      aspect: 1.414,
      baseWidth: 600,
      pageCache: new Map(),
      thumbCache: new Map(),
      renderChain: Promise.resolve(),
      flipPageEls: [],
      currentIndex: 0,
      currentMode: "flip",
      scrollObserver: null,
      thumbObserver: null,
      scrollListener: null,
      resizeListener: null,
      resizeTimer: null,
      scrollZoom: 1,
    };
    stateByRoot.set(root, state);
  }
  return state;
}

function getRefs(root: HTMLElement): UiRefs {
  return {
    root,
    stage: root.querySelector("[data-stage]")!,
    bookHost: root.querySelector("[data-book-host]")!,
    scrollHost: root.querySelector("[data-scroll-host]")!,
    scrollInner: root.querySelector("[data-scroll-inner]")!,
    loading: root.querySelector("[data-loading]")!,
    loadingBar: root.querySelector("[data-loading-bar]")!,
    loadingText: root.querySelector("[data-loading-text]")!,
    pageLabel: root.querySelector("[data-page-label]")!,
    pageInput: root.querySelector("[data-page-input]")!,
    pageTotal: root.querySelector("[data-page-total]")!,
    thumbPanel: root.querySelector("[data-thumb-panel]")!,
    thumbGrid: root.querySelector("[data-thumb-grid]")!,
    modeFlipBtn: root.querySelector("[data-mode-flip]")!,
    modeScrollBtn: root.querySelector("[data-mode-scroll]")!,
  };
}

async function resolvePdfUrl(local: string, remote?: string): Promise<string> {
  try {
    const head = await fetch(local, { method: "HEAD" });
    if (head.ok) return local;
  } catch {
    /* fall back to remote */
  }
  if (remote) return remote;
  return local;
}

/** Render a single PDF page to a JPEG data URL. Cached by index. */
function renderMainPage(state: ViewerState, index: number): Promise<string> {
  const cached = state.pageCache.get(index);
  if (cached) return Promise.resolve(cached);

  // Serialize heavy canvas work so flips/scroll stay responsive.
  const job = state.renderChain.then(async () => {
    if (state.pageCache.has(index)) return state.pageCache.get(index)!;
    if (!state.pdfDoc) throw new Error("PDF not ready");
    const page = await state.pdfDoc.getPage(index + 1);
    const base = page.getViewport({ scale: 1 });
    const targetWidth = 1000;
    const scale = Math.min(2.2, Math.max(1, targetWidth / base.width));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const url = canvas.toDataURL("image/jpeg", 0.82);
    state.pageCache.set(index, url);
    return url;
  });

  state.renderChain = job.catch(() => undefined);
  return job;
}

function renderThumb(state: ViewerState, index: number): Promise<string> {
  const cached = state.thumbCache.get(index);
  if (cached) return Promise.resolve(cached);

  const job = state.renderChain.then(async () => {
    if (state.thumbCache.has(index)) return state.thumbCache.get(index)!;
    if (!state.pdfDoc) throw new Error("PDF not ready");
    const page = await state.pdfDoc.getPage(index + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.max(0.12, 150 / base.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const url = canvas.toDataURL("image/jpeg", 0.7);
    state.thumbCache.set(index, url);
    return url;
  });

  state.renderChain = job.catch(() => undefined);
  return job;
}

function updatePageLabel(refs: UiRefs, state: ViewerState, index: number) {
  const page = Math.min(Math.max(index + 1, 1), state.numPages);
  state.currentIndex = page - 1;
  refs.pageLabel.textContent = `Page ${page} of ${state.numPages}`;
  refs.pageInput.value = String(page);
  refs.pageTotal.textContent = String(state.numPages);
  refs.thumbGrid.querySelectorAll("button").forEach((el, i) => {
    el.classList.toggle("ring-white/80", i === index);
  });
}

/* ------------------------- Flipbook (single page) ------------------------- */

function computePageSize(refs: UiRefs, state: ViewerState) {
  const availW = refs.stage.clientWidth - 40;
  const availH = refs.stage.clientHeight - 32;
  let pageWidth = Math.min(560, availW);
  let pageHeight = Math.round(pageWidth * state.aspect);
  if (pageHeight > availH) {
    pageHeight = availH;
    pageWidth = Math.round(pageHeight / state.aspect);
  }
  return { pageWidth: Math.max(240, pageWidth), pageHeight: Math.max(320, pageHeight) };
}

function setFlipImage(state: ViewerState, index: number, src: string) {
  const el = state.flipPageEls[index];
  if (!el) return;
  const img = el.querySelector<HTMLImageElement>(".page-img");
  if (img && img.src !== src) img.src = src;
}

function renderFlipWindow(state: ViewerState, center: number) {
  const start = Math.max(0, center - 2);
  const end = Math.min(state.numPages - 1, center + 4);
  for (let i = start; i <= end; i++) {
    if (state.pageCache.has(i)) {
      setFlipImage(state, i, state.pageCache.get(i)!);
    } else {
      renderMainPage(state, i).then((src) => setFlipImage(state, i, src)).catch(() => {});
    }
  }
}

function initFlipbook(refs: UiRefs, state: ViewerState) {
  if (state.pageFlip) {
    state.pageFlip.destroy();
    state.pageFlip = null;
  }

  refs.bookHost.innerHTML = "";
  const { pageWidth, pageHeight } = computePageSize(refs, state);

  const bookEl = document.createElement("div");
  bookEl.className = "pdf-flip-book";
  bookEl.style.width = `${pageWidth}px`;
  refs.bookHost.appendChild(bookEl);

  // Build lightweight page elements (images loaded lazily).
  state.flipPageEls = [];
  const pageEls: HTMLElement[] = [];
  for (let i = 0; i < state.numPages; i++) {
    const el = document.createElement("div");
    el.className = "page";
    el.dataset.density = "soft";
    const img = document.createElement("img");
    img.className = "page-img";
    img.alt = `Page ${i + 1}`;
    img.decoding = "async";
    el.appendChild(img);
    pageEls.push(el);
    state.flipPageEls.push(el);
  }

  const flip = new PageFlip(bookEl, {
    width: pageWidth,
    height: pageHeight,
    size: "fixed",
    usePortrait: true, // force single centered page (cover + every page alone)
    showCover: false,
    mobileScrollSupport: false,
    drawShadow: true,
    maxShadowOpacity: 0.5,
    flippingTime: 500,
    swipeDistance: 20,
  });

  flip.loadFromHTML(pageEls);
  flip.on("flip", (e) => {
    const idx = e.data as number;
    updatePageLabel(refs, state, idx);
    renderFlipWindow(state, idx);
  });

  state.pageFlip = flip;

  const target = Math.min(Math.max(state.currentIndex, 0), state.numPages - 1);
  renderFlipWindow(state, target);
  flip.turnToPage(target);
  updatePageLabel(refs, state, target);
}

/* ------------------------------ Scroll view ------------------------------- */

function teardownScroll(refs: UiRefs, state: ViewerState) {
  state.scrollObserver?.disconnect();
  state.scrollObserver = null;
  if (state.scrollListener) {
    refs.scrollHost.removeEventListener("scroll", state.scrollListener);
    state.scrollListener = null;
  }
}

function attachScrollPageSync(refs: UiRefs, state: ViewerState) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const top = refs.scrollHost.scrollTop + 8;
      const pages = refs.scrollInner.querySelectorAll<HTMLElement>(".pdf-scroll-page");
      let best = 0;
      let bestDist = Infinity;
      pages.forEach((el, i) => {
        const dist = Math.abs(el.offsetTop - top);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      updatePageLabel(refs, state, best);
    });
  };
  refs.scrollHost.addEventListener("scroll", onScroll, { passive: true });
  state.scrollListener = onScroll;
}

function initScrollView(refs: UiRefs, state: ViewerState) {
  teardownScroll(refs, state);
  refs.scrollInner.innerHTML = "";
  refs.scrollInner.style.transform = `scale(${state.scrollZoom})`;
  refs.scrollInner.style.transformOrigin = "top center";

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const index = Number(el.dataset.pageIndex);
        const img = el.querySelector<HTMLImageElement>("img");
        if (img && !img.src) {
          renderMainPage(state, index).then((src) => (img.src = src)).catch(() => {});
        }
      }
    },
    { root: refs.scrollHost, rootMargin: "800px 0px", threshold: 0 },
  );

  for (let i = 0; i < state.numPages; i++) {
    const wrap = document.createElement("div");
    wrap.className = "pdf-scroll-page mb-4 w-full";
    wrap.dataset.pageIndex = String(i);
    wrap.style.aspectRatio = `${1 / state.aspect}`;
    const img = document.createElement("img");
    img.alt = `Page ${i + 1}`;
    img.decoding = "async";
    img.className = "w-full h-full object-contain rounded-lg shadow-panel ring-1 ring-white/10 bg-white/5";
    if (state.pageCache.has(i)) img.src = state.pageCache.get(i)!;
    wrap.appendChild(img);
    refs.scrollInner.appendChild(wrap);
    io.observe(wrap);
  }

  state.scrollObserver = io;
  attachScrollPageSync(refs, state);

  // Jump to the page the reader was on in flip mode.
  const target = refs.scrollInner.children[state.currentIndex] as HTMLElement | undefined;
  if (target) refs.scrollHost.scrollTop = target.offsetTop - 8;
}

/* ------------------------------ Thumbnails -------------------------------- */

function buildThumbnails(refs: UiRefs, state: ViewerState) {
  refs.thumbGrid.innerHTML = "";
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const btn = entry.target as HTMLElement;
        const index = Number(btn.dataset.index);
        const img = btn.querySelector<HTMLImageElement>("img");
        if (img && !img.src) {
          renderThumb(state, index).then((src) => (img.src = src)).catch(() => {});
        }
      }
    },
    { root: refs.thumbPanel, rootMargin: "300px", threshold: 0 },
  );
  state.thumbObserver = io;

  for (let i = 0; i < state.numPages; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.index = String(i);
    btn.className =
      "relative shrink-0 rounded-md overflow-hidden ring-2 ring-transparent hover:ring-white/40 transition-all bg-white/10";
    btn.style.height = "96px";
    btn.style.width = `${Math.round(96 / state.aspect)}px`;
    btn.setAttribute("aria-label", `Page ${i + 1}`);
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.className = "h-full w-full object-cover block";
    btn.appendChild(img);
    btn.addEventListener("click", () => goToPage(refs, state, i));
    refs.thumbGrid.appendChild(btn);
    io.observe(btn);
  }
}

/* ------------------------------- Navigation ------------------------------- */

function goToPage(refs: UiRefs, state: ViewerState, index: number) {
  const clamped = Math.min(Math.max(index, 0), state.numPages - 1);
  if (state.currentMode === "flip" && state.pageFlip) {
    renderFlipWindow(state, clamped);
    state.pageFlip.turnToPage(clamped);
  } else {
    const el = refs.scrollInner.children[clamped] as HTMLElement | undefined;
    if (el) refs.scrollHost.scrollTo({ top: el.offsetTop - 8, behavior: "auto" });
  }
  updatePageLabel(refs, state, clamped);
}

function setMode(refs: UiRefs, state: ViewerState, mode: ViewerMode) {
  state.currentMode = mode;
  refs.modeFlipBtn.classList.toggle("bg-white/15", mode === "flip");
  refs.modeScrollBtn.classList.toggle("bg-white/15", mode === "scroll");
  refs.bookHost.classList.toggle("hidden", mode !== "flip");
  refs.scrollHost.classList.toggle("hidden", mode !== "scroll");

  if (mode === "flip") {
    teardownScroll(refs, state);
    initFlipbook(refs, state);
  } else {
    if (state.pageFlip) {
      state.pageFlip.destroy();
      state.pageFlip = null;
    }
    initScrollView(refs, state);
  }
}

function wireControls(refs: UiRefs, state: ViewerState, pdfUrl: string, title: string) {
  refs.root.querySelector("[data-action-prev]")?.addEventListener("click", () => {
    if (state.currentMode === "flip" && state.pageFlip) state.pageFlip.flipPrev("top");
    else goToPage(refs, state, state.currentIndex - 1);
  });
  refs.root.querySelector("[data-action-next]")?.addEventListener("click", () => {
    if (state.currentMode === "flip" && state.pageFlip) state.pageFlip.flipNext("top");
    else goToPage(refs, state, state.currentIndex + 1);
  });

  refs.pageInput.addEventListener("change", () => {
    const n = parseInt(refs.pageInput.value, 10);
    if (!Number.isNaN(n)) goToPage(refs, state, n - 1);
  });

  refs.root.querySelector("[data-action-zoom-in]")?.addEventListener("click", () => {
    state.scrollZoom = Math.min(2, state.scrollZoom + 0.1);
    refs.scrollInner.style.transform = `scale(${state.scrollZoom})`;
  });
  refs.root.querySelector("[data-action-zoom-out]")?.addEventListener("click", () => {
    state.scrollZoom = Math.max(0.6, state.scrollZoom - 0.1);
    refs.scrollInner.style.transform = `scale(${state.scrollZoom})`;
  });

  refs.root.querySelector("[data-action-fullscreen]")?.addEventListener("click", async () => {
    if (!document.fullscreenElement) await refs.root.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });

  refs.root.querySelector("[data-action-thumbs]")?.addEventListener("click", () => {
    refs.thumbPanel.classList.toggle("hidden");
  });

  refs.modeFlipBtn.addEventListener("click", () => setMode(refs, state, "flip"));
  refs.modeScrollBtn.addEventListener("click", () => setMode(refs, state, "scroll"));

  const download = refs.root.querySelector<HTMLAnchorElement>("[data-action-download]");
  if (download) {
    download.href = pdfUrl;
    download.download = `${title.replace(/\s+/g, "-")}.pdf`;
  }

  refs.root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      refs.root.querySelector<HTMLButtonElement>("[data-action-next]")?.click();
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      refs.root.querySelector<HTMLButtonElement>("[data-action-prev]")?.click();
    }
  });

  // Rebuild flip layout on resize (debounced) so the single page stays centered and fits.
  const onResize = () => {
    if (state.resizeTimer) window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      if (state.currentMode === "flip" && state.pdfDoc) initFlipbook(refs, state);
    }, 250);
  };
  window.addEventListener("resize", onResize);
  state.resizeListener = onResize;
}

export async function mountPdfFlipbook(root: HTMLElement) {
  const pdfSrc = root.dataset.pdfSrc;
  const remoteFallback = root.dataset.pdfRemote;
  const title = root.dataset.title || "Document";
  if (!pdfSrc) return;

  const refs = getRefs(root);
  const state = getState(root);
  wireControls(refs, state, pdfSrc, title);

  try {
    const url = await resolvePdfUrl(pdfSrc, remoteFallback);
    refs.loadingText.textContent = "Loading document…";
    const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
    state.pdfDoc = doc;
    state.numPages = doc.numPages;

    const first = await doc.getPage(1);
    const base = first.getViewport({ scale: 1 });
    state.baseWidth = base.width;
    state.aspect = base.height / base.width;

    refs.loadingText.textContent = "Preparing…";
    refs.loadingBar.style.width = "60%";
    await renderMainPage(state, 0);
    refs.loadingBar.style.width = "100%";

    refs.pageTotal.textContent = String(state.numPages);
    refs.loading.classList.add("hidden");

    buildThumbnails(refs, state);
    setMode(refs, state, "flip");
  } catch (err) {
    refs.loadingText.textContent =
      "Could not load this PDF. Try Download or run npm run fetch:pdfs.";
    console.error(err);
  }
}

export function initAllPdfFlipbooks() {
  document.querySelectorAll<HTMLElement>("[data-pdf-flipbook-root]").forEach((el) => {
    mountPdfFlipbook(el);
  });
}
