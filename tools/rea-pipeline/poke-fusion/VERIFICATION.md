# poke 最小闭环验证记录

日期：2026-10-23。验证对象：本分支新入口 `outputs/laozu-web/index.html`、`poke/` 模型/界面/图像、5175服务；不是原站、原APK或真实手机。

## 结果

- 模型25项通过：三种初始伙伴均完成两战与再次抽取；消费、真实伤害、奖励阻塞、刷新幂等、旋转/越界、第二招式施放、收藏唯一性、失败救援、补给防重复、治疗次数和携带增伤。
- 浏览器30项通过：真实鼠标拖入、旋转和移出，奖励回事件，结算收藏，刷新恢复及付费第二轮；触屏点选入包；六导航和420条图鉴；无脚本/资源4xx错误。
- 首战等待自然浏览器计时结束，未用advanceTime替代。第二战及触屏专项用advanceTime加速，模型单独覆盖三种伙伴；不把所有测试都称作自然游玩。
- 390×844主验收；320×568、360×800、450×800检查背包边界及无横向溢出，已打开截图查看。此为Chromium设备尺寸模拟，不是实体手机/Safari验收。
- 659个原包资源与2张新增原站背景逐文件SHA256核对通过。当前app不含自绘SVG、canvas路径/山水建筑或CSS精灵球；只合成已有源图。普通UI格子、面板、边框、血条和文字保留CSS表现。
- develop-web-game官方客户端主页冒烟执行并查看画面与render_game_to_text；它截取canvas区域，不能拿来证明完整页面。下列全页截图由专项浏览器脚本另行采集。
- 前端壳静态启发式69项检查未发现可证实的高优先级问题；不是完整可访问性或安全认证。

机器结果：[模型](verification/model-checks.json)、[浏览器](verification/checks.json)、[资源](verification/asset-checks.json)。

## 可视证据

全部为隔离网页新档截图，无原站账号凭证或用户存档。

|画面|证据|
|---|---|
|据点与六导航|[首页](verification/01-home.png)|
|黑底抽取|[抽取入口](verification/02-draw.png)|
|伙伴及初始背包|[就绪](verification/03-ready.png)|
|自然计时战斗|[第一战](verification/03b-natural-battle.png)|
|第一批奖励|[待整理](verification/04-rewards.png)|
|物品实际入包|[整理完成](verification/05-packed.png)|
|毕业与抽取点|[结算](verification/06-settlement.png)|
|收藏|[收藏结果](verification/07-collection.png)|
|付费再抽取|[第二局](verification/08-second-run.png)|
|小屏|[320宽](verification/09-mobile-320.png)、[360宽](verification/09-mobile-360.png)、[450宽](verification/09-mobile-450.png)|
|触屏选择放置|[触屏专项](verification/10-touch.png)|

## 来源与边界

PokeCatch原5包、物种/招式/属性/裁边表来自用户提供的固定研究包；[运行资源清单](../../../outputs/laozu-web/poke/source-manifest.json)记录输入和输出摘要。

2张场景路径在固定脚本中已存在，本轮从原站公开资源路径补取：[场景清单](../../../outputs/laozu-web/poke/scenes/manifest.json)。它们是2026-10-23取回的字节，不声称等于未保存的2026-10-22背景字节。没有下载或复用原站云服务凭据。

用户指出不要自绘图形后，早期自绘背景/图标已从实现中移除。本目录只保存替换后的最终源图版本，不把早期截图作为交付证据。

本阶段没有原始战斗公式等价承诺。抽取点、卡块形状、冷却、固定敌人、增伤和救援等属于新融合规则；详细见[规格](SPEC.md)。道馆对战/塔、收藏支援、培育进化及工具链仍未完成。

## 接续与Git边界

开发工作区为 `D:/工作/poke-fusion/d`，分支poke；从干净交接提交d8e6c29开始。原main工作区的孵化WIP未带入、未清理。新入口独立存档，不迁移修仙存档。

服务只监听本机5175，保留原5173。主README及页面映射说明了实际入口；旧修仙源文件留作参考，但不再由新index加载。
