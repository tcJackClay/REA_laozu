# 战斗、背包与冒险路线显示对齐（2026-10-23）

本次只调整表现与说明交互，不改融合玩法的冷却、伤害、奖励、存档或抽取规则。

## 已完成

- [x] 战斗朝向：原版 `.ally img` 使用 `scaleX(-1)`，敌方保持原图片朝向；当前画布使用相同翻转，并使攻击位移朝对手方向。
- [x] HP：提取原版 `.hp` 规则，精灵上方显示带高光的粉红条；生命比例大于 20% 时 `#f0607a`，否则 `#d6334f`，关联真实当前 HP。
- [x] 招式：GitHub 开源圆形属性图标 + 中文招式名称同一行；卡块和说明窗均不显示 CD，自动释放的内部冷却保留。
- [x] 道具：奖励和包内仅显示已有原图片；点击/触摸显示名称与实际功能文本，重复点击、点外部、放置、切换步骤或 Escape 可关闭。拖拽影像同样复用图片。
- [x] 冒险路线：复用原版 `tl-rail / timeline / tl-node / tl-link` 和草丛、道具、精灵中心素材；当前节点框、已完成连接线与计数随真实阶段推进。
- [x] 竖屏 320×568、360×844、390×844、450×844 及触摸说明窗定位检查。

## 来源与边界

固定来源为 pokecatch-reference/evidence/source/bundle/app.f5605635e3.js 和 app.4cbef38437.css；取证摘要与原 CSS 规则见 [battle-ui-source.json](battle-ui-source.json)。原版 DOM 证据 `evidence/runtime/live/09-adventure-running.html.txt` 可核对路线图与 mini-hp。

原版 `UI.typeBadge` 使用文字徽标。经用户确认，改用 GitHub [partywhale/pokemon-type-icons](https://github.com/partywhale/pokemon-type-icons) 的 18 个圆形无文字属性 SVG（MIT），固定提交 `fcbe6978c61c359680bc07636c3f9bdc0f346b43`。SVG 原样导入，未自绘、未修改路径或颜色。许可证及逐文件 SHA256 存放于 `outputs/laozu-web/poke/type-icons/`。这套新增素材是用户授权的第三方补充，不标记为 PokeCatch 原素材。

路线使用当前可玩的六个阶段：伙伴→遭遇→奖励→遭遇→奖励→结算。原版多章节长路线不属于当前两战闭环，未虚构更多事件。奖励整理与事件记录共用该次奖励节点，继续进入下一场战斗才推进。

## 验证

- `node tools/rea-pipeline/test-poke-battle-ui.cjs`：23 项专项通过；点击/触摸说明、关闭、入包、两次奖励功能文案、路线 3/6→4/6→5/6→6/6、窄屏定位均通过。
- `node tools/rea-pipeline/test-poke-browser.cjs`：30 项完整闭环通过；含自然计时第一场战斗、鼠标拖拽、触摸放置、刷新与结算收藏、再次抽取。
- `node tools/rea-pipeline/test-poke-theme.cjs`：33 项主题回归通过。
- develop-web-game 官方客户端烟测完成，已查看截图；其截图仅包含画布，整屏验收使用下方独立截图。
- Front-End Checklist 对实际 HP/道具说明 DOM 结构的静态检查未发现高优先级问题，不等同于完整无障碍认证。

截图与测试结果：[battle-ui/checks.json](battle-ui/checks.json)、[战斗](battle-ui/battle.png)、[道具说明](battle-ui/item-tooltip.png)、[320宽](battle-ui/reward-320.png)。专项测试从确定性的本地奖励存档开始，随后使用真实点击与触摸推进；不是原站运行截图，也不代表实体手机验收。

## 圆形属性图标补充验收

`node tools/rea-pipeline/test-poke-type-icons.cjs` 验证 18 张图标均可解码显示、19 个原文件（含 LICENSE）的哈希一致；专项 23 项重新通过。修复本地服务器 SVG MIME，避免 200 响应却破图。截图：[18 属性图集](battle-ui/type-icons.png)。固定图标只替换招式卡的属性标记，其他原版文字属性标签保持原状。

## 整卡属性底色与放大（2026-10-23）

按用户更新：属性底色覆盖整个招式卡（奖励区和已入包一致），图标与名称仍为单行并放大。白色符号保留开源 SVG 原路径，仅派生移除外圆底色的版本，记录于 type-icons/symbols/derivation.json；上游原图与许可保持不变。名称按卡块宽度缩放，狭窄旋转卡仍可点击查看完整名称。23 项专项、30 项完整闭环通过；截图已核对。
