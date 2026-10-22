# 功法、长老详情与组合战斗 v27

2026-10-22。基于本地原APK和已提取更新包；本轮未新增模拟器录像或服务器战报。

## 完成项

- UISeedlingUpgrade / UISeedlingInfo：原背景、标题、图标、星阶、属性比较、怒气技、四档升星效果、材料栏、升星/解锁/获取按钮、左右切换；材料详情、技能、故事返回原选中项。
- UITeacherInfo：原背景、五行/品质牌、立绘、战力、解锁/未解锁分支、属性比较、五档星级效果、配方、材料、合成/升星、左右切换、全身预览及皮肤选择/返回。未拥有皮肤不能换装或扣款；换装记录与详情展示共用数据。
- 未解锁且材料不足时显示获取按钮；材料足够才显示解锁/合成；满级隐藏消耗区。通用碎片只能用于已解锁对象，确认前不扣资源。实际消耗沿用v26源数组事务。
- 原GetBtn分别对应FunctionJump 1016/1017；保留返回山门导航。详情内次级窗口不意外退出列表。攻略采用cfg_Strategy标题、说明和推荐配置，按arrStrategy有无显示入口。
- 修复UnityRect水平/垂直布局计算未读取子项运行时尺寸的问题。技能说明、升级效果和皮肤列表不再因Prefab零尺寸而空白。
- 新CollectionBonuses统一计算整组最低星阶、0/6/18/24或30档门槛，以及功法组合五行开放掩码（任一匹配已开放五行）。未拥有成员不生效；达成档位累加一次；读取存档即时计算，不往永久属性反复写入。
- CombatEffects.attributes实际消费组合属性，覆盖暴击/命中/闪避、反击/连击、吸血、治疗/护盾和按攻击元素的伤害/抗性等已有战斗计算。战斗快照文本与最终报告增加collectionBonuses记录，方便核对。

## 原逻辑依据

`work/alignment-v13/all.cs`：UISeedlingUpgrade.UpdateLockState/UpdateLevel/UpdateUpgradeState/OnBtn_StoryClicked；UISeedlingInfo.OnUpdateUI；UITeacherInfo.UpdateLockState/InitUnlockInfo/UpdateModelState/ShowSkinListState/RefreshDressBtn；RoleSeedlingPart.GetSeedlingSuitLevel；RoleTeacherPart.GetTeacherSuitLevel；UISeedlingSuit.HasFiveElements；两类Flex_EffecttListItem.OnUpdateUI。

原长老组合方法返回整星，UI用配置门槛/6比较；网页统一用原始星阶比较等价阈值，额外要求成员确实已拥有，避免未拥有对象的0星显示误激活。

导出81个原骨骼立绘，映射82套皮肤。源Prefab→SkeletonDataAsset→骨骼与图集→立绘的引用及输出SHA256保存在assets/teacher-v27/provenance.json。不是根据头像绘制新角色。本轮交付静态原骨骼姿态，不声明已实现长老点击特殊动画。

## 保留的边界

- 本地伤害仍使用既有加法适配；原配置PVE修正数组记录但不擅自认定其服务端叠加顺序。数值近似，未称与服务器逐帧等价。
- 未解析完整的4套皮肤：2340501、2420501、2430102、2440501。其中3套对应CreatureView缺失，另1套中秋嫦娥骨骼引用继续定位；未把对应全身外观列为验收完成，也不授予皮肤。
- 故事、配方、材料、攻略次级弹窗已可用并可返回，但尚未逐像素还原全部专用Prefab。长老故事页原InitShowType隐藏Tab，本轮不强行开启它；原故事文本中的“待补充”照原配置保留。
- 长老觉醒、皮肤获取对应运营活动、Q版幻化购买和特殊动画属于后续子链；本轮没有添加虚假免费获取或线上支付。
- 旧存档未提供明确解锁列表时，沿用原网页目录所有权规则；全新原版账号所有权迁移仍待核对。

## 验证证据

- test-home-details.cjs：41项浏览器检查，包括原Prefab、技能/故事/材料/配方子窗、全身/皮肤返回、未拥有皮肤拒绝穿戴、升星消费及刷新。
- test-collection-bonuses.cjs：521项配置门槛及实际CombatEffects.deal检查；直接断言敌我生命变化、暴击、元素增伤/抗性、缺成员和关闭五行后的效果移除，重复计算不累加。
- test-collection-battle.cjs：8项真实浏览器战斗检查，比较相同随机数及同一灵宠弹丸，断言水系攻击增伤、敌人生命下降且无元素普攻不变。
- test-home-model.cjs：20项事务检查；test-wander-loop.cjs：24项完整事件/奖励/工具闭环；test-effects-browser.cjs：16项事件→真实运行战斗回归。后者显式清空账号组合，隔离其原本要验证的灵宠与事件效果；组合另有专项检查。
- develop-web-game官方客户端烟测；实际查看功法详情、技能、长老详情、全身、皮肤和主画面截图。静态前端检查未发现高优先级问题，不等于全面无障碍认证。
- 浏览器证据使用隔离存档，不覆盖用户当前存档。代表性截图及检查结果保存在audits/home/v27/。

## 重建工具

依次运行build-home-detail-config.py、extract-teacher-portraits.py、render-teacher-portraits.cjs、publish-teacher-portraits.py。Python使用现有UnityPy环境，渲染使用work/spine-tools的本地Spine与Canvas依赖；原APK、更新包、对象索引和已有骨骼文本为本地输入，不随提交上传。未知/缺失引用写入errors.json与unresolvedPortraits，不静默视作成功。
