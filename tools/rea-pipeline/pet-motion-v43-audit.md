# v43 攻略灵宠原骨架待机接入

对应D40、D45–D48。本轮使用已提取原APK及热更新资源，未新增模拟器录像或服务器战报。输入APK路径/SHA256、完整骨架与图集引用、输出sheet哈希见audits/home/v43/verification-summary.json及provenance.json。

## 原依据与全量提取

- all.cs 649743–649757：Pet.iCreatureID→CreatureView.szResPath，父tran_TranRole、scale1.7、offset(0,0)、isMonster=true。
- 878079–878099、878640–878652：不冻结、朝右、默认idle，设局部scale/offset后SetAnimation(0, idle, true)，mix0。
- UIPetInfo/bg/Top/auto_tranRole原100×100、pivot(.5,.5)、中心锚点和位置(0,-485)不变。不能用该100×100当模型显示外框，也不能按头像统一fit尺寸。
- APK assets/data/35bcavy.bin两Canvas的referencePixelsPerUnit都为100；SkeletonDataAsset.scale约0.01。原Spine3.8 SkeletonGraphic.UpdateMesh会按Canvas.referencePixelsPerUnit缩放顶点，参考[官方3.8源码](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/3.8/spine-unity/Assets/Spine/Runtime/spine-unity/Components/SkeletonGraphic.cs)。这里据原prefab/客户端取0.01×100×1.7，不是按截图任意缩放。
- 73宠物、73不同CreatureView、25种类；40套SkeletonDataAsset的路径与prefab basename不同，必须跟随实际引用。73套骨架/main/dynamic/atlas名称无多源歧义，所有骨架引用为同serialized-file local，所有变换identity、初始flip为0。提取器遇到external骨架引用会拒绝，渲染器遇到未应用变换/Clipping会拒绝，不宣称完整外部Unity解析支持。

## 绘制、接入和返回

原main骨架与dynamic动画用Spine3.8解析，导出真实idle而非idle_atk，完整周期1.333–2.667秒、每周期33–65帧，目标24fps采样。WebGL单个attachment一次indexed mesh绘制，保留mesh变形/绘制次序、slot颜色/透明度及常规blend。修复早期逐三角Canvas copy/扩边造成的眼部网格缝；半透明quad共享边测试检查alpha既不翻倍也无空缝。

输出图集的归一化factor/tx/ty均保留。播放时k=SkeletonDataAsset.scale×CanvasPPU×1.7/factor，宽高=原frame尺寸×k，左上偏移=(-tx×k,-ty×k)，相对原父pivot(.5,.5)摆放，恢复各宠物原生尺寸。输出73份sheet实际尺寸验证全部通过，missingPaths均为空。

WAAPI分帧播放同一原duration，advanceTime驱动同一时钟；帮助开关保存/恢复时间，关闭详情清理animation、actor和media监听，重新打开首帧。减少动态偏好初始和打开期间切换均生效。全部只写展示状态，不写账号宠物、属性、奖励或存档。

## 校对和验证

pet_motion_review只读校对资源引用、原点/缩放、GPU绘制、WAAPI/清理和390/320宽截图；指出的三角接缝与动态减少运动问题均已修正，复审无阻断项。

586模型、29新浏览器、3 GPU、443原宠物预览模型、26宠物预览浏览器、19攻略、48功法/长老详情、24组合返回、18动态详情回归，共1196项通过。73份实际图集尺寸和哈希另行核对，不计入1196。原攻略测试曾误点被面板覆盖的遮罩中心，现改为真实空白区域点击；没有force click或开放穿透。官方develop-web-game客户端烟测完成，已查看首页、Monkey/Piliniu/Bat及窄屏截图。

## 边界与复建

本轮只完成攻略只读详情应使用的原idle循环；为原动画采样WebP，非实时Spine。原材质/粒子、其他8动作的场景触发、宠物管理/养成/图鉴仍未因此完成，不声称原机逐像素等价。

复建顺序：现有UnityPy环境运行extract-pet-motion.py，再node --expose-gc tools/rea-pipeline/render-pet-motion.cjs，最后运行test-pet-motion.cjs、test-pet-raster.cjs、test-pet-motion-browser.cjs。过滤渲染仅写manifest-selected.json，不能覆盖正式73项公共数据。工具依赖现有work/spine-tools的Spine3.8、Chromium与Canvas依赖；原包/原骨架文本不随本次提交上传。
