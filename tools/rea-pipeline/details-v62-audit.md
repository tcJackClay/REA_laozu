# v62 功法、长老详情与组合规则复核

本轮依当前请求处理功法/长老，不继续此前候选的灵宠管理页。原APK已提取源码和Prefab为依据，所有运行验证来自隔离网页存档。

## 原依据与修复

1. all.cs49934–49958 SeedlingSkillInfoItem.OpenSkillInfo使用UICommonDesc.Show，分级标题45/#A69336，每级技能原描述后两换行。UICommonDesc原Prefab的Scroll View为773×609.8758，正文TMP40/#9C7445。原网页32字号、额外20边距与h3/article间距移除，保留Viewport树；浏览器行高1.2和字体排版仍属于适配。键盘End可达最后一级，内容点击不关闭，Escape回同功法。
2. all.cs574174–574194的详情/皮肤/全身状态，574785–574805皮肤全身切换用“切换/全身”；574831–574837清空信息时隐藏攻略，574754–574776背景关闭先退出当前预览。网页补正确文案/可见性；原574516主动隐藏故事页签，仍不人为开放。
3. 原框架work/apk-analysis/xgame-source/XGame.FunctionOpen/FunctionOpenNode.cs184–219：NormalOpenConds全满足；ForceOpenConds循环任一通过即break；ForceOpenCondsAnd全满足。all.cs468577–468579分别绑定arrOpenCond/arrForceOpen/arrForceOpen2。cfg_FunctionOpen110/111/112的arrForceOpen为19#元素;20#元素，故功法/长老任一拥有即可强制开放。CollectionOwnership此前仍错误every，现与HomeModel一致，保留开服日、显式状态覆盖。纠正v28旧AND解释及对应测试。

## 实际功能与验证

组合已在CombatEffects.attributes唯一合并，继续使用原SeedlingGroup/TeacherGroup成员和各阶三元组，所有成员最低星阶控制激活，不要求本次携带。没有重复增加战斗属性路径。正式战斗测试通过真实createHomeModel.upgrade扣除专属材料，将一名长老17→18阶后解锁整组下一档；同攻击/元素提高实际伤害和敌人失血。功法对应跨档改变实际暴击；未到档、缺成员或元素显式未开放时无相应加成。

- test-details-v62：19，原说明尺寸/颜色/全部等级/末行/返回，长老两种全身状态/攻略/选中皮肤返回及320宽。
- test-collection-ownership：542，雷邪体分别仅功法、仅长老独立开放，日门槛、拥有、重复奖励/消费；补正确前提完成一次游历的升级fixture，不绕过实际门槛。
- test-collection-bonuses：527，原组/阶门槛、缺成员、实际伤害/暴击、day-one特殊元素组合。
- test-home-details：48；test-home-combo-flow：24；test-collection-battle：13；test-detail-progress：24浏览器+2560原材料分支。旧h3选择器改为当前原字号span，不删除标题内容断言。
- 共3757检查；官方develop-web-game客户端exit0，烟测图及skill-narrow/skill-end/teacher-skin-fullbody/teacher-narrow已查看。

证据work/rea-pipeline/verification/details-v62和原回归各自目录。未新增原模拟器采集，未确认服务器PVE/最终取整，特殊动作与原机像素对齐仍待做，B02/B06不勾整体完成。
