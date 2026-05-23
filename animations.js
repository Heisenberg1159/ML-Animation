/**
 * animations.js — GSAP 动画引擎
 * 歌词式公式滑动 + 矩阵计算动画同步
 */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ===== 导航高亮 =====
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onEnter: () => highlightNav(sec.id),
      onEnterBack: () => highlightNav(sec.id),
    });
  });
  function highlightNav(id) {
    navLinks.forEach(a => a.style.color = a.getAttribute('href') === '#' + id ? '#00d4ff' : '');
  }

  // ===== Hero 动画 =====
  gsap.from('.hero-title .hero-line', {
    y: 60, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
  });
  gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 0.8, delay: 0.5 });
  gsap.from('.hero-desc', { y: 30, opacity: 0, duration: 0.8, delay: 0.7 });
  gsap.from('.stat', { y: 40, opacity: 0, duration: 0.6, stagger: 0.15, delay: 1 });
  gsap.from('.scroll-cta', { opacity: 0, duration: 1, delay: 1.5 });

  // ===== 通用 section-header 动画 =====
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.from(header.children, {
      scrollTrigger: { trigger: header, start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
    });
  });

  // ===== Section 1: 示例卡片 =====
  gsap.from('.example-card', {
    scrollTrigger: { trigger: '.examples-grid', start: 'top 75%' },
    y: 60, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
  });
  ['#social-graph', '#molecule-graph', '#citation-graph'].forEach(sel => {
    const svg = document.querySelector(sel);
    if (!svg) return;
    ScrollTrigger.create({
      trigger: svg, start: 'top 80%', once: true,
      onEnter: () => {
        gsap.from(svg.querySelectorAll('.svg-node'), {
          scale: 0, opacity: 0, duration: 0.5, stagger: 0.08,
          ease: 'back.out(2)', transformOrigin: 'center center',
        });
        gsap.from(svg.querySelectorAll('.svg-edge'), {
          strokeDasharray: '200', strokeDashoffset: '200',
          duration: 0.8, stagger: 0.05, ease: 'power2.out',
        });
      },
    });
  });

  // ===== Section 2: 矩阵 =====
  gsap.from('.rep-graph-side', {
    scrollTrigger: { trigger: '.rep-container', start: 'top 75%' },
    x: -60, opacity: 0, duration: 0.8, ease: 'power2.out',
  });
  gsap.from('.rep-matrix-side', {
    scrollTrigger: { trigger: '.rep-container', start: 'top 75%' },
    x: 60, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
  });
  ScrollTrigger.create({
    trigger: '#adj-grid', start: 'top 80%', once: true,
    onEnter: () => {
      gsap.from('#adj-grid .matrix-cell', {
        scale: 0, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'back.out(1.5)',
      });
    },
  });

  // ===== Section 3: Why GNN =====
  gsap.from('.why-card', {
    scrollTrigger: { trigger: '.why-grid', start: 'top 75%' },
    y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out',
  });
  gsap.from('.why-item', {
    scrollTrigger: { trigger: '.why-grid', start: 'top 65%' },
    x: -30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
  });

  // ===== Section 4: 架构图 =====
  gsap.from('.arch-layer', {
    scrollTrigger: { trigger: '.arch-diagram', start: 'top 75%' },
    y: 40, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out',
  });
  gsap.from('.arch-arrow', {
    scrollTrigger: { trigger: '.arch-diagram', start: 'top 75%' },
    scale: 0, opacity: 0, duration: 0.4, stagger: 0.15, delay: 0.3, ease: 'back.out(2)',
  });
  document.querySelectorAll('.arch-layer').forEach((layer, i) => {
    layer.addEventListener('click', () => {
      gsap.to(layer.querySelector('.arch-box'), {
        scale: 1.05, duration: 0.15, yoyo: true, repeat: 1,
      });
    });
  });
  gsap.from('.formula-box', {
    scrollTrigger: { trigger: '.arch-formula', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
  });

  // ========================================================
  //  Section 5: 消息传递 — 歌词式动画
  // ========================================================
  const MP_STEPS = ['init', 'msg', 'agg', 'upd'];
  let mpCurrentIdx = -1;
  let mpPlaying = false;
  let mpTimeline = null;

  function mpActivateLine(idx) {
    const lines = document.querySelectorAll('#mp-lyrics .lyric-line');
    lines.forEach((line, i) => {
      line.classList.remove('active', 'done');
      if (i < idx) line.classList.add('done');
      if (i === idx) line.classList.add('active');
    });
    // 滚动到当前行
    if (lines[idx]) {
      lines[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function mpAnimateStep(step) {
    const svg = document.getElementById('mp-graph');
    if (!svg) return;
    const edges = svg.querySelectorAll('.mp-edge');
    const neighbors = svg.querySelectorAll('.mp-node');
    const center = svg.querySelector('.mp-node-center');

    // reset
    gsap.killTweensOf([neighbors, center, edges]);
    gsap.to([neighbors, center], { scale: 1, fill: '', opacity: 1, duration: 0.3 });
    gsap.to(edges, { stroke: 'rgba(0,212,255,0.25)', strokeWidth: 2, strokeDasharray: 'none', strokeDashoffset: 0, duration: 0.3 });

    switch (step) {
      case 'init':
        gsap.to(neighbors, { scale: 1.12, duration: 0.5, stagger: 0.06, ease: 'power2.out' });
        gsap.to(center, { scale: 1.12, duration: 0.5 });
        break;

      case 'msg':
        gsap.to(edges, {
          stroke: '#00d4ff', strokeWidth: 4,
          duration: 0.5, stagger: 0.08, ease: 'power2.out',
        });
        gsap.to(neighbors, { scale: 1.15, duration: 0.4, stagger: 0.06 });
        edges.forEach(edge => {
          gsap.fromTo(edge,
            { strokeDasharray: '5 10', strokeDashoffset: 0 },
            { strokeDashoffset: -30, duration: 1.2, repeat: -1, ease: 'none' }
          );
        });
        break;

      case 'agg':
        gsap.to(edges, { stroke: '#a855f7', strokeWidth: 3, duration: 0.4 });
        gsap.to(center, { scale: 1.35, duration: 0.7, ease: 'power2.out' });
        gsap.to(neighbors, { scale: 0.85, opacity: 0.5, duration: 0.4 });
        break;

      case 'upd':
        gsap.to(center, { scale: 1.25, fill: '#22c55e', duration: 0.5, ease: 'power2.out' });
        gsap.to(edges, { stroke: 'rgba(34,197,94,0.3)', strokeWidth: 2, strokeDasharray: 'none', duration: 0.4 });
        gsap.to(neighbors, { scale: 1, opacity: 1, fill: '#22c55e', duration: 0.4, stagger: 0.05 });
        break;
    }
  }

  function mpGoTo(idx) {
    if (idx < 0 || idx >= MP_STEPS.length) return;
    mpCurrentIdx = idx;
    mpActivateLine(idx);
    mpAnimateStep(MP_STEPS[idx]);
  }

  function mpPlayAll() {
    if (mpPlaying) { mpStop(); return; }
    mpPlaying = true;
    const btn = document.getElementById('mp-play-full');
    if (btn) { btn.textContent = '⏸ 暂停'; btn.classList.add('playing'); }

    mpCurrentIdx = -1;

    function next() {
      if (!mpPlaying) return;
      mpCurrentIdx++;
      if (mpCurrentIdx >= MP_STEPS.length) {
        mpStop();
        return;
      }
      mpActivateLine(mpCurrentIdx);
      mpAnimateStep(MP_STEPS[mpCurrentIdx]);
      mpTimeline = gsap.delayedCall(2.2, next);
    }
    next();
  }

  function mpStop() {
    mpPlaying = false;
    if (mpTimeline) { mpTimeline.kill(); mpTimeline = null; }
    const btn = document.getElementById('mp-play-full');
    if (btn) { btn.textContent = '▶ 播放全部步骤'; btn.classList.remove('playing'); }
  }

  // 绑定事件
  document.getElementById('mp-play-full')?.addEventListener('click', mpPlayAll);
  document.querySelectorAll('#mp-lyrics .lyric-line').forEach((line, i) => {
    line.addEventListener('click', () => { mpStop(); mpGoTo(i); });
  });

  // ScrollTrigger 进入时自动激活第一行
  ScrollTrigger.create({
    trigger: '#message-passing', start: 'top 60%', once: true,
    onEnter: () => mpGoTo(0),
  });

  // ========================================================
  //  Section 6: GCN — 行×列逐元素点积动画
  // ========================================================
  const GCN_STEPS = ['norm', 'ah', 'w', 'act'];
  let gcnCurrentIdx = -1;
  let gcnPlaying = false;
  let gcnAutoTimer = null;
  let gcnActiveTl = null; // 当前正在播放的 GSAP timeline

  // 矩阵数据
  const GCN_DATA = {
    norm: [
      [0.33, 0.25, 0.25, 0.00],
      [0.25, 0.25, 0.00, 0.33],
      [0.25, 0.00, 0.33, 0.25],
      [0.00, 0.33, 0.25, 0.25],
    ],
    H: [
      [0.9, 0.2],
      [0.1, 0.8],
      [0.7, 0.5],
      [0.3, 0.9],
    ],
    W: [
      [0.5, 0.3, 0.8],
      [0.2, 0.7, 0.1],
    ],
  };

  function matMul(A, B) {
    const m = A.length, n = B[0].length, k = B.length;
    const C = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        for (let t = 0; t < k; t++)
          C[i][j] += A[i][t] * B[t][j];
    return C;
  }
  const AH = matMul(GCN_DATA.norm, GCN_DATA.H);
  const OUT = matMul(AH, GCN_DATA.W);
  const OUT_RELU = OUT.map(r => r.map(v => Math.max(0, v)));

  // --- DOM 构建（只做一次，之后不重建） ---
  function renderMat(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const cols = data[0].length;
    el.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
    el.dataset.cols = cols;
    el.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'mat-cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        const v = data[i][j];
        cell.textContent = typeof v === 'number' ? (Math.abs(v) < 0.005 ? '0.0' : v.toFixed(1)) : v;
        el.appendChild(cell);
      }
    }
  }
  renderMat('gcn-adj-vis', GCN_DATA.norm);
  renderMat('gcn-feat-vis', GCN_DATA.H);
  renderMat('gcn-weight-vis', GCN_DATA.W);
  renderMat('gcn-output-vis', Array.from({ length: 4 }, () => Array(3).fill('—')));

  // --- 工具函数 ---
  function matCells(id) { return document.querySelectorAll(`#${id} .mat-cell`); }
  function matCols(id) { return +document.getElementById(id).dataset.cols; }

  function cellAt(id, r, c) {
    const cols = matCols(id);
    return document.getElementById(id).children[r * cols + c];
  }

  function clearCellHL(id) {
    matCells(id).forEach(c => {
      c.classList.remove('row-hl', 'col-hl', 'result-hl', 'zero-hl');
      gsap.set(c, { scale: 1, clearProps: 'boxShadow' });
    });
  }
  function clearAllHL() {
    ['gcn-adj-vis', 'gcn-feat-vis', 'gcn-weight-vis', 'gcn-output-vis'].forEach(clearCellHL);
  }

  function hlRow(id, row, cls) {
    const cols = matCols(id);
    const cells = matCells(id);
    for (let j = 0; j < cols; j++) cells[row * cols + j].classList.add(cls);
  }
  function hlCol(id, col, cls) {
    const cols = matCols(id);
    const cells = matCells(id);
    for (let i = 0; i < cells.length / cols; i++) cells[i * cols + col].classList.add(cls);
  }

  function glowMat(name) {
    document.querySelectorAll('.gcn-mat').forEach(m => {
      m.classList.remove('glow', 'dim');
      m.classList.toggle('glow', m.dataset.mat === name);
      m.classList.toggle('dim', m.dataset.mat !== name);
    });
  }
  function glowTwo(a, b) {
    document.querySelectorAll('.gcn-mat').forEach(m => {
      m.classList.remove('glow', 'dim');
      m.classList.toggle('glow', m.dataset.mat === a || m.dataset.mat === b);
      m.classList.toggle('dim', m.dataset.mat !== a && m.dataset.mat !== b);
    });
  }
  function resetMats() {
    document.querySelectorAll('.gcn-mat').forEach(m => m.classList.remove('glow', 'dim'));
  }

  // 运算面板
  const cpEl = document.getElementById('compute-panel');
  const cpTitle = document.getElementById('compute-title');
  const cpFormula = document.getElementById('compute-formula');
  function showCP(title, html) {
    cpTitle.textContent = title;
    cpFormula.innerHTML = html;
    cpEl.classList.add('show');
  }
  function hideCP() { cpEl.classList.remove('show'); }

  function killTl() {
    if (gcnActiveTl) { gcnActiveTl.kill(); gcnActiveTl = null; }
  }

  // --- 歌词行 ---
  function gcnActivateLine(idx) {
    document.querySelectorAll('#gcn-lyrics .lyric-line').forEach((l, i) => {
      l.classList.remove('active', 'done');
      if (i < idx) l.classList.add('done');
      if (i === idx) l.classList.add('active');
    });
    const el = document.querySelectorAll('#gcn-lyrics .lyric-line')[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // =====================================================
  //  Step 1: 归一化
  // =====================================================
  function animNorm() {
    killTl(); clearAllHL(); hideCP(); resetMats();
    glowMat('norm');
    const cells = matCells('gcn-adj-vis');
    cells.forEach(c => c.classList.add('row-hl'));
    const tl = gsap.timeline();
    gcnActiveTl = tl;
    tl.fromTo(cells, { scale: 1 }, { scale: 1.12, duration: 0.2, stagger: 0.04, yoyo: true, repeat: 1 });
    tl.call(() => showCP('归一化邻接矩阵', 'Ã = A + I，然后 D̃<sup>-½</sup> Ã D̃<sup>-½</sup> 得到对称归一化矩阵'));
  }

  // =====================================================
  //  Step 2: A_norm × H — 逐 cell 行×列点积
  // =====================================================
  function animAH() {
    killTl(); clearAllHL(); hideCP();
    glowTwo('norm', 'feat');

    // output 初始为占位符
    renderMat('gcn-output-vis', Array.from({ length: 4 }, () => Array(3).fill('—')));

    const tl = gsap.timeline();
    gcnActiveTl = tl;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        tl.call(() => {
          clearCellHL('gcn-adj-vis');
          clearCellHL('gcn-feat-vis');
          hlRow('gcn-adj-vis', i, 'row-hl');
          hlCol('gcn-feat-vis', j, 'col-hl');

          const terms = [];
          for (let t = 0; t < 4; t++) {
            const a = GCN_DATA.norm[i][t], b = GCN_DATA.H[t][j];
            if (Math.abs(a) < 0.001) {
              terms.push(`<span class="cf-zero">0×${b.toFixed(1)}</span>`);
            } else {
              terms.push(`<span class="cf-row">${a.toFixed(2)}</span><span class="cf-op">×</span><span class="cf-col">${b.toFixed(1)}</span>`);
            }
          }
          showCP(`计算 H'[$i,$j]`.replace('$i', i).replace('$j', j),
            `${terms.join('<span class="cf-op">+</span>')}<span class="cf-eq">=</span><span class="cf-result">${AH[i][j].toFixed(2)}</span>`);
        });
        tl.call(() => {
          const c = cellAt('gcn-output-vis', i, j);
          c.textContent = AH[i][j].toFixed(1);
          c.classList.add('result-hl');
          gsap.fromTo(c, { scale: 1.5, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
        }, null, '+=0.15');
        tl.to({}, { duration: 0.55 });
      }
    }
    tl.call(() => {
      clearCellHL('gcn-adj-vis'); clearCellHL('gcn-feat-vis');
      showCP('A×H 完成', '聚合了邻居特征的中间表示 H\' ∈ ℝ<sup>4×2</sup>');
    });
  }

  // =====================================================
  //  Step 3: (A×H) × W — 逐 cell 行×列点积
  // =====================================================
  function animW() {
    killTl(); clearAllHL(); hideCP();
    glowTwo('weight', 'output');

    // output 显示 AH（4×2），用于左乘
    renderMat('gcn-output-vis', AH);

    const tl = gsap.timeline();
    gcnActiveTl = tl;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        tl.call(() => {
          clearCellHL('gcn-output-vis');
          clearCellHL('gcn-weight-vis');
          hlRow('gcn-output-vis', i, 'row-hl');
          hlCol('gcn-weight-vis', j, 'col-hl');

          const terms = [];
          for (let t = 0; t < 2; t++) {
            const a = AH[i][t], b = GCN_DATA.W[t][j];
            terms.push(`<span class="cf-row">${a.toFixed(2)}</span><span class="cf-op">×</span><span class="cf-col">${b.toFixed(1)}</span>`);
          }
          showCP(`计算 Z[$i,$j]`.replace('$i', i).replace('$j', j),
            `${terms.join('<span class="cf-op">+</span>')}<span class="cf-eq">=</span><span class="cf-result">${OUT[i][j].toFixed(2)}</span>`);
        });
        tl.to({}, { duration: 0.6 });
      }
    }

    // 最后重建 output 为最终结果 OUT (4×3)
    tl.call(() => {
      clearAllHL();
      renderMat('gcn-output-vis', OUT);
      matCells('gcn-output-vis').forEach((c, idx) => {
        c.classList.add('result-hl');
        gsap.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, delay: idx * 0.04, ease: 'back.out(2)' });
      });
      showCP('线性变换完成', 'Z = (D̃<sup>-½</sup>ÃD̃<sup>-½</sup> · H) × W ∈ ℝ<sup>4×3</sup>');
    });
  }

  // =====================================================
  //  Step 4: ReLU — 逐 cell 检查
  // =====================================================
  function animReLU() {
    killTl(); clearAllHL(); hideCP(); resetMats();
    glowMat('output');

    // 显示 OUT（未激活）
    renderMat('gcn-output-vis', OUT);

    const tl = gsap.timeline();
    gcnActiveTl = tl;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const v = OUT[i][j], rv = OUT_RELU[i][j];
        tl.call(() => {
          const c = cellAt('gcn-output-vis', i, j);
          if (v < 0) {
            c.classList.add('zero-hl');
            showCP(`ReLU(${v.toFixed(2)})`,
              `<span class="cf-zero">${v.toFixed(2)}</span> &lt; 0 → <span class="cf-result">0.0</span>`);
            gsap.to(c, { duration: 0.35, onComplete() {
              c.textContent = '0.0';
              c.classList.remove('zero-hl');
              c.classList.add('result-hl');
            }});
          } else {
            c.classList.add('result-hl');
            showCP(`ReLU(${v.toFixed(2)})`,
              `<span class="cf-row">${v.toFixed(2)}</span> ≥ 0 → <span class="cf-result">${rv.toFixed(1)}</span>`);
            gsap.fromTo(c, { scale: 1.2 }, { scale: 1, duration: 0.25 });
          }
        });
        tl.to({}, { duration: 0.45 });
      }
    }
    tl.call(() => {
      showCP('ReLU 完成 ✓', 'H<sup>(l)</sup> = ReLU(Z) ∈ ℝ<sup>4×3</sup> — 一层 GCN 计算完毕！');
      gsap.fromTo('.gcn-mat[data-mat="output"]',
        { boxShadow: '0 0 0 rgba(34,197,94,0)' },
        { boxShadow: '0 0 28px rgba(34,197,94,0.35)', duration: 0.7, yoyo: true, repeat: 1 });
    });
  }

  // --- 调度 ---
  const GCN_ANIM = { norm: animNorm, ah: animAH, w: animW, act: animReLU };

  function gcnGoTo(idx) {
    if (idx < 0 || idx >= GCN_STEPS.length) return;
    gcnCurrentIdx = idx;
    gcnActivateLine(idx);
    GCN_ANIM[GCN_STEPS[idx]]();
  }

  function gcnPlayAll() {
    if (gcnPlaying) { gcnStop(); return; }
    gcnPlaying = true;
    const btn = document.getElementById('gcn-play-full');
    if (btn) { btn.textContent = '⏸ 暂停'; btn.classList.add('playing'); }
    gcnCurrentIdx = -1;

    function step() {
      if (!gcnPlaying) return;
      gcnCurrentIdx++;
      if (gcnCurrentIdx >= GCN_STEPS.length) { gcnStop(); return; }
      gcnActivateLine(gcnCurrentIdx);
      const key = GCN_STEPS[gcnCurrentIdx];
      GCN_ANIM[key]();

      // 等当前 timeline 播完再下一步
      if (gcnActiveTl) {
        gcnActiveTl.eventCallback('onComplete', () => {
          if (gcnPlaying) gcnAutoTimer = gsap.delayedCall(0.6, step);
        });
      } else {
        gcnAutoTimer = gsap.delayedCall(1.5, step);
      }
    }
    step();
  }

  function gcnStop() {
    gcnPlaying = false;
    killTl();
    if (gcnAutoTimer) { gcnAutoTimer.kill(); gcnAutoTimer = null; }
    const btn = document.getElementById('gcn-play-full');
    if (btn) { btn.textContent = '▶ 播放计算过程'; btn.classList.remove('playing'); }
  }

  document.getElementById('gcn-play-full')?.addEventListener('click', gcnPlayAll);
  document.querySelectorAll('#gcn-lyrics .lyric-line').forEach((line, i) => {
    line.addEventListener('click', () => { gcnStop(); gcnGoTo(i); });
  });

  gsap.from('.gcn-overview', {
    scrollTrigger: { trigger: '.gcn-overview', start: 'top 80%' },
    y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
  });
  ScrollTrigger.create({
    trigger: '#gcn-layer', start: 'top 60%', once: true,
    onEnter: () => gcnGoTo(0),
  });

  // ===== Section 7: GAT =====
  gsap.from('.gat-vs-card', {
    scrollTrigger: { trigger: '.gat-comparison', start: 'top 75%' },
    y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out',
  });
  gsap.from('.gat-step-card', {
    scrollTrigger: { trigger: '.gat-steps-visual', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
  });

  // GAT 注意力动画
  const gatPlayBtn = document.getElementById('gat-play');
  if (gatPlayBtn) {
    gatPlayBtn.addEventListener('click', () => {
      const svg = document.getElementById('gat-attention-vis');
      if (!svg) return;
      const edges = svg.querySelectorAll('.gat-edge');
      const labels = svg.querySelectorAll('.gat-attn-label');
      const tl = gsap.timeline();

      edges.forEach((edge, i) => {
        tl.to(edge, {
          stroke: '#ec4899', strokeWidth: parseFloat(edge.dataset.attn) * 12 + 2,
          duration: 0.4, ease: 'power2.out',
        }, i * 0.3);
        if (labels[i]) {
          tl.to(labels[i], { fill: '#ec4899', scale: 1.2, duration: 0.3 }, i * 0.3);
        }
      });
      tl.to({}, { duration: 0.3 });
      tl.to(edges, { stroke: '#00d4ff', duration: 0.5 });
      tl.to(labels, { fill: '#00d4ff', scale: 1, duration: 0.3 });
      tl.to({}, { duration: 0.3 });
      const center = svg.querySelector('circle[cx="300"]');
      if (center) {
        tl.to(center, { fill: '#22c55e', scale: 1.2, duration: 0.5, ease: 'power2.out' });
      }
      tl.to({}, { duration: 1 });
      tl.to(edges, { stroke: '', strokeWidth: '', duration: 0.5 });
      tl.to(labels, { fill: '#00d4ff', scale: 1, duration: 0.3 });
      if (center) tl.to(center, { fill: '#00d4ff', scale: 1, duration: 0.5 });
    });
  }

  // ===== Section 8: 应用任务 =====
  gsap.from('.app-card', {
    scrollTrigger: { trigger: '.app-grid', start: 'top 75%' },
    y: 60, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
  });
  ScrollTrigger.create({
    trigger: '#app-link-graph', start: 'top 80%', once: true,
    onEnter: () => {
      const pred = document.querySelector('.link-pred');
      if (pred) {
        gsap.fromTo(pred,
          { strokeDashoffset: 0 },
          { strokeDashoffset: -20, duration: 1, repeat: -1, ease: 'none' }
        );
      }
    },
  });

  // ===== 平滑滚动 =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 56 },
          duration: 1, ease: 'power2.inOut',
        });
      }
    });
  });

  // ===== 窗口 resize =====
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
});