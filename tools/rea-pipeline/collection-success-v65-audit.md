# v65 功法、长老详情的原升星结果与组合实战复核

本轮只提交功法/长老相关增量，保留工作区已有灵宠孵化改动。原有主详情、养成事务和组合战斗已经存在；本轮发现并补齐遗漏的独立结果窗，不把已有功能重复计作新增实现。

## 原始证据

- work/alignment-v13/all.cs 458663–458698：功法升级响应，STAR_STAGE_COUNT=6；0阶为UILotteryResultNewItem，非0整星才进入UISeedlingUpgradeSuc。初解锁独立展示本轮仍未实现。
- 461275–461298：长老成功响应更新等级后，整6阶且szPassBack不是Lottery才进入UITeacherUpgradeSuc。0阶合成结果也属于此路径。网页本地养成事务模拟成功响应，未冒充服务器下发。
- 606865–606899、606988–607002：功法原品质图、属性前后值、4条szStarDes及上一阶/当前阶标签。数组索引沿原StarLevel及StarLevel+1，旧值不是用当前值减近似常量。
- 571646–571732：长老原品质/属性、默认造型、0星配方与已升星属性/效果两态；原造型默认皮肤，不借用当前穿戴皮肤。静态立绘沿已有原图映射，未新增原骨架动画。
- 461791–461853：GetStarEffectStr原分支；0星紫装、1星帮助、5星额外橙装与红装比例，其余逐StarAffectList配对。修正此前“法宝效果提升”等简化解释。此变化仅纠正说明，没有据此虚构额外奖励发放。
- UITeacherInfo 574516及574840–574843：故事切换组原本主动隐藏，因此仍保持隐藏，不因有故事数据就杜撰可见入口。Auto_Frag原Prefab inactive，也未强制开启。

重建脚本build-collection-success-layouts.py从原APK/已提取更新包沿AssetBundle→GameObject→RectTransform→Sprite引用导出164节点、50图片引用；去重后新增4张PNG。原始包和C#大文件不提交。

## 布局和返回

原动态图组和ContentSizeFitter的0高度需要浏览器适配：功法背景根据原956信息区加技能区设置1200内容高度；长老InfoBg/UpgradeInfo根据原455高内容区填充，避免内容落到屏幕外。属性行克隆原ListItem并归一化根锚点，原图标/字号/子布局保留。长老横排星级数字/效果说明补运行时宽度。该适配尚不是Unity TMP逐像素或原机动画验收。

原结果窗没有额外升星/购买/领奖按钮；空白或ESC只关闭当前层，面板内点击保留窗口。父详情保留组合成员、滚动和来源上下文。普通加阶继续留在详情；整星结果在消耗生效后显示，关闭结果不会再消费。确认取消、余额不足、功能锁定、满阶仍走既有统一事务。防止结果态收到过期upgrade-confirm继续扣款。

## 战斗与验证

组合继续单一接入CollectionBonuses→CombatEffects.attributes→正式战斗tick，没有再次归档叠加。test-collection-battle.cjs通过13项：付费跨门槛、原对应元素攻击、非对应元素不变、实际扣血、功法暴击以及重复计算不累计。数值仍为已声明离线公式，不宣称原服务器PVE修正精确一致。

- 新增：test-collection-success.cjs 3235项源表/触发检查，test-collection-success-browser.cjs 19项实际网页流程。
- 回归：527组合门槛、13正式战斗、49详情、24组合返回、19详情状态、25材料浏览器与2560材料分支、20账号事务。共6491项检查，源配置枚举不等同6491次原机运行。
- 新测试另用VERIFY_STAGED=1拦截工作区有未提交改动的脚本为Git暂存内容，单独验证本次提交，不混入孵化工作。
- 前端检查工具未报高优先级静态问题；此结果不替代浏览器验证。官方develop-web-game客户端烟测已运行并查看截图。截图覆盖390×844和320×740。

截图及摘要在[audits/home/v65](audits/home/v65)，完整隔离测试日志位于work/rea-pipeline/verification/collection-success-v65。本轮未新增原模拟器动态采集；特殊动作、粒子、原机时序、完整初解锁窗与在线服务仍待补齐，B02/B06保持未整体勾选。
