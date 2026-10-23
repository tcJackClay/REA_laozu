# 地区、稀有度与基因抽取（2026-10-23）

## 已确认规则
- 每局免费档可重复使用，只抽普通稀有度。
- 累计获得的基因片段达到档位门槛后永久解锁；实际抽取仍扣除当前余额。
- 资源显示名统一为「基因片段」，沿用存档 points 字段；geneTotal 记录累计收入，消费不减少累计值。
- 目前全部冒险道路属于关都，抽取池仅开放关都。420 个现有物种/形态按基础物种首发地区标注关都、城都、丰缘。
- 旧存档没有累计流水时，以当前余额、历史峰值、击败数×2 的最大值初始化累计收入，保留旧解锁；无法还原已花费的额外事件收入。

## 本项目概率（不是 PokéRogue 原概率）
|消耗/累计收入解锁门槛|普通|稀有|史诗|传说|
|---|---|---|---|---|
|0|100%|0%|0%|0%|
|5|80%|18%|2%|0%|
|15|50%|35%|14%|1%|
|40|20%|45%|30%|5%|

先抽稀有度，再在该地区该稀有度池内等概率抽物种。关都共 79 个区域初始形态，52/22/4/1。初始等级仍采用所选道路等级带下限。

## 数据来源与边界
PokéRogue 官方仓库 https://github.com/pagefaultgames/pokerogue ，固定提交 e79fbcdb5bf74066c9c0cab4d872de89efd94ae6。
读取 src/data/pokemon-species 的 generation-01.ts 到 generation-04.ts、species-data-registry.ts，以及 starters.ts / species-id.ts。source-input.json 保留提取的 starter、eggTier、starterCost 和输入哈希。
稀有度读取显式 eggTier，进化形态继承 starter 的 tier。地区按基础图鉴编号分代，特殊形态继承基础种。抽取池排除在关都内部存在进化前置的物种，因此允许皮卡丘等区域初始形态，不会直接抽出雷丘。皮卡丘稀有度来自皮丘，魔墙人偶来自魔尼尼，避免以种族值猜测。
本项目初始招式取当前等级可学的最后一个攻击招式；奖励从当前可学攻击招式随机选择；进化仍遗忘旧招式并随机学一个。没有可用攻击招式时用撞击兜底，这是背包战斗的本地融合规则，并非原作学招规则。
使用已有 PokeCatch 图像，没有新增绘制素材。

## 验收与复核
- node tools/rea-pipeline/build-poke-genetics.cjs：重建分类数据。
- node tools/rea-pipeline/test-poke-genetics.cjs：452 项断言，79 个物种逐一完成战斗/奖励/收藏/重抽。
- node tools/rea-pipeline/test-poke-genetics-ui.cjs：17 项浏览器断言，含 320/390/450 宽度、解锁/余额不足、结果保存和闭环。
- node tools/rea-pipeline/test-poke-model.cjs：27 项原背包/结算回归。
- node tools/rea-pipeline/test-poke-events.cjs：642 项事件/进化回归，7 类事件。
- node tools/rea-pipeline/test-poke-routes.cjs：146 项，23 路线各 3 局，69 局完成结算（68 毕业、1 救援）。
- screenshots 与 model.json/browser.json 是本次浏览器模拟手机宽度和模型测试证据，不代表实体手机测试。

## 2026-10-23 收藏与图鉴更新
- 收藏与图鉴分别保留本次会话的地区/稀有度组合筛选，切换页面不互相影响；全部可清除对应条件。
- 灰/蓝/紫/金应用于名称、稀有度标签与卡片边框；保留文字标签，不仅依赖颜色。
- 386 个基础物种中文名取 PokeAPI 简体中文（语言 ID 12），覆盖现有全部 420 个物种/形态；形态追加中文描述，未知图腾保留字母符号。来源 URL 和原 CSV SHA256 见 names-source.json。特殊皮卡丘使用「皮卡丘·特殊形态」，没有擅自赋予官方形态名称。
- 页面没有新增介绍性文字，并移除收藏、图鉴原来的介绍段落。
- test-poke-catalog.cjs：440 项，含 420 名称、连续消费后的累计解锁、收入/消费/刷新及旧档迁移。
- test-poke-catalog-ui.cjs：93 项，两个页面的 40 种筛选组合、中文、颜色、导航保留与 320/390/450 宽度截图，无运行错误。
- 回归：genetics 452、genetics-ui 17、events 642、model 27；均通过。截图为浏览器模拟手机宽度，未进行实体手机测试。
