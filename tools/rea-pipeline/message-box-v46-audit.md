# v46 原通用材料确认框

本轮补齐D44中通用材料确认框的原布局与按钮流程，未宣称完成所有特殊动画或原机像素验收。

## 原资源选择

原APK assets/data/35bcavy.bin的gameapp中，UIFrameworkSettings组件9190050698666742893的m_MessageBoxPrefabPath明确指向Game/ImmortalFamily/GameResources/Prefabs/UI/UIMessageBoxNew.prefab，GUID 9aed46c529d18614a9059447a5b2da4d。故使用2ryj67.bin的uimessageboxnew，而不是按名字猜测旧uimessagebox或误用UIConsumeConfirm。导出30节点与8个图片引用，复用已有相同像素图片；原Designer组件引用决定标题、TMP正文、确定/取消/关闭、勾选按钮和勾选图。

可复现导出：build-message-box-layouts.py读取合并原资源索引，并再次断言实际framework路径。证据见audits/home/v46/framework-settings.json与网页布局数据framework字段。

## 源行为与网页接入

- 基础框架work/apk-analysis/xgame-source/XGame.UI.Framework.Box/UIMessageBox.cs 97–105、124–162、175–223及MessageBoxData.cs 52–69：YesNo、默认确定/取消与关闭按钮、允许背景关闭；勾选立即写入，取消不回滚偏好；确定结果在OnAfterClose调用业务回调。
- all.cs574884–574920、607617–607653：已解锁且实际使用通用碎片、未禁用提示时弹框；标题“提示”、共享不再提示设置。392315–392324、388330：原数量/通用材料名/品质颜色，字号46和“是否消耗…补充消耗，进行升星”。
- 578660–578708：觉醒使用第二种材料才确认，独立设置；标题保留默认“系统提示”，原文“确认消耗「材料名称」进行觉醒吗？”。确认后仍验证长老ID、期望等级、解锁/时间门槛与余额。
- SourceMessageBox只负责显示，不授予材料或属性；沿用M.upgrade/AM.upgrade的事务和防重复。先移除确认框再执行本地事务，取消/关闭/背景不执行。checkbox保留一个事件派发入口，修正初次实现的双入口重复切换。
- 原功法详情保留在确认框下；觉醒框保留觉醒页面；成功返回同一详情/觉醒成功窗。ESC是网页逐层返回适配。

## 验证与校对

16新浏览器检查、18原详情动态节点、25觉醒浏览器、48详情、24觉醒模型、24组合流程、9正式战斗循环检查，共164项通过。覆盖勾选立即保存、取消保留偏好但不扣费、背景/ESC返回、确认准确扣费一次、共享与独立偏好、刷新、320宽和正式战斗组合加成。三张专项截图与官方develop-web-game烟测截图已查看；无脚本或图片失败。

strategy_review子agent核对框架/业务源码、Designer引用、实现及截图；其指出的觉醒文案差异已修正并重跑专项验证。原关闭动画时长和TMP逐像素排版尚未复刻：当前先移除弹窗再执行本地事务，不冒充原OnAfterClose动画帧时序或服务器回包。D44其余动态内容、皮肤与特殊动画继续待办。
