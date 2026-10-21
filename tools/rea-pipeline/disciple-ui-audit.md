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
