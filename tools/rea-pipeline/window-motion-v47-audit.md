# v47 材料确认框原动画及提交时机

继续D44，范围为升星/觉醒材料UIMessageBox，未把所有原窗口动画或特殊造型标成完成。上一轮已推送fd410b3，本轮在其上补实际动画与回调生命周期。

## 真实配置链

build-window-motion.py按GameApp→m_Settings→AnimTempletes逐级校验PPtr的CAB与PathID，不按同名资源猜测。

1. assets/data/35bcavy.bin，UIFrameworkSettings 9190050698666742893，m_Settings(fileID8,pathID1559826722061161138)。
2. external CAB-e899a2c1502ec3fde2ffdba2f32aabc3对应1pbfp5j.bin。该WndCommonSettings开启ID10001、关闭ID10005、延迟开启true、新资源3帧/缓存1帧。
3. AnimTempletes(fileID1,pathID2523404910360376609)指向CAB-9bb781a8608c05f0e877e07269f8d289，即ydb66m.bin的UIAnimationTemplates。该包另一个同名SettingData的关闭ID0不是本次引用，不混用。

输出记录三包来源层、SHA256、CAB与原引用。JS里的Int64引用输出字符串，原曲线保留float值。

## 原动画与交互时机

XGame.UI.Framework/UIWindowAnimationManager.cs70–151、XGame.UI.Animation/UIAnimationNode.cs335–364、661–710、839–941、966–984：原模板10001的透明度和XY缩放从0.2至1，10005从1至0.5；各0.20000000298秒。零端点切线的Hermite曲线等价smoothstep，未使用线性插值或未启用的移动轨道0.5秒。

SourceWindowMotion按浏览器rAF直接求值，无离线采样误差；CSS写入仍受浏览器数值精度约束。开启动画前按实际帧数等待；首次3帧、同页面缓存1帧。中断开启时先复位到单位缩放/初始透明度，再播放关闭模板。轨道完成后再等下一帧，移除弹窗后才执行业务回调，对齐原UIAnimationNode完成判断与UIMessageBox.OnAfterClose顺序。

原UIWindow.Close防重复启动，但UIMessageBox按钮会先改结果：关闭中重复确定不重启动画；确定→取消最终取消，取消→确定最终执行。原背景关闭不写m_Result，故关闭中点背景保持已有确定结果。取消/关闭按钮与网页ESC映射写取消结果。checkbox按源立即写入，并原地更新勾图，避免重绘重播开启动画。

提交仍进入原M.upgrade/AM.upgrade接口，重新检查期望等级/余额/门槛。新渲染器没有发奖或改属性能力。外部移除窗口会清理rAF、媒体监听和待回调，防止离开父窗后意外消费；这是网页生命周期适配。减少动态效果偏好跳至原动画终态，保留移除后提交/取消语义，也单列为可访问性适配。

## 校对与验证

207曲线模型、19定时时序浏览器、16材料框、18动态节点、25觉醒、48详情、24组合流程、24觉醒模型，共381项通过。时序测试使用暂停的Playwright虚拟时钟明确推进rAF；开启/关闭中帧截图为网页受控帧，不冒充原机帧。正常浏览器回归使用真实时钟并等待窗口动画完成，没有删除业务断言。

专项覆盖前0.2秒不扣费、下一帧后提交一次、重复确认、双向改选、背景保留结果、觉醒实际材料消费、缓存帧数、原地勾选、离开销毁及reduced-motion。觉醒模型保留期望等级变化拒绝重复消费测试。SourceWindowMotion状态加入render_game_to_text的source.home.windowMotion，便于后续查时序。

strategy_review独立核对原PPtr链、原配置/曲线、源回调与实现，中间帧截图未见异常；其要求的觉醒动画前后扣费和取消→确定测试已补并通过。官方develop-web-game烟测截图及两张中间态均已查看。仍无原模拟器逐帧对照，不将浏览器帧率、资源缓存时机或服务器回包时延等同原机；神通激活动画和完整皮肤/特殊动作继续待办。
