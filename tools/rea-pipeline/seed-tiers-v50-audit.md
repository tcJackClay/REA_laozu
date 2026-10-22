# v50 功法升星效果原组件

## 原依据

- work/alignment-v13/all.cs452416–452419：SeedlingData.StarDes依次为szStar1Des…szStar4Des。
- 607932–607941：ItemIndex0..3读取说明，index<StarCount激活，文本切换器0/1、星图index×2+(激活?1:0)，仅最后行关闭分隔线。
- HOME_MANAGEMENT_LAYOUTS.uiseedlingupgrade原Auto_LevelUp/ListItem及子节点：行宽871，Meta参考高119；HorizontalLayoutGroup padding Top10/Bottom5、spacing0；星区宽200，说明宽600、字号33、自动换行；列表spacing15、竖直Preferred fitter。
- 原UISpriteSwitcher.AutoSetNativeSize=true。8图在现有资源中完整：第一档45×51、第二档93×51、第三档93×96、第四档93×104，各有明暗；原文本colors[0]=#9C7445、[1]=#928B7D。分隔线859×8、底偏移-14、IgnoreLayout。未激活基色不覆盖说明内部原富文本颜色。

## 实现与边界

sourceSeedTiers克隆原子树，按以上配置恢复图形、布局、颜色和显示状态。移除旧文字星标、整行绿色与HTML边框，图片仍引用原资源，不新增伪造图片。

UnityRect目前不完整计算TMP preferredHeight及ContentSizeFitter；因此在网页用同字号/字体/600宽的离屏元素实测说明高度，行高取max(Meta参考119,图片或文字高度+原padding15)，供现渲染器布局。该下限和字体排版为网页适配，并非已证原机最终行高。尚无新增模拟器截图、服务端或原机逐帧证据，B02/B06不整体完成。

滚动位置只存在当前detail对象，技能子页/通用确认/升阶重绘沿现父对象恢复；关闭、换项新建detail后从顶部开始，不更改存档和属性计算。

## 验证

- test-seed-tier-rows：49浏览器检查，覆盖未解锁/0/5/6/12/18/24阶、4行完整、8图实际URL与原生尺寸、原颜色、最后分隔线、文字不截断、第四档滚动可达、满级隐藏升级、最长可达原文、320宽、技能返回保留滚动及只读状态不变。
- test-detail-progress：24浏览器检查+2560材料分支；test-detail-native-rows18；test-home-combo-flow24；test-collection-battle9实际loop检查。2684项检查/案例通过，控制台和资源请求无错误。
- 官方develop-web-game客户端烟测已运行并打开截图。网页隔离档截图：work/rea-pipeline/verification/seed-tiers-v50/level-0.png、level-6-top.png、level-6.png、level-24.png、longest-narrow.png、smoke/shot-0.png。level-6-top展示首阶激活，其余底部截图是刻意滚到底核对第四档，非漏渲染。
- 子agent strategy_review核对源码、组件字段、实现和截图，无阻断；按其建议补首阶激活的顶部截图。完整原TMP动态排版与特殊动画继续待核。
