# v66 山门视觉修复

## 本轮范围

按照用户的新优先级，仅处理山门整屏图形、位置、间距、遮挡与手机比例；不增加玩法、消耗规则、战斗数值。B02/B06旧详情逻辑保持，工作区未完成的v64灵宠孵化没有混入本提交。

原手机参考：用户提供的904×1604山门截图（codex-clipboard-e619ca03-b823-484c-87a3-af1a6a833f5e.png）。使用其核对整屏视觉关系，不复制账号姓名、余额、活动时限和红点。它是已有原版截图，不是本轮模拟器采集；本轮新证据是原APK静态资源/框架代码与隔离网页截图。

## 原资源与坐标证据

- assets/data/1pbfp5j.bin中1559826722061161138序列化CanvasScalerAdapterSettings：ReferenceResolution=(1080,2340)，min=(1080,1920)，max=(1080,2340)，ScreenMatchValue=0。build-home-visual-layouts.py直接读取并断言，记录source-adaptation.json。
- 原UIMain Auto_GameScene为底部锚定2340高、y=1170，挂RefResolutionAnchorPosAdjuster：adjustValue=100、dir=Bottom、baseResolution=0。原框架RefResolutionAnchorPosAdjuster.cs124–161的不足比例补偿，使16:9下场景整体下移100原始单位，而非单独挪动建筑/标签。此前网页遗漏该运行时调整。现在背景与所有建筑共用同一变换，长屏补偿随比例减小。
- 原UIMainNavs ToggleButton.stateManager→aniRoot.scales=[1,1.1]；文本colors=[#fff5d2,#ffe785]，原diwen/mingzidi仅选中可见。恢复原图，不再对每个图片子节点套统一图标；描边用局部CSS阴影近似原TMP视觉，不冒充已复刻TMP材质/动画。
- FunctionIconManagerSink.GetResPath（all.cs470219起）选普通、small、act、time、limit等组件。导出FunctionIcon/Small/Act/Act2/Time/Limit共32节点和4图片引用；实际图标仍取cfg_FunctionIcon→Icon及已有原图。FunctionIcon同名配置TextAsset与prefab冲突，明确选择16fs02m.bin真实widget。当前有效普通两栏使用原100×100图标、28号名称和120格；原ui_zjm_btnkk颜色alpha=.298039228，折叠使用原ui_main_jt。
- 新手任务克隆原UIMain click_area 461×83与SideQuest图，描述/进度沿原文本节点，替换原先临时HTML徽章。
- 邮件/仓库克隆UIMain Auto_FixBtn内92×91节点及子图/文字；展开沿原图。保留现有三个功能的去向，修复图标/文字间距与导航上沿遮挡。

## 手机适配与验证

仅山门主画面使用动态1920–2340逻辑高；保持1080宽等比显示。390×844得到2337.23逻辑高，360×800按上限2340留少量外边；450×800为1920。非山门页面继续旧1920画布；打开对话框期间不因resize重新绘制输入窗口。没有修改角色、经济或存档结构。

test-home-visual-v66.cjs共41项：四种尺寸的整屏边界、原地图补偿、六导航热区、三个快捷键未被遮挡、侧栏折叠/展开、任务/仓库/功法去向及返回，视觉操作不改存档，实际招生创建游历后刷新显示“游历中”。before图片由HEAD旧提交资源拦截产生，after为当前版本，同尺寸/同隔离数据比较，不是原APK运行对比图。

49项既有首页详情回归通过；官方develop-web-game烟测截图已查看。前端静态检查无高优先级问题，但不能代替实际手机/像素验收。VERIFY_STAGED=1另以Git暂存版本拦截有未提交改动的脚本验证，避免依赖未提交孵化工作。

## 仍缺失的可视内容

清单V07–V10继续未勾：传送门、人物、云水/浮石等MainEffect/粒子尚未接入；特殊头像框/称号与TMP材质；完整动态活动组1/6及组4试炼、组7冲刺的实例/原布局；聊天实际数据、原机同帧和安全区。已定位MainEffect.prefab（5xi2i9）、骨架/atlas（2m2am25）、main_scene原20秒动画，但本轮未将试验单帧图片写入网页，避免把不完整特效算作完成。下一轮应沿这些视觉缺口继续，不回到深层逻辑扩展。
