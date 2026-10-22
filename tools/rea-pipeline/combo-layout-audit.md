# 原组合布局和卡图核对

原资料：home-management-layouts.js中的UISeedlingSuit/UITeacherSuit，all.cs 579163–579210 TeacherItem质量、皮肤、卡图与锁定遮罩；608460–608471功法组合元素；608263–608268升级刷新原有列表。

克隆原ListSuit及ListSuitItem，固定单组1080×780；组间80，尾部250。卡239×369，间距17、左右36、顶部5。动态星阶/效果仍以网页文本绘制，未宣称原机像素验收。功法元素按iActiveFiveElements位掩码生成。列表重建保留纵向和每组横向位置。

extract-teacher-cards.py按皮肤→CreatureView.iPictureID→Icon→Sprite提取原图。选择命中的来源包（apk/patch/web-patch）及pathID，禁止用另一个同名包解码。每次覆盖图片，provenance记录来源、pathID、PNG SHA256。83皮肤映射到82张PNG。2340501、2420501、2440501缺显示引用，保持明确未解决并使用已有头像回退。不是重新绘制或方形头像拉伸冒充原卡图。

九宫格gb_modi2原border左302、右382，合684，目标558。CSS以前撑宽到边框总和。现按目标尺寸分别缩放横/纵border-width，保留border-image原slice。字号框局部加宽避免原字形溢出，没有全局移动原坐标。

子agent combo_layout_review两轮只读源码校对，已采纳其原卡图来源、品质框、遮罩、固定780高度、80间距、元素标识、滚动返回及17间距建议。其最后公式复核通过。提取器无旧PNG缓存，防止新来源配旧图。

验证：test-home-combo-flow 24（原子树、元素图片、成员边界、组内切换、二级返回、升星、滚动保持、锁定同图遮罩、品质外框）；test-home-details48；test-market-browser24；test-sliced-border8。共104项。官方web-game客户端烟测并人工检查首页、功法详情、两种组合页、未解锁长老截图。验证存档隔离；不改用户存档。

继续未完成：长老觉醒、运营皮肤、专用攻略、缺引用卡图及原机精确动画/布局。既有灵脉未提交改动保留并排除本提交。
