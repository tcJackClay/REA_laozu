# 功法、长老详情动态节点修复

依据本地原APK及已提取更新逻辑 work/alignment-v13/all.cs，未新增模拟器或服务端战报。

- 607971–608032：Flex_PropListItem按属性ID-2001切换图标；未解锁当前0/下一配置首值；已解锁取星阶+1/+2；24阶隐藏下一值与箭头。现在直接克隆原Auto_PropList/ListItem及所有子节点，3行使用原485×40矩形、列表间距9，不再用HTML字符箭头。
- 575798–575843：Flex_StarPropsItem按StarCount判断当前档位，背景/星标状态0为激活、1为锁定，锁图仅未达标显示。现在克隆原175×220卡片及图文节点，动态横排在现有父区适配。原宝箱点击函数为空，不能凭图标虚构奖励。
- 607590–607658及574884附近：原功法和长老共用isDisableUniversalFragmentUpgradeConfirm。新增共用存档设置；未勾选时确认/取消，勾选后后续升星直接事务复核；取消不扣费。界面沿用网页确认框，未冒称原MessageBox布局已还原。
- 现有CollectionBonuses→CombatEffects入口继续复用。原阈值按整组最低阶激活，本轮没有再次叠加或写入永久属性。

验证使用独立浏览器存档：test-detail-native-rows18项（3行不重叠、原图标、确认前不扣、取消、精确差额、两系统共享设置、刷新、满阶、ESC、320宽适配）；test-home-details48；test-home-combo-flow24；test-collection-bonuses521；test-collection-battle9。真实游历战斗验证付费17→18阶跨档，保持相同攻击/元素时伤害提高、敌人剩余生命下降，无元素普攻不变。共620项。官方develop-web-game客户端首页烟测；人工打开检查详情、窄屏、满阶和首页截图。

仍待补：完整动态技能/材料节点、原通用确认窗、星级长说明精确表现、皮肤来源与原特殊动画；PVE服务器叠加顺序。没有把B02/B06整体标完成。现有未提交pet-motion-v43提取文件及资产不在本次提交范围。
