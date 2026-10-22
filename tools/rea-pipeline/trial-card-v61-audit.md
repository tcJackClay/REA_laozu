# v61 体验卡原窗口、状态通知和每日可领提示

来源：原APK与既有更新bundle、work/alignment-v13/all.cs、MonthlyCard/Recharge/Privilege/FunctionOpen/FunctionIcon/Reddot配置。无本轮原机或服务器采集；true flag、卡状态、日界线、通知均来自明确标注的隔离网页fixture。

## 不凭方法名推断开放条件

474418–474427月卡StateNtf更新原字段后注册并尝试1010/UITryLongCard，474767–474771游历难度通知get_iDifficulty()==2再尝试。440301–440312要求本日未展示且Function333开；333配置为4#2;1001#TryLongCard、arrPlatformVers=[201]，468851–468859的4表示GetPassDifficulty(0)>=2。

474747–474764虽然计算type2/3且ExpireTime!=0的购买历史result，但474763无条件SetValueState("TryLongCard", false)，474744调用丢弃返回值。此轮保留false，绝不将result取反作为自然显示资格。当前原资源不能证明“没有买过就弹”。网页serverFlags是客户端状态桥，原SetValueState引擎完整实现/后续其他来源仍需运行确认；测试中的true flag不能作为产品默认或原机发生证明。

## 通知与排队

month-card-events 接原iCardID/iExpireTime/iLastRewardTime字段，经有来源的JS信封适配到模型；不宣称信封与原网络载体逐字相同。所有行检查配置ID、安全整数/负值范围和重复ID，完整校验后原子写入；不消费物品、不授予购买奖，更新版本与false flag再尝试排队。入口接受controlled-fixture/original-runtime-notification来源标签，标签是调用方声明，不是连接真实服务器的证明。

440334–440350请求时检查规则，440381–440406去重排队；440560–440605等待主窗口、避开其他弹窗、引导后1秒和200ms延迟。按原队列不在SelectSuitablePopup时再次检查每日/333。网页映射strongGuideActive/colliderGuideActive，未实现原完整引导系统；250ms轮询的调度实际约250–500ms，不称逐帧一致。pending仅内存；显示才按440628–440644写每日戳，手动显示依440443–440458也计入。读取或关闭不另计次。返回山门前不打断仓库/奖励/其他操作。

本地毕业提升maxWanderDifficulty时桥接difficulty尝试；另提供明确来源状态通知API。默认source flag false仍不弹，未增加虚构常驻体验入口。

## 原图与操作

UITryLongCard原39节点、12 Sprite引用，新增5张图片，其余共享已导出原图。562787–562795只SetData卡3；562800–562802关闭。原CardInfoItem.ShowDescIndex=1、4个预置权益格位置按配置iType0编号填充，原help71可以打开/逐层返回。保留原一天体验海报/价格按钮，1元取Recharge6003配置，不伪造支付；固定买奖100仙玉/3000灵石只读预览。

拥有状态由通知更新后隐藏购买并更新原tip2倒计时；准确到期恢复价格、清倒计时。原DailyReward/Receive在prefab屏外位置不搬入视口；卡3没有日奖，模型拒绝凭体验权领取永久卡日奖。普通月卡倒计时也补回源659963的“后到期”。来源上下文扩展为月卡/体验卡，两类预览不叠仓库目录、关闭回原窗口。

## 每日370提示与说明框

474714–474727只为owned&&!claimed&&cardID!=3设置370子ID；FunctionIcon9绑定370/-1、偏移[-10,-15]。使用原ReddotSign_New（370的arrStyleParams索引7），不改成网页文字感叹号。两卡聚合为一提示，查看保留，实领一张保留另一张，准确到期/跨日刷新。UI上的数据与实际领取模型共用，而非独立假状态。

子agent发现仙玉说明末行看似裁剪，定位ResourceTips旧110高度。原Scroll View高129.9807、m_Vertical=1/m_Horizontal=0；恢复高度、原字号34/色值，纵滚并禁横滚，说明纳入Tab焦点，End可达末行，Escape回原体验窗。HTML行高1.15及系统字形是网页适配，不当原TMP/SDF逐字像素验收。

## 验证

- test-month-events-model：25项，false门槛、通关/版本、请求/每日/去重/环境/200ms/引导1秒、显示写戳、状态通知/两卡日奖排除3/跨日、无效与后行错误的原子拒绝。
- test-trial-card-browser：40项，实际原39节点窗口、1元/四编号/原help71、320控件、购买不造数据、原奖励预览及来源返回、通知更新/到期、自然false不弹、已有窗等待/每日持久化、原370查看/领取/跨日/到期/双卡聚合、实领永久日奖100仙玉+1000灵石、说明末行与焦点。无JS/缺资源错误。
- 既有回归：月卡58模型/46浏览器，首页24，仓库23，奖励52，资源12通过。共用返回/说明高度修正后月卡46再次通过。
- 官方develop-web-game客户端烟测退出0并查看截图。证据目录work/rea-pipeline/verification/trial-card-v61；全部隔离网页fixture。子agent独立25模型/最终40浏览器、源码与截图复核通过。末行测试等待实际滚动到底，避免原生键盘滚动动画与固定等待造成竞态。

## 继续保留的缺口

渠道支付/真实订单、原服务器购买赠奖/续期精确算法、原机自然体验弹窗与字形/完整特效、所有月卡权益并未完成。未从客户端找到5/6减伤完整计算消费者，此轮没有新增猜测战斗减伤算法。主线/决胜及B08灵宠管理仍按总清单推进，不因本轮窗口接入而勾选整体系统。
