# Minimal Calendar (Expo + TypeScript)

一个使用 Expo Router 构建的简约日历应用，功能包括：
- 日历视图：月视图 / 周视图 / 日视图
- 纪念日的增删改查（全天或时间段）
- 使用 ical.js 导入/导出 `.ics` 格式的纪念日
- 可选的本地提醒功能（通过 `expo-notifications` 实现）
- “事件”标签页，按日期分组显示有纪念日的日期

## 运行

```bash
npm install
npx expo start
```

## 使用说明

### 日历标签页 (日历)

- 切换视图模式：`月视图 / 周视图 / 日视图`。
- 点击某个日期以选择它。
- 长按某个日期直接打开纪念日编辑器。
- 右上角操作：
  - 下载图标：从 `.ics` 文件中导入纪念日
  - 上传图标：将纪念日导出为 `.ics` 文件（通过分享面板）
  - 加号图标：为选定日期创建/编辑纪念日

### 纪念日编辑器 (纪念日)

- 标题为必填项，备注为可选项。
- 每个日期可以包含多个纪念日。
- 时间模式：
  - `全天` 和 `时间段` 是互斥的。
  - 切换到 `全天` 会清空并禁用时间字段。
- 提醒：
  - 启用 `提醒` 以安排本地通知。
  - 时间段纪念日支持“准时 / 5分钟 / 15分钟 / 60分钟”提醒。
  - 全天提醒将在当天早上 09:00 触发。

### 事件标签页 (事件)

- 仅显示未来日期（>= 今天）中有纪念日的日期。
- 每个日期展开后显示当天的所有事件（名称 / 备注 / 时间或全天）。

## 注意事项

- 安全区域处理使用了 `react-native-safe-area-context`，需要在根组件中添加 `SafeAreaProvider`（位于 `app/_layout.tsx`）。
- 文件读写使用了 `expo-file-system/legacy`，以确保在 Expo Go 中的最佳兼容性。
- iOS 模拟器的分享面板行为可能与真实设备不同；导出的文件仍会保存到应用目录中，如果分享失败，UI 会显示文件路径。
- 通知功能需要用户授权；模拟器行为可能与真实设备不同。

## 关键文件

- `app/_layout.tsx` 提供程序和导航堆栈
- `components/screens/calendar-screen.tsx` 日历屏幕 + 导入/导出操作
- `components/screens/events-screen.tsx` 事件列表屏幕（仅显示有事件的日期）
- `components/screens/anniversary-modal-screen.tsx` 纪念日编辑器
- `utils/icalUtils.ts` ICS 解析/导出（ical.js）
- `utils/notifications.ts` 本地提醒调度
- `utils/calendarUtils.ts` 日历网格 + 日期助手
