# 弟子详情 v24：重生、魂石、特殊幻化

## 原始证据

使用本地 APK 与已采集的更新资源（2610131532），不是把截图数值写死。
更新程序集 SHA-256：`c0c9533b719ae312542d6e9fda26f0f7627fb828c474681a20986bba7ccfb2b8`。
本地反编译全文：`work/alignment-v13/all.cs`；本轮切片、配置解码和角色提取：`work/alignment-v24/`。

| 原版入口 / 配置 | 已接入的网页行为 |
| --- | --- |
| FunctionOpen 126，UIRebirthConfirmMessageBox | 完成两次游历后开放；检查进行中的游历、培养状态、材料和每日五次限制；已布阵时二次确认 |
| Misc 3204、3213；UIDiscipleBirth.ConfirmOpen | 进入招生画面后再发起重生，消耗 101 重生丹一枚和普通招生体力；退出未开始的重生不扣费 |
| WanderModule.ResultNext → UIDiscipleInfoComparison | 保存原弟子备份，复用原名单位置进入功法、长老和游历；结算后选择原弟子或重生弟子；保留旧弟子也不退材料、不恢复防守阵容 |
| FunctionOpen 150、151、152；GemSlot | 24级开放，或创角5天且17级的强制开放条件；槽位按24/28/30级开放2/4/6个 |
| UIDiscipleSelectGemPage、GemPage | 每个元素三套共享图腾，弟子选择使用方案；同一枚魂石可以被不同方案引用 |
| UIGemInlay.OnBtn_InlayClicked | 同组魂石替换原位置，否则优先空位，满格后选择替换；可以卸下，锁定状态保存 |
| GemModule.GetComposeShowGemIds | 同元素同品质五合一；不消耗已镶嵌或锁定的魂石；不能重复确认消费 |
| UIGemRefine / Gem.arrRefineCost | 使用原配置材料洗炼；候选属性单独保存，确认替换前不影响已镶嵌属性；替换同步所有引用方案 |
| GemModule.GetTotalPower、GemPower | 取每个元素三套方案的最高魂力相加；达到阈值并支付配置中的材料后升阶，实际增加最终属性倍率 |
| UIDiscipleSkin.isSingleConditionOk / CanEquip | arrEquip1/2/3 之间为 AND，每个类型1条件内为法宝 ID 的 OR；仅检测已放入棋盘的法宝；类型2为使用人数限制，不能当作法宝 ID |
| UIDiscipleSkin 的整身幻化转移 | 整身幻化互斥、转移提示、原拥有者恢复出生外观、点击当前整身幻化可卸下；幻化不收普通易容丹 |

## 属性和资源

- 1408 条魂石配置、64 条套装配置、120 条魂力等级配置和48条槽位配置直接来自原资源。
- 配置属性进入弟子详情、防守战力和 `CombatEffects`，不只更新说明文字。毕业快照保存不含这些可变加成的基础值，后续换方案或换装不会重复叠加。
- 魂石敌方治疗/汲取/怒气回复削弱，以及64套装的基础效果、32条四件套条件效果接入本地战斗。条件和描述来源保留，服务端事件调度和部分公式仍是本地近似。
- 普通道具奖励中的魂石 ID 在打开魂石窗口时转为独立实例，避免道具已入账但无法镶嵌；不免费发放材料或魂石。
- 导出了四个原窗口的布局/图像引用，窗口内容使用可操作的响应式布局；本轮不声称这些弹窗已逐像素还原。
- 49 个原始角色骨骼完整提取，覆盖65个幻化配置，未缺少所用贴图区域。交付使用 idle 首帧，**不宣称已经实现这些角色的全部动画**。
- 本地资源缺少的31个角色 prefab 已列在 `assets/transmog-v24/provenance.json`；其中20个幻化配置可用原头像回退，其余回退出生外观。条件、扣费、穿戴和属性仍可操作；缺失的完整造型需要继续采集原资源。

## 验证边界

- `test-disciple-advanced.cjs`：实际点击魂石窗口、镶嵌、切换、锁定、取消/确认合成、洗炼/替换、幻化、重生确认/下阵/招生/功法/长老；验证状态和属性变化。
- `test-disciple-advanced-effects.cjs`：原配置升阶消费、64套装基础激活、治疗削弱、限时套装效果、同组替换、卸下、重复结算拒绝和序列化恢复。
- 回归 `test-disciple-pages.cjs`、`test-disciple-roster.cjs`、`test-disciple-graduation.cjs`、`test-status-browser.cjs`。
- 使用 develop-web-game 官方客户端生成页面截图，并人工检查魂石、幻化和重生比较截图。静态前端检查未发现 high/critical 问题，不替代运行验证。
- 重生结束选择使用受控结算 fixture 验证，没有把它称为自然打完一整轮原版游历。原有游历测试另验证事件领取→战斗→奖励整理→继续。
- 随机合成/洗炼结果使用本地抽样；每日次数按浏览器日期处理；没有本轮模拟器战报或原服概率、跨日时区一致性的证明。

截图和测试输出在本地 `work/rea-pipeline/verification/disciples-v24/`，不包含用户生产存档；测试浏览器独立。

## v25 后续更新

上文49套静态图和31个缺失角色描述保留为v24历史状态；v25已解析全部80个角色/96条整身幻化，动作与验证边界见 `appearance-animation-audit.md`。
