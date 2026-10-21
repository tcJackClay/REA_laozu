# 特殊幻化与动作接入 v25

## 原始证据与覆盖

- 从 `CreatureView.szResPath` 解析 Prefab，再跟随 `SkeletonGraphic.skeletonDataAsset` 的本包/外部包引用，读取 `SkeletonDataAsset.skeletonMainJsonPath` 和动态骨骼。此前仅按文件名匹配，遗漏别名和 APK 依赖包。
- 80 个角色、96 条特殊幻化配置，均有原始全身资源；新增此前遗漏的 31 个角色。中秋嫦娥来自原热更新包 `3g9c1qv.bin` 与 `qsuub3.bin` 的 `yupojinghong`，未用相近造型替代。
- 1200 段原动作：每角色 15 段，保留原时间长度，每段均匀采样16帧。WebP 图集按需加载，不预载所有角色。
- `MonsterAniHelper.GetAniName`（本地反编译 `all.cs:905906`）明确对应：Idle/idle、BattleIdle/idle_atk、StartBattle/begin、Dead/die、ExitBattle/fall、Attack/atk、Type2SkillAct/shifa、Dodge/shanbi、Move/move、Run/run、Mine/mine、Sit/sit、Operate/operate。另有骨骼内 hit1/hit2。
- 可追踪清单：`outputs/laozu-web/assets/transmog-v25/provenance.json`，含源包、骨骼路径、配置ID、动作时长、取景坐标、贴图缺口及逐图 SHA256。

## 实际生效

- 详情、换装预览、列表和布阵共用外观解析及原 idle 动作；换装保存、跨弟子转移、卸下和刷新使用同一份 skin。
- 游历事件、战斗和渡劫使用同一外观，修复原先普通换装或幻化进入战斗仍显示默认弟子的分支。
- 战斗入场 begin 后开始攻击；战斗待机 idle_atk，攻击 atk，怒气施法 shifa，闪避 shanbi，受击 hit1。胜利退出 fall，失败 die，动作结束后结算。结束阶段保存到战斗快照，刷新不重复入账。
- 渡劫使用 sit，奖励整理中的操作使用 operate。其余原动作可由共享播放器调用；当前网页没有对应事件的动作不人为安排播放。
- 每段动作独立取景，通过原骨骼坐标映射回统一 idle 坐标，避免长距离死亡动作压低待机分辨率或切换动作时改变人物比例。
- 随机换装过滤当前条件不满足的装扮，并在上下衣选中后清除互斥套装。回归检查由固定ID猜测改为核对原配置的性别和已拥有范围。

## 复现与边界

在仓库根目录运行 `extract-transmog-resources.py`、`extract-transmog-patch-resources.py`；然后 `node tools/rea-pipeline/render-transmog-animations.cjs N`（N=0..3），最后 `build-appearance-manifest.py`。脚本依赖本地原 APK、已有资源索引、UnityPy 和 Spine 3.8 工作目录；不会从网络补猜资源。

本轮是原骨骼采样动画，非实时 Spine 求值；16帧、WebP 压缩与 Canvas 三角形采样不是逐像素等价。普通部件组合保持换装外观一致，但仍为静态分层，尚未导出全部普通部件的骨骼动作。原生粒子、材质混合效果和服务端战报时间轴没有在本轮验证。

验证使用独立浏览器存档和受控战斗，不改用户存档；不将其表述为模拟器实录。专项脚本覆盖穿戴/转移/布阵/刷新、原攻击、15段播放、入场暂停伤害、死亡动画及刷新结算防重入。另回归弟子页面、重生魂石、事件领取到战斗结算流程。静态检查的重复ID提示误将 `data-*-id` 识别为 HTML id，运行时检查动画子树不新增 id。

最终验证：专项17项、弟子页面44项、重生魂石31项、事件战斗闭环10项，共102项浏览器检查通过；官方客户端冒烟通过。1200张动作图集尺寸与哈希检查通过，缺失贴图区域为0。截图与报告在本地 `work/rea-pipeline/verification/disciples-v25/`。
