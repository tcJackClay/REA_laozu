# v49 功法与长老详情增量

依据：提供APK及已有更新包提取结果、work/alignment-v13/all.cs。此次未取得模拟器运行或服务端战报，不宣称逐帧和服务端数值一致。

## 原逻辑与实现

- all.cs 49906–49929：SeedlingSkillInfoItem使用当前星阶的BattleSkill名字、说明、iIconID。恢复原Auto_Skill整棵树，原标题/怒气技标识、104×104技能按钮及原iIconID图标。说明和标题宽度是网页动态排版适配，非原TMP逐像素证明。
- 49934–49958：点击技能按钮应UICommonDesc，遍历arrAngerSkill全部门槛和技能。首项“1级：解锁激活”，后续“n级：m星激活”，完整原描述可滚动。原错误为UISeedlingInfo仅显示当前一段；既有test-home-details的旧Prefab断言同步修正。
- 574609–574617、607543–607551：材料展示列表通过FillDisplayMaterials生成，不能把实际扣费计划直接画成材料列表。392244–392260插入通用碎片；392286–392312分别确定专属分母与通用可用数/缺口。
- 575975–575980、608142–608147：通用缺口或可用数<=0隐藏，数量只给分子着色；未解锁不使用通用碎片。原112×112 ListItem保留IconItem的112/150缩放，动态装入其_resRefs[2]明确指定的GoodsIconItem_Upgrade，按Goods品质/图标/数量渲染，点击现有材料详情并逐层返回。
- 新materialDisplay只读，不改变payment/upgrade。跨星更新仍由现事务复核等级、解锁条件、余额和通用确认；组合属性仍唯一经过CollectionBonuses→CombatEffects，不在UI中另行永久写入。

## 导出与证据

- build-detail-progress-layouts.py按原引用导出GoodsIconItem_Upgrade：5节点、10图片引用；保留PPtr字符串和RectTransform树。图片按哈希去重引用现有资源。
- build-detail-progress-icons.py覆盖80功法、80长老成本/通用碎片及所有怒气技引用，解析247个原图标，0缺口。原bundle、pathID、SHA256写在detail-progress-icons.js的provenance。
- 图片复核：work/rea-pipeline/verification/detail-progress-v49/seed-after-upgrade.png、teacher-materials.png、teacher-narrow.png、all-skill-levels.png及smoke/shot-0.png。截图均为网页隔离测试档，非原APK截图。

## 验证与边界

- test-detail-progress：2560原配置材料分支案例（160收藏×16条件）、24浏览器检查；原技能窗、全等级说明、跨星技能/图标刷新、精确替代消耗、材料返回、未消费只读、320宽及刷新回山门。
- test-home-details48、test-detail-native-rows18、test-home-combo-flow24、test-collection-bonuses521、test-collection-battle9。后者实际经过游戏战斗loop：付费17→18阶激活组合下一档，同攻击/元素时伤害提升，中性普攻保持不变，敌人生命进一步下降。
- 官方develop-web-game烟测完成；检查截图，无浏览器/资源错误。子agent strategy_review只读复核，指出并修复分母着色差异；其初次“保留0格”建议经完整RefreshUI代码复核已撤回。
- 本轮没有重写已验证的战斗属性逻辑。功法星级效果列表仍网页行，长老完整特殊动画/运营皮肤获取和原机像素/时序核对待做，不将B02/B06整体标完成。
