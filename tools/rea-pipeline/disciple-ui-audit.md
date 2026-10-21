# 弟子入口区域与功能核对（v22）

来源：`UIAllDisciple` 原始 Prefab 148 个节点、88 个图片引用；`UIAllDisciple`（all.cs:859060）、`UIDiscipleInfo`（750370）及 `cfg_DiscipleMaximum` 31 条、`cfg_DiscipleStateFlag` 13 条。程序集 SHA256：`c0c9533b719ae312542d6e9fda26f0f7627fb828c474681a20986bba7ccfb2b8`。REA 静态元数据核对成功，未执行程序集。当前 adb 无设备，本轮没有模拟器画面等价证明。

| 区域/入口 | 原版对应 | 网页本轮结果 |
|---|---|---|
| 山门底部弟子 | UIAllDisciple | 改为原节点/图片的列表，删除旧收徒、修炼、共享出战按钮 |
| 列表主体 | EffectiveList / ListItem | 原三列卡片、滚动、姓名/战力/境界/创建时间 |
| 下方属性 | HeroClassSelector | 全部及八系筛选；使用原属性图片 |
| 右上排序 | ShowStyleDropdown / Ascend | 战力、境界、创建时间，升降序；关注优先 |
| 详情 | OnBtn_DetailClicked | 简略/详情卡片切换 |
| 人数与＋ | OnCdBtn_AddDiscipleClicked | 原容量表：50 初始，下一档 55 / 50 仙玉；确认才扣除，可取消 |
| 卡片点击 | UIDiscipleInfo | 本地资料弹窗；不修改出战弟子、不改变游历；完整原详情布局待接入 |
| 关注/锁定 | CHANGE_FLAG_REQ 2/1 | 本地标记持久化；锁定禁止驱逐 |
| 批量驱逐 | UISelectDisciple → 确认 | 选择、保护状态、二次确认、取消、刷新；游历期间暂禁止调整名单 |
| 左下布阵 | UIDefenseFormation(Form) | 已核对正确去向；宗门防守布阵未接入，不伪装成主线布阵 |
| 顶部换装 | UIDiscipleSkin.Show(0) | 已核对正确去向；解锁/穿戴页面未接入，不虚扣资源 |
| 返回首页 | 原底部六项导航 | 可返回山门 |

边界与后续：
- 完整 UIDiscipleInfo、宗门防守布阵、换装需要作为下一组完整链实现，不能把当前说明弹窗计为完成。
- 名单来自当前本地存档；人物形象尚沿用已有角色图，未完成每位弟子骨骼外观。属性解锁条件、战力算法、驱逐返还与全套原版状态保护规则待接入。
- 图形节点和按钮位置取原 Prefab；动态筛选栏、列表实例和资料弹窗使用网页控件适配，未声称所有像素一致。
- `test-disciple-roster.cjs` 21 项验证入口、排序筛选、详情切换、容量交易、关注锁定、驱逐确认/取消和回首页。未接入按钮仅验证不会误跳或扣费，不属于完整功能通过。


## v23 — 详情、宗门防守编队、换装

本节取代 v22 中三项“未接入”的状态。入口不再使用占位说明。

- 资源：UIDiscipleInfo 341 节点、UIDefenseFormation 142 节点、UIDiscipleSkin 253 节点，共 288 张引用图。`disciple-pages-data.js` 保留原节点 ID、父子关系、RectTransform 与图片来源。
- REA 静态成员证据：`ev_cf45c1c6b27462b7cd8a9b9aeedd5744015426ab1ffa071cbfeaf383d6f8b87c`。程序集 SHA256 与上文一致，未执行目标程序集。
- 配置：原 Skin 1079 条、SkinRes 22 条、SkinLevel 100 条；Misc 3301/3302 对应道具 110/111。仅导出相关 Goods/Misc 条目。
- 骨骼：`640_zhujue_body.skel`、21 份 `442_zhujue_*_lite`、原 atlas/打包 UV。759 个部件生成透明姿态图和缩略图。是原模型原贴图的静态渲染，不是截图切图或新画的角色。

| 页面区域 | 源方法/规则 | 实际接入 |
|---|---|---|
| 详情角色、姓名、属性、天赋 | UIDiscipleInfo.OnUpdateUI / DiscipleNameInput.OnNameInputEndEdit | 原节点布局；查看不改变 selected；结束游历后允许改名；天赋与属性可查看 |
| 详情功法、长老、神通、法宝 | InitAbility / UpdateIsCanLook | 读取该弟子的独立历练档案；可点击查看；法宝编辑检测占格、边界与已开格 |
| 关注、锁定、驱逐 | OnBtn_Follow/Lock/DeleteClicked | 状态保存，编队成员保护，取消/确认，批量驱逐沿用原列表链路 |
| 灵宠 | OnBtn_PetClicked / OnBtn_ChangePetClicked | 已拥有灵宠选择与卸下；游历中只读 |
| 返回与切换 | OnBtn_ReturnClicked / SwitchDisciples | 返回名单；布阵长按查看后返回原草稿；查看其他弟子不串档 |
| 宗门编队 | GetFormationIdxByIdx / SwitchFormation | 11–15 五套独立预设，每套三格；切换恢复已保存编队 |
| 上下阵、拖动顺序 | OnHeroClicked / SwapSelectHero | 点击增删、满位限制、拖动交换；排除游历/洗髓中弟子；属性筛选、战力/境界排序 |
| 完成布阵 | OnBtn_CompleteClicked → FORMATION_SET | 点击才保存当前编队并返回；返回丢弃草稿；未跳到主线挑战 |
| 换装选择弟子 | OnBtn_AddDiscipleClicked | 从名单进入先选弟子；从详情进入直接绑定当前查看对象 |
| 部位与列表 | MainSubIndex2Part / showSkinList | 服饰、容貌、法器、幻化；仅列已拥有部件，排除初始 1–4；当前优先、排序、升降序与简略/详情 |
| 预览、重置、退出 | adjustSkinDict / OnBtn_Reset/GuanbiClicked | 上下装与套装互斥、整套幻化互斥；未保存外观退出确认；不改变游历角色 |
| 确认与随机 | needCustomMaterial / SKIN_CUSTOMIZE/RANDOM | 改为非出生普通部件消耗 111×1；随机从适用已拥有部件抽取消耗 110×1；取消不扣费，事务确认不重放 |
| 仙姿 | SkinLevelItem / CanUpgrade | 按 SkinLevel 累计门槛升级，显示原属性配置；无虚构货币扣除 |
| 毕业归档 | finish-run 本地适配 | 清 run 前快照 config、神通、法宝、已开格、属性、战报；后续游历不覆盖旧弟子档案 |

验证：`test-disciple-pages.cjs` 44 项、`test-disciple-roster.cjs` 21 项、`test-status-browser.cjs` 10 项、`test-disciple-graduation.cjs` 毕业归档；官方 develop-web-game 客户端及截图复核。隔离浏览器的测试存档不改用户存档。

仍需区分：原服务器皮肤归属/抽取概率、历史弟子缺失的档案不能凭空恢复；本地状态取代服务端请求。部件合成使用固定姿态与近似绘制顺序，尚非完整实时 Spine 动画；140309、140509 两个特殊幻化模型仍缺渲染结果，其他非部件 CreatureID 外观尚待单独导出。详情页高阶重生、魂石的独立系统及官方聊天分享未接入，当前不显示这些未开放的入口。仙姿/特殊幻化的属性跨战斗传递尚未作为本轮验收项。动态列表使用网页控件适配，不能宣称逐像素一致。当前 adb 无设备，以上不是原版模拟器动态等价证明。
