# v67 山门原场景图层

仅补山门可视内容及其原入口热区，不扩展深层玩法，不修改经济、战斗或存档结构。工作区未提交的灵宠孵化工作单独保留。

## 来源与坐标

- MainEffect prefab：5xi2i9；skeleton/atlas：2m2am25。原SkeletonGraphic scale=.01，Canvas参考像素单位100。all.cs914138–914140的SpineObject加载回调把实例position/rotation/scale归零/单位化，不能再次叠加prefab的-74与100倍缩放。网页继承UIMain MainEffect节点的原挂点，场景画布1080×2340，中心落在节点中心。
- main_scene为原20秒循环，28原atlas区域、162附件网格；按24fps采样480帧，兼容网格做顶点/颜色插值，不同附件按原序列切换。源文件摘要见source-manifest.json，采样数据gzip约754KB。仅渲染层，不影响存档。
- TransPort.Switch all.cs48703–48724按列表索引钳制；UIMain.RefreshDifficulty 672386–672410选择当前游历或选中难度减1。原列表六组door1–5/red共42层；未在列表内的jing不作为第七档。
- UIMain 3y71i9q及CAB精确外部引用解析42层网格/纹理/变换/颜色/混合与UV参数；对应原Auto_TransPort挂点，不使用CSS圆环替代。
- UIMain.cs1957–1964附加游历热区调用同一个主入口。补回原热区，旧浏览器测试改为明确点击第一个主入口，新增测试独立点击附加区域；并未删除原主入口。

## 尚未完成

传送门当前是原材质基础纹理、网格、颜色和UV流动载体。原粒子的birth/death、UI重播生命周期与专用畸变shader尚未还原，不宣称完整Unity粒子仿真或原机逐像素一致。云雾/浮石、特殊头像与TMP材质、动态活动组、聊天/真实手机验收仍保留在清单。

## 验证

- test-home-effects-source-v67.cjs：33125项帧、网格索引、纹理文件存在检查；480帧/162网格/28区域/42传送门层。断言数量不代表原机操作次数。
- test-home-effects-v67.cjs：37项浏览器检查，含全20秒循环、像素变化、六档/高难度钳制、三档窄屏原点和点击遮挡、返回释放WebGL上下文、低动态偏好、存档不变、附加游历入口；对精确暂存版本另外跑同组37项。
- 整屏41项、详情49项、游历工具闭环24项回归通过；前端检查未发现可证实的高优先级静态问题。
- 官方web-game烟测通过，shot-0.png是工具自动选中的独立动画canvas，背景透明显示为黑色，不是整屏丢失；整屏证据采用本目录独立Playwright全页截图，450/390/360/320均人工查看。
- 原版模拟器emulator-5554本轮重新启动，关闭开屏广告后自动更新至2610221608并完成资源校验，但仍停留启动画面。original-update-only.png是本轮原APK启动截图，明确不作为山门同帧或同尺寸完成证据。视觉关系另沿用用户已有904×1604原山门参考图；网页测试数据为隔离本地角色，没有伪造原账号余额/活动。

生成顺序：build-unity-cab-index.py → extract-home-effects.py（UnityPy环境）→ build-home-motion.cjs（Spine3.8）→ build-home-portals.cjs。资源解包沿用已有APK索引和补丁目录，运行依赖与原APK需另备。
