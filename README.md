# ML-Animation

交互式图神经网络 (GNN) 可视化教学项目。用动画理解 GNN 的每一个关键概念——从图数据基础到消息传递机制，从 GCN 矩阵运算到 GAT 注意力权重。

**[在线演示](https://heisenberg1159.github.io/ML-Animation/)**

## 特性

- **3 个真实图数据案例**：社交网络、分子图 (CH₄)、引用网络 (GCN/GAT/GraphSAGE/GIN/MPNN/ChebNet)
- **图的数学表示**：邻接矩阵 A、特征矩阵 X、度矩阵 D 可切换展示
- **GNN 模型架构**：完整的 Input → GNN Layer → Task Layer 数据流可视化
- **消息传递机制**：4 步交互式动画（初始化 → 构造消息 → 聚合 → 更新），公式歌词式滑动
- **GCN 矩阵运算**：逐元素行×列点积动画，高亮具体运算的行和列，实时显示点积计算过程
- **GAT 注意力对比**：GCN 固定权重 vs GAT 自适应注意力权重可视化
- **3 类应用任务**：节点分类、图分类、链接预测
- **粒子背景**：Canvas 粒子网络动画
- **响应式设计**：桌面 / 平板 / 手机自适应

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/Heisenberg1159/ML-Animation.git
cd ML-Animation

# 启动本地服务器
python -m http.server 8000

# 打开浏览器访问
# http://localhost:8000
```

## 项目结构

```
├── index.html        # 主页面（8 个 Section）
├── styles.css        # 样式（暗色主题 + 响应式）
├── graph.js          # 图数据结构 & SVG 绘制引擎
└── animations.js     # GSAP 动画引擎（滚动触发 + 交互式）
```

## 技术栈

| 技术 | 用途 |
|------|------|
| [GSAP 3.12](https://gsap.com/) + ScrollTrigger | 动画引擎 & 滚动触发 |
| SVG | 图数据可视化 |
| Canvas | 粒子背景 |
| CSS3 | 布局、渐变、响应式 |

## 内容导航

| Section | 内容 |
|---------|------|
| 01 图数据 | 社交网络 / 分子图 / 引用网络三个真实案例 |
| 02 数学表示 | 邻接矩阵 / 特征矩阵 / 度矩阵 |
| 03 为什么 GNN | MLP / CNN / RNN 的局限 vs GNN 优势 |
| 04 模型架构 | GNN 层堆叠架构 + 核心传播公式 |
| 05 消息传递 | 4 步歌词式公式动画 + 图上实时动画 |
| 06 GCN | 逐元素行×列点积动画，高亮运算行列 |
| 07 GAT | 注意力权重计算动画 + GCN/GAT 对比 |
| 08 应用 | 节点分类 / 图分类 / 链接预测 |

## 参考文献

- Kipf & Welling, *Semi-Supervised Classification with Graph Convolutional Networks*, ICLR 2017
- Veličković et al., *Graph Attention Networks*, ICLR 2018
- Hamilton et al., *Inductive Representation Learning on Large Graphs*, NeurIPS 2017

## License

MIT