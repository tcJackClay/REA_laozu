# 原版分析基础模块

三个可运行模块共用原始资源、源码行号和采集证据。现有游戏尚未整体迁移到新窗口宿主；这次不改玩法或存档。

## 运行

在仓库根目录执行（Python 3.11+，本机使用 3.13）：

```powershell
py -3.13 -X utf8 tools/rea-pipeline/pipeline.py build
py -3.13 -X utf8 tools/rea-pipeline/pipeline.py query UISelectEquip
py -3.13 -X utf8 tools/rea-pipeline/serve.py
```

工作台：http://127.0.0.1:5180/ 。仅监听本机；游戏仍使用 5173。

本地依赖：`work/alignment-v13/all.cs`、v9 的更新程序集、v9–v16 已导出 layouts/configs 和 `outputs/laozu-web/assets`。这些大型原始文件不随此次提交发布；新克隆仓库必须先准备相同提取产物。脚本缺输入时报错，不下载或伪造原始数据。

## 统一索引

`index.sqlite` 存储窗口类、方法、打开/关闭/消息/配置/回调候选关系、Prefab 节点、配置字段和采集记录。路径、行号与 SHA256 可追溯。程序集和反编译源码分别登记；不将本地程序集视为当前模拟器内存的一致性证明。

输入未变时跳过 C# 扫描；`build --force` 强制重建。布局和配置按明确版本顺序选取。`query` 同时查询窗口、反向引用、布局和配置名/字段。

当前基线：694 个 UI 类、12,974 个方法、5,715 条静态候选关系、25 个布局、43 张配置表。只有 23 个类按名称连接到已导出布局。UI 类数不是可玩页面数；词法扫描不能证明执行顺序、条件、参数或服务器规则。

## 通用窗口渲染

`outputs/laozu-web/source-window.js` 在原 RectTransform 转换器之上提供：

- 原始节点路径/ID 驱动的窗口栈、缩放、数据更新和显式按钮事件。
- 复用锚点、九宫格图片、文本、横纵布局和状态切换；补充基础 GridLayoutGroup、ScrollRect 视口。
- 缺失图片、未绑定按钮诊断。预览只记录事件，不调用游戏或服务器。

工作台“显式绑定”示例（使用查询到的真实节点路径）：

```json
{"/UIBuyGridConfirm/Bg/Auto_Confirm/ZuoZuo":{"text":{"state":"caption"},"action":"confirm"}}
```

数据状态：`{"caption":"开启"}`。点击“应用绑定”；改变状态后点击“更新数据”。可连续打开窗口，再“关闭顶层窗口”验证返回状态。正式游戏适配器须把 `onAction` 明确接到已核对的逻辑。

25 个布局通过无异常渲染检查不代表 25 个页面功能完成。TMP 特效、复杂遮罩、动态列表实例化、Animator、自定义组件和原版业务条件尚需适配；不支持的业务不会被自动猜测执行。

## 原版流程采集与复核

先确认原版所在状态符合 scenario 的 `precondition`，再执行：

```powershell
py -3.13 -X utf8 tools/rea-pipeline/capture.py --package com.cultivation.zmda.bilibili --scenario tools/rea-pipeline/scenarios/open-storage.json
```

支持 `--adb`、`--serial`、`--db`、`--out`。动作限截图、归一化坐标点击/滑动、返回、等待。交互必须指定前台包保护；每步记录前后 PNG、哈希、时间、分辨率、前台 Activity。失败保留部分记录，不覆盖已有采集目录。安装包版本可读取，但热更新程序集一致性仍需额外验证。

`recorded` 仅表示采集成功，`pixelsChanged` 不是玩法验证。查看原始截图后单独登记复核：

```powershell
py -3.13 -X utf8 tools/rea-pipeline/review.py work/rea-pipeline/captures/RUN --step 0 --result matched --observation "实际看到的触发和返回状态" --reviewer "reviewer-name"
```

复核首先校验截图哈希，独立保存 `reviews.json`，不篡改原始预期。结果可为 matched / different / inconclusive。工作台采集记录显示复核结果。场景前置条件目前需人工确认；工具不会自动识别 Unity 内部窗口，也没有接入 Frida 事件或网络消息。

本次实际采集：山门恢复已有游历 → 日志点击储物袋 → 完整弟子详情 → 返回原日志。发现储物袋实际打开弟子详情，已将“弹窗”预期标记 different。账户截图只保存在本机 `work/rea-pipeline/captures/`。

## 验证与下一条完整链

```powershell
py -3.13 -X utf8 tools/rea-pipeline/test_pipeline.py
node tools/rea-pipeline/test-browser.cjs
```

浏览器测试需要已运行 5180 工作台及 Playwright；可通过 `PLAYWRIGHT_MODULE` 指定模块路径。覆盖索引查找、失败保留、输入限制、数据绑定、按钮回调、窗口返回以及全部已导出布局加载。截图输出到 `work/rea-pipeline/verification/`。

后续按完整链交付：招生 → 录取配点 → 功法 → 长老 → 游历事件 → 奖励/开格/重铸/合成与觉醒 → 继续/毕业。每条链先固定状态和源码关系，再采集正常/受限/取消返回分支，接入窗口与业务适配，验证资源变化和存档恢复，最后提交推送。未采集或只找到静态关系的分支保持未验证，不用测试条数代替玩法覆盖。
