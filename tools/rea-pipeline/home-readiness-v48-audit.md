# v48 山门建筑状态与可操作提示

按总清单H03/H10回到山门主画面。原资源、原客户端逻辑与隔离网页验证分开记录；未新增模拟器证据，不将所有建筑目的页或完整红点树标成完成。

## 建筑状态原绑定

FunctionOpenElement.cs121–178用任一功能开放决定state0/1；FunctionButton.cs77–87锁定不执行业务，首功能ID提示由FunctionOpenManager.cs195–206及iLockTipType1控制。

SourceHomeReadiness.functions按原UIMain的FunctionButton._stateManager与UIStateSwitcherManager.switcherGOs引用查找目标，替代按路径猜兄弟locker。显式引用为0时，原框架会回退同对象的管理器，宗门大阵正是这一分支；子agent指出初版漏掉该分支，现已修复。

10栋全部mode3：功法2、赐福4、宗门大阵1、坊市13、长老15、福地25、仙盟46使用SingleVisibleSwitcher；未开显示locker，已开items[1]为空，所以不显示任何锁标。古宝3、灵宠52、宝石150使用VisibleSwitcher，锁定同时隐藏整栋祖先和标签，父隐藏优先，即使locker自身active也不可见；开放反向显示父层与标签。没有人为加入缩放替代隐藏。

本轮恢复三栋按原条件开放后的图形，但古宝/灵宠管理/主魂石页目的与操作仍未接，B01/B08/B09明确保持未完成。宗门大阵等此前主动隐藏的独立父层也不因locker验证而标成完整入口。本轮不勾H03整体像素验收。

## 原提示链与可操作条件

- 当前all.cs671678–671703功法注册212/style1，长老注册340/style0、390星级奖励、613共鸣/额外x=-10，赐福200/style0/偏移0。旧home-source/UIMain.cs只注册长老342，不能据旧单文件遗漏更新后的分支。cfg_Reddot、cfg_ReddotStyles给出实际样式，不能把所有提示画成红叹号。
- 原GameApp组件4874935988449324839.reddotSettings(fileID8,pathID-5610697030864737600)追至1pbfp5j/CAB-e899…ReddotSettings。Settings索引9为Bluedot_Arrow，7为ReddotSign_New。导出两套各2节点原Prefab、原图、50×50根与40×39子图，按原右上anchor及调用偏移附于建筑按钮；不新增领取按钮或点击消除。
- all.cs452633–452692、43999–44057：普通材料充足才进入212/342；使用通用碎片走独立提醒，不能混入普通升星入口。长老主入口340汇总341可觉醒/342普通升星，另注册390星级奖励和613共鸣；依据43866–43964及RoleTeacherPart.RefreshResonanceUpgradeReddot复用AM.info/rewards、TeacherAwake.resonance。红样式7的Priority10高于蓝样式9的Priority5；领取后重选仍可操作的分支，不直接全部清空。未解锁时允许专属碎片解锁，通用碎片不解锁；24/30满阶不提示。当前已实现的元素开放过滤保留为网页可玩范围适配，未声称该过滤直接来自这两个Update方法。
- 910742–910756、391170–391220：赐福下一节点的弟子战力及两种资源足够才产生201，200汇总子201。复用实际ClanProgress.check，激活后按新余额/节点重算；不捏造在线活动/服务端待领奖励。
- 原提示不是已读提示：只打开管理页不会清除，实际升级/解锁/激活消耗后才重算，返回与刷新保持一致。

同时修复createHomeModel.gate的arrForceOpen：原普通条件为全满足、ForceOpen为任一满足、ForceOpen2为全满足。用原317的老祖12级或第2天独立条件验证，不改变未知条件fail-closed、平台限制与已有FunctionOpen覆盖。

## 验证与剩余范围

858模型、28新浏览器、48详情、20赐福（含正式战斗属性）、24组合、25觉醒回归，共1003项通过。模型覆盖全部功法/长老的普通/通用/解锁/满阶、10栋双态、7个SingleVisible锁及3个祖先隐藏，不能仅以10项states存在代替状态生效测试。浏览器覆盖真实进入→升级/激活→扣材料→回山门提示消失、无消耗查看不消除、刷新、320宽和源父状态fixture；长老奖励390领取后转觉醒341蓝、觉醒扣料后清除，100经验共鸣613升级消费后清除。source-state fixture是隔离功能开关覆盖，不冒充真实账号解锁或模拟器截图。

strategy_review两轮源码/实现/截图校对完成，修复同对象管理器遗漏后无阻断项。主态/窄屏、特殊父状态和长老红蓝切换截图和官方develop-web-game烟测已查看；无脚本/资源错误。原完整红点树、运营活动、古宝/灵宠/主魂石目的页、云雾等场景动画、原机像素/缓存/服务器数值仍未完成。证据见audits/home/v48。
