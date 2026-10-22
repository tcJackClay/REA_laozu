# v44 攻略四类原简窗

本轮沿总清单D36推进，仅采用本地原APK及更新包静态证据和隔离网页验证。当前SDK adb devices无设备，未新增模拟器截图或原机验收。

## 源触发和显示

- 585131/585153给推荐头像功法24、长老30。409086–409094调用UISeedlingInfo；409285–409290调用UITeacherBriefInfo，不是账号完整养成窗口。顶部Head(49610–49723)是展示组件，无点击handler，现取消先前扩展的按钮。
- UISeedlingInfo 609744–609768：原品质/元素、图标、标题，给定24阶怒气技能原szDesc，滚动置顶；没有升星/购买按钮。
- UITeacherBriefInfo 576060–576071：名字、头像、首配方、30阶两项百分比属性。461883–461894索引clamp(level+1,1,length-1)，数值除100。
- 408447–408461配方只取iMaterial0、iMaterial1和arrProductID[0]。408543–408563实际加载iIconEzID和iIconShapeId，形状按槽宽/144缩放；现使用原图而非普通装备图替代。其点击经408578–408582、410350–410352进入UIEquipInfo(isWear=false)。
- 神通407884–407889、390685–390751用UICommonDesc，按推荐装备共鸣决定当前档，枚举全部档并跳过iType3的level0；已达档数字着色，未来档灰色。标题优先武器形态，其次元素。
- 推荐包法宝405057–405067进入UIEquipInfo，实例位置>=0、handType0，所以IsWear=true，来源451871–451883、451917–451925。它只是推荐实例，不写账号背包。
- UIEquipInfo 741595–741662、742019–742030：当前阶主技能取iProvideSkill，同组iStar>1升阶效果按阶排序，未来阶灰色。820812–820841属性为arrBuffParam原配对，共鸣为iReson；不添加账号长老觉醒或锁定操作。

## 原图形与动态布局

新增UITeacherBriefInfo47节点、UIEquipInfo57节点及56个布局图片引用；复用已有UISeedlingInfo和UICommonDesc。388张原小图/形状图标按Icon→Sprite→来源包导出，每个输出记录bundle、origin、Int64 ID及SHA256。

HorizontalLayoutGroupEx原MonoScript -4745921447586333066以前被通用转换器当成纵排。只在新导出布局标注横排，不更改已有窗口；按原子节点宽高与可见元素数恢复ContentSizeFitter所需动态尺寸。恢复法宝名按原字形advance计算的宽度，使子星阶标签可见。动态说明/列表高度按字数在原槽位测算，滚动可达，尚非Unity实时TMP排版或像素验收。

子窗口保持原攻略及流派，配方法宝再返回同一长老简窗；取消/ESC只关闭当前层。没有账号拥有/解锁/消耗门槛，也不授予推荐装备、属性、神通或奖励。

## 校对、验证与边界

3141模型检查覆盖全部60套推荐、各推荐法宝、原等级/配方/当前共鸣和未来档、合法成员范围、所有388文件与源布局引用；26新浏览器检查覆盖四窗、原图标、无升星控件、三级返回、无存档写入、320宽和低阶灰色。低共鸣和低阶是独立内存fixture，不冒充原推荐方案原值。306攻略模型、19攻略、48详情、24组合、26灵宠详情、29灵宠动作回归，共3619。官方develop-web-game客户端烟测和人工截图检查完成。

子agent strategy_review确认参数、属性、只读、灰色条件和返回无阻断项；其指出的共鸣遮挡/标题星阶和小图来源已修复。对主图疑问追加frame-evidence.json：原Frame active=false、字段对GO引用0、Animator0、Auto_Switch的switcherGOs为空，源码加载图片但未显式激活Frame。现保留源静态状态；运行态仍待原机核对，不把未知视作视觉完成。

原Icon缺1004/1005/1006，属于旧装备100004/100005/100006，未被60攻略或任一长老首配方使用，保留missing与unreachableLegacyEquipment记录，不伪造图。富文本链接提示、神通原动画、其他皮肤/原确认框等继续保留总清单未完成状态。

重建工具：build-strategy-detail-layouts.py、build-strategy-detail-icons.py；验证test-strategy-detail.cjs及test-strategy-detail-browser.cjs。原包与提取骨架不上传；证据随audits/home/v44保存。
