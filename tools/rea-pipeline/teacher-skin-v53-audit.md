# v53 长老对应弟子幻化购买闭环

## 原始依据

来源为原APK及已提取更新资源、`work/alignment-v13/all.cs`。本轮无新增模拟器采集。导出UITeacherSkinTip 19节点、UIConsumeConfirm 46节点，16个原Sprite引用去重后新增5张PNG；原包/PPtr保存在teacher-skin-layouts.js。

- TeacherData.IsCanReceiveReward 43973–43984：长老已解锁且ReceiveState未置1；无额外星级门槛。
- TeacherUtility.BuyTeacherSkin 461941–461969：arrStarAffect3的第3/4索引为费用道具及数量；先展示UIConsumeConfirm，关闭确认后再检查余额和请求。
- UITeacherSkinTip 572488–572578：arrStarAffect3[1]指向cfg_Skin；未拥有长老/已购买/可购买三种状态，原属性组件与费用。
- 461306–461321成功回包更新ReceiveState；458325–458344由独立皮肤通知加入所有权。网页版合并为一次本地交易，不模拟服务器。
- TeacherSkinAttrItem 416926–417001：读取Skin.arrAttr，2047仅隐藏展示，值按整数除100显示百分比。原AttrFlex横排间距55，行内间距46、hz_line5×51，动态preferred宽由原字形advance适配。
- UIConsumeConfirm 766179–766234：加入费用资源栏，启用auto_middle并隐藏auto_middle1；确认关闭后才执行回调。按原LayoutElement最小宽913、175/241上下padding补齐浏览器不自动计算的ContentSizeFitter。

## 完整操作链

64位长老按原配置提供弟子幻化：详情缩略待机→原预览→原消费确认→精确扣费→购买标记与Skin所有权同步保存→返回同一预览/长老→弟子换装→详情/布阵/游历战斗共用外观及属性。

确认时再次检查门槛、长老拥有、购买标记、皮肤/货币/费用快照和余额。取消、缺钱、过期确认均不扣费；重复调用/刷新不重复购买。授予的是弟子Skin，不写入长老TeacherSkin换装。已有Skin所有权不重复增加幻化值；购买不自动升级仙姿。已有skinValue缓存只在首次获得时增加iLevelVal，否则沿用现有唯一Skin集合推导。

原特殊幻化动作资源复用现有80角色/96Skin的采样图集，本轮64个Skin均已覆盖。预览与详情启动原idle，关闭/跳转清理rAF，减少动态偏好显示静帧。没有新增战斗加成入口；已穿戴Skin仍通过DiscipleAdvanced进入CombatEffects。

## 验证

722模型检查覆盖全部64个配置与无出售项，含零星解锁、余额不足、功能复核、过期费用、精确消费、重复购买、已有所有权和仙姿不自动升级。

29新浏览器检查包含锁定预览、原生窗口、动态待机、单个真实资源栏、取消、购买、刷新、双属性横排/2047过滤、真实换装和布阵。相同生产战斗快照中，未穿戴时普通攻击100；穿戴Skin3001后原暴击率配置进入正式tick，造成120实际伤害并击败120生命目标，之后原fall播放结束、flowBattleEnd入账并返回胜利事件。对照采用固定随机值，原始未截断伤害由本地公式计算，不能用目标生命上限120声称原服务器暴击倍率。

48详情、26原配方、44弟子页面、24组合返回回归通过。合计893项；官方web-game客户端烟测退出0并已查看截图。子agent源码/实现/四张结果图复核无阻断。所有截图与战斗均为隔离网页fixture，输出在work/rea-pipeline/verification/teacher-skin-v53，并非原APK截图。

## 继续未完成

服务器幻化总值、独立通知顺序和全部奖励来源未等价；累计值继续采用已有离线规则。骨架预览采用现有采样图集的网页取景适配，原1.45上下文缩放/动态排版/关闭动画未做原机逐帧验收。完整长老运营皮肤获取、其余特殊动画和总清单其他系统仍待补，不将B06整体标为完成。
