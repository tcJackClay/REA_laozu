# v29 山门赐福闭环

原始依据：本地更新后客户端 `work/alignment-v13/all.cs`，配置 `work/alignment-v9/runtime/patch/3pfng7c.bin`。提取脚本 `build-clan.py` 可重建配置与布局资源。

## 原逻辑核对

- UIClan是cfg_Sect/RoleSectPart，不是老祖SectV2。UIMain.OnBtn_ClanBtnClicked：673349–673352；FunctionOpen 4为完成2次游历。
- cfg_Sect：7260–7304，3670节点；累计相对arrPos，起点(0,200)，顶部400，DynamicNodeLoader.Init：537832–537891。
- CheckCifuEnoughRes：391170起，正式弟子前N名战力、arrCost资源校验；单点flag0、一键flag1。
- RoleSectPart.RecalculatePropWithSect：910817–910845，属性与iPower分开累积。当前配置无仅品质概率节点，不虚构概率收益。
- 原UIClan、UIClanItem、UIClanItemTips、UIClanOverview、层标签和连线资源纳入布局索引。原Locked状态表示已激活；远期节点不许跳级。

## 本轮修复

接通入口、滚动节点、节点提示、总览、晶矿消耗、单点/一键、保存返回。修正原总览Viewport由运行时调整尺寸导致网页0尺寸：以原Scroll View的810×1091.65区域承载动态属性。真实截图确认文字可见。

战斗统一接入赐福攻击/防御/生命；显示战力不能充当攻击。招生和重生加点纳入1007。毕业存独立clanBaseStats；真实finish-run、刷新、节点升级和弟子详情验证无重复叠加。前N名门槛读取当前属性战力而非过期快照。

## 验证

- test-clan-model.cjs：3685检查通过，含3670节点累计、重复/越级/不足/最大等级拒绝、前N名正式弟子和实时战力。
- test-clan-browser.cjs：20检查通过，包含实际生产战斗伤害、毕业归档升级和刷新、节点总览与返回；无页面/资源错误。
- 功法/长老详情41、组合模型521、组合真实战斗8、弟子复杂效果143、游历闭环24检查通过。
- 官方web_game_playwright_client运行通过，查看山门和总览截图。前端清单CSS片段静态检查无已证实问题，不代表完整无障碍验收。
- 子agent核对源逻辑和实现；指出的旧战力、重生点数、遮罩和返回问题已修复。

## 仍未确认

服务器初始赐福等级未知，网页默认0；一键逐节点激活至资源/门槛不足为本地近似。战斗加成顺序、PVE和取整不是服务器精确还原。资源不足窗口展示真实资源说明，但完整获取目的页未接；0.7秒激活线动画、战力飘字和模拟器逐帧对比未完成。B03/C05保留未完成，不把此轮称为全系统复刻完成。
