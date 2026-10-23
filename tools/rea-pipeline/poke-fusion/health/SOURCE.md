# 战斗HP与状态显示
来源：2026-10-22 PokeCatch固定资料，app.f5605635e3.js 和 app.4cbef38437.css。
- JS qa/ce：HP超过20%用#f0607a，否则#d6334f。
- CSS mini-hp最终覆盖：宽13px×--k；height15px、border3px #1b1b22、radius5px、底色#3a2a33；高光inset 0 4px #ffffff59 / inset 0 -2px #0000002e。
- 原站mini-lv位于精灵下方，本版按用户要求补上名称，保持朝向与素材不变。
- STATUS.INFO对应灼伤、麻痹、中毒、睡眠、冰冻、混乱的六种原配色；st-chip原圆角与阴影。原站Dn将主要状态放在mini-lv；本次按手机空间检查改放HP上方，独立于短条宽度，并支持主要状态与confused并存。
- 当前融合战斗尚无异常状态施加/持续伤害/行动限制逻辑。本次只对齐显示，读取mon.status、mon.confused以及battle.status/battle.confused。无数据时不显示。截图中的状态来自隔离测试存档，不代表自然战斗已支持状态。
验证：64项（3尺寸×7状态样例×3检查+无异常），另12项冒险闭环通过。图片为Chromium手机尺寸模拟；未做实体手机验收。
