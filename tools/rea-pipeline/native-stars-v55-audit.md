# v55 功法与长老原星阶/碎片条及组合实战

## 本轮原始依据

原APK及已提取更新资源、work/alignment-v13/all.cs；本轮无新增原机运行采集。复用home-management-layouts/teacher-awake-layouts内原节点和图片，没有重新画图或增加星级规则。

- StarLevelItem 416347–416354创建maxStarLevel个Flex_StarsItem；416386–416391按clamp(level−index×STAR_STAGE_COUNT,0,STAR_STAGE_COUNT)处理。GameUtility.UpdateStars 390385–390421按GameObjectCollection顺序显示前curStar个、其余隐藏，isSwitch=false。
- UISeedlingUpgrade 607390–607393：24/6=4颗；UITeacherInfo 574479使用MaxStarCount=5。原ListStar尺寸：功法详情65×73，长老详情81×91，组合卡44×49；原HorizontalLayoutGroup居中、间距0。渲染保留六片不同RectTransform，不用字符星和附加数字行。原最大数量、已解锁状态仍沿用原配置和现有事务。
- FragProgressItem 416307–416312按goodsNum/needFragCount显示进度与数量；607411–607417取UpgradeMatList首项。功法未解锁原ProgressBg/Fill/Value恢复；长老原Auto_Frag预制体false且无激活调用，保持隐藏。

## 操作和战斗

本轮显示代码不另建升级/属性事务。按钮继续经HomeModel复核功能门槛、最大阶、费用、余额和过期确认。未解锁去获取、技能/配方、组合成员切换、材料弹窗、关闭返回保留上下文。已有组合属性唯一经CollectionBonuses→CombatEffects，按整组最低阶累计；功法元素开放条件、缺成员停用、反复计算不累加保留。

新增正式游戏tick案例：功法组合其余成员18阶/一成员17阶，真实扣费升到18阶，2009累计300→600；固定同一随机输入.045，正常攻击从未暴击到暴击，实际伤害与敌人HP同步变化。长老既有同元素伤害、敌人HP增加变化以及中性普攻不变继续通过。本地伤害近似和服务器PVE堆叠顺序未知边界没有改变。

## 验证

- test-native-stars163：两系统0/1/5/6/7/17/18/满阶前/满阶，原六片可见数、数量和布局范围，真实5→6扣费刷新、技能/配方返回、组合成员、未解锁隐藏、原碎片条与获取/返回。
- test-detail-progress：2560配置材料案例+24浏览器。
- test-home-details48；test-home-combo-flow24；test-collection-bonuses521；test-collection-battle13。合计3353检查。
- 官方develop-web-game客户端退出0，已实际查看seed-detail、teacher-detail、teacher-combo-max、seed-locked-progress和smoke/shot-0截图。路径work/rea-pipeline/verification/native-stars-v55；生产战斗截图在home-v27/collection-battle。均独立网页fixture，不是原APK截图。
- 子agent原C#/导出树/实现只读复核通过。原机逐像素/动态动画、运营长老皮肤来源、服务器PVE修正仍未完成，B02/B06不整体标完成。
