# v57 原老祖皮肤预览及奖励逐层查看

本轮来源：提供APK、既有更新资源和work/alignment-v13/all.cs。未采集模拟器/服务器；所有浏览器截图与交互使用隔离网页测试档。

## 原逻辑与实现

- AncestorSkinData 455748/455769默认StarLevel=-1；455798–455802收集非空属性。UIAncestorSkinPreview 855310–855324按clamp(max(level,0)+1,1,length-1)取值，未拥有显示首档；属性值除100显示百分比。456060–456096按等级阈值选择技能/CreatureView，855353–855368显示当前BattleSkill.szDesc。
- 855395–855402以原CreatureView.szResPath、isMonster=true、scale=.85、零偏移、非冻结加载；855302–855307关闭释放。原22节点、2列345×34网格/100×21间隔、原颜色/名称竖排；技能组件IsCanClick/IsShowName/IsShowPorp均0，不臆造技能按钮。
- GameUtility391624–391640：subclass16先查GoodsFragments直接ID，再查arrUpgrade/arrUpgrade2首材料；无配置的111001/113001仍通用预览。导出4 Ancestor、24 BattleSkill、12 CreatureView和8图标，缺失0。
- 动画由原prefab→SkeletonDataAsset外部CAB+PathID→主骨架/atlas/texture链提取。Unity Int64引用输出为字符串，保留来源路径、SHA256和缩放。原Spine3.8加权网格及混合，经GPU逐行采样24fps/320×420后导出WebP；网页按逆采样比例还原坐标。仅idle，非实时Spine/原Unity shader等价实现。大帝三阶段均指向同一零时长剪影，生成单帧并防止frameAt除0。关闭/脱离DOM清理动画，支持减少动态效果和advanceTime。
- UIReward 617149–617157原SetTipsMarks(2)、SetID(Goods,id,prizeNum)且无SID；419047–419050清数量。点击物品打开只读详情，关闭返回原奖励；未开礼包使用原箱型，可继续查看子项，隐藏数量/使用/库存；功法/长老Tip隐藏Q模块（574027），动作层同时禁止购买/升级/觉醒/换装旁路。
- 617046–617065原关闭时逐项PlayFlyEffect、释放缓存、清单与关闭回调。本地奖励已在打开结果前入账，确认只清缓存。400844–400847无映射则不播放，dump唯一显式401064为goods88→effect1；本轮未臆造所有物品飞向资源栏。

## 验证

- test-ancestor-preview-model.cjs：132原等级/配置案例，阈值/属性/图标/原不可点击标记与无状态改写。
- test-ancestor-motion.cjs：12原造型清单、图片尺寸、缩放/有限坐标、64位来源ID、SHA256、循环边界和3零时长剪影。
- test-ancestor-preview-browser.cjs：125项，4配置×未拥有/18/30，真实入口、原值/模型、idle或静态、减少动态效果、Escape清理和来源仓库、无消费/解锁/异常/404。
- test-warehouse-reward.cjs：52项。实际314/303/305/311/610使用、一次扣费/一次入账、奖励专用详情/返回/确认；529→650未开自选箱→子魂石→箱→奖励并重载不重发。老祖奖励仅注入缓存fixture，不声称GoodsUse真实授予老祖。
- 既有回归854仓库模型；23仓库、27专用详情、48功法/长老、27古宝、12资源、29弟子皮肤、13正式战斗组合，共179浏览器项。组合升级改变正式tick伤害、非对应中性攻击不变、重复渲染不叠加。
- 官方develop-web-game客户端退出0；已查看smoke/shot-0.png、101001--1.png、103002--1.png、103003-30.png和nested-reward-box.png。路径work/rea-pipeline/verification/{ancestor-preview-v57,warehouse-reward-v57}。
- 子agent源码及最终四张截图复核无阻断；原机模型大小/遮挡/节奏与运行时资源替换仍待动态对照。

## 未完成边界

S07仍未整体完成：月卡、兑换真实入口、原飞入/粒子时间线、服务器消息时序/概率待补。老祖真实养成/穿戴/战斗效果未由本轮预览实现；完整原机动态/Unity shader/像素验收待核。原长老运营造型来源仍待补。
