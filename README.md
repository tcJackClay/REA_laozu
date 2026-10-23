# 我要当老祖 · 浏览器复刻项目

以原 APK 的资源、布局和客户端逻辑为依据，重建离线可玩的网页版本。当前重点是山门整屏视觉与手机适配，游历为核心玩法；本地近似逻辑不等于原服务器实现。

- [详细产品交接文档](tools/rea-pipeline/PRODUCT-HANDOFF.md)：交付基线、产品结构、完成情况、缺口、架构、运行与验收、后续顺序。
- [山门替换与验收总清单](tools/rea-pipeline/HOME-SCREEN-CHECKLIST.md)：逐项记录资源、位置、手机显示和按钮去向。
- [REA 分析及原版采集工具](tools/rea-pipeline/README.md)。
- [历次开发记录](outputs/laozu-web/README.md)：按版本追加，早期描述可能已被后续版本取代，以交接文档及对应最新审计为准。

需要 Node.js。在仓库根目录执行：

```powershell
node outputs/laozu-web/server.cjs
```

打开 http://127.0.0.1:5173/ 。也可双击 `outputs/laozu-web/启动游戏.cmd`。游戏仅监听本机；不需要先重建 APK 分析数据。
