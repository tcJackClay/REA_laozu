# 宝可梦 · 行囊探险（poke 分支）

保留原项目的竖屏场景、下方7×6背包和六项导航骨架，使用 PokeCatch 已有图像、物种、招式及属性数据，重建单宝可梦背包探险。没有自行绘制背景、建筑或图标。

当前最小闭环：**免费抽取 → 自动战斗 → 奖励拖拽入包 → 继续第二战 → 结算收藏 → 消耗击败所得抽取点再次抽取**。

- [融合规格](tools/rea-pipeline/poke-fusion/SPEC.md)：确认规则、近似数值、状态和资源来源。
- [页面映射](tools/rea-pipeline/poke-fusion/PAGE-MAP.md)：六导航、场景、按钮与返回。
- [验收清单](tools/rea-pipeline/poke-fusion/ACCEPTANCE.md)：完成项、命令、截图及下一阶段。
- [本轮验证记录](tools/rea-pipeline/poke-fusion/VERIFICATION.md)。
- [原修仙项目交接](tools/rea-pipeline/PRODUCT-HANDOFF.md)：历史基线，不能当作当前 poke 完成清单。

需要 Node.js。在仓库根目录执行：

```powershell
node outputs/laozu-web/server.cjs
```

打开 http://127.0.0.1:5175/ 。也可双击 `outputs/laozu-web/启动游戏.cmd`。可用 PORT 环境变量覆盖端口。仅监听本机；运行不依赖原 REA 目录或原站在线服务。

本分支存档为 `poke-fusion-v1`，不读写修仙存档。刷新回据点，当前探险保留。道馆目前仅为收藏整备页；对战塔、支援、进化、培育、完整工具链和云服务属于后续阶段。

鼠标拖拽卡块入包；触屏也可选中后点格放置。选中物品可旋转、移出；战斗中背包锁定。按 F 全屏，Esc 返回据点。返回据点/隐藏页面时战斗暂停，无离线补算。

验证：`node tools/rea-pipeline/test-poke-model.cjs` 和 `node tools/rea-pipeline/test-poke-browser.cjs`。浏览器测试需要先启动5175及Playwright，详见验收清单。
