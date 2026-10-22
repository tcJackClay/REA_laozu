# 功法与长老组合返回闭环

源输入：work/alignment-v13/all.cs 和已提取 HOME_MANAGEMENT_LAYOUTS；没有新增模拟器采集。

- 572092–572151：长老组合传 suitTeacherId 给 UITeacherInfo.Show。
- 608535–608571：功法组合传 suitSeedlingId 给 UISeedlingUpgrade.Show。
- 572005–572016、608445–608457：组合奖励按配置三元组逐档显示。
- UISeedlingSuit / UITeacherSuit 原始节点早已提取，本轮真正用于组合页；动态卡片仍由网页渲染，不宣称整体原版像素复刻。

修复：组合详情原来左右切换至全收藏列表；二级提示/升星丢失来源范围。现在保留成员上下文，关闭返回同组。功能入口解锁也在升星事务重复校验；通用碎片确认携带旧等级，过期后不再次扣费。

组合效果已有 CollectionBonuses→CombatEffects 接入，本轮复用并做实际付费升星后战斗验证，未重复增加另一套属性。长老从17→18阶跨档后，真实游历循环的同元素攻击伤害变大、敌方剩余生命更低，普通无元素攻击不变。仍保留原 arrTeacherSuitAttrPVE 数据，不推断服务器的修正顺序。

通过：test-home-details 48、test-home-combo-flow 16、test-collection-bonuses 521、test-collection-battle 9、test-home-model 20，共614项。测试均用隔离浏览器/模型存档。截图检查覆盖功法详情、长老详情、两种组合页和首页烟测。原始日志和截图在 work/rea-pipeline/verification/home-combo-flow、home-v27、home-v26；随提交保存检查摘要。

明确未完成：长老觉醒、专用攻略窗、运营皮肤获取、精确PVE；组合动态卡片尚非原Flex布局，功法星阶背景条右侧适配仍需修正。保留工作区既有未提交灵脉改动，未纳入本提交。
