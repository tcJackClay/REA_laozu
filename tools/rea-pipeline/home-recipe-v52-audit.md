# v52 功法/长老详情与原配方组件

本轮复核功法/长老详情、门槛、材料消费、组合最低星级跨档与实际战斗链，补齐长老详情剩余的原配方图形组件。依据为原APK/更新资源导出的HOME_MANAGEMENT_LAYOUTS、TEACHER_AWAKE_LAYOUTS、DETAIL_SECONDARY_LAYOUTS，以及 `work/alignment-v13/all.cs`；本轮无新增模拟器采集。

## 本轮修改

- 长老红装入口的Auto_Equip、未解锁配方及UIColoursEquipTip的三个原EquipSmallItem，恢复原品质框、iIconEzID小图、形状角标、元素与武器标识；移除HTML图片/名字替代。EquipFormulaItem原逻辑408447–408466只取iMaterial0、iMaterial1和首产物，不把所有材料列误当当前窗口内容。
- 原EquipSmallItem.SetData 408543–408563按组件宽/144缩放形状，传入teacherId/equipId。EquipPropAllWidget.Refresh 67982–68047仅对长老arrEquip包含的装备追加去重arrEquipWeapon；修复孙悟空24104/140104缺少“斗”标识。
- 当前原Prefab中这些小图IsCanClickTips=0；保持不可单独点击，红装区域按钮仍打开配方主窗。关闭或ESC回同一长老及组合成员范围，查看不扣费、不赠送、不修改携带。
- 修复通用Image尺寸覆盖误伤配方加号/等号；新增显式imageBorder用于替换小图时避免继承占位default_sprite的九宫格，未指定的旧图片仍按原分支渲染。

## 功能和实战验证

26项新增浏览器检查；48详情、24组合返回/门槛/过期确认、521组合规则及元素限制、9正式游历战斗、8九宫格回归，共636项通过。组合已由CollectionBonuses进入正式CombatEffects，本轮保留唯一入口，不重复增加第二套属性：真实支付升星跨档后同元素伤害增加、敌方余血降低，中性普攻保持不变。

官方web-game客户端烟测退出0，截图已查看。新增浏览器截图在 `work/rea-pipeline/verification/home-recipe-v52`；全部为隔离网页fixture，非原APK画面。子agent两轮源码/实现/截图校对，发现并复核修正长老附加武器标签遗漏，最终无新增阻断问题。

## 未完成边界

功法/长老并非整体像素验收完成：原机动态排版、完整特殊动画/皮肤获取、原服务器PVE计算顺序仍待核。红装说明内动态文字/属性行仍有网页适配；本轮只将配方小图区域恢复原组件。不把保存配置或静态展示当作实际战斗证明。
