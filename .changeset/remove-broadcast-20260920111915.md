---
"fastevent": major
---

Remove broadcast functionality from FastLiteEvent:

- **BREAKING**: Removed `FastLiteEvent.broadcast()` method
- **BREAKING**: Removed `FastLiteEvent.getListeners()` method (use standalone `getListeners()` utility instead)
- **BREAKING**: Removed `FastLiteEvent.clearRetainMessages()` method (use `retainedMessages.delete()` directly)
- **BREAKING**: `FastLiteEvent.emit()` no longer accepts `broadcast` option in the third parameter
- **BREAKING**: `FastLiteListenerArgs` type no longer includes `broadcast` field
- Extracted `getListeners` to shared utility `utils/getListeners` (usable with both `FastEvent` and `FastLiteEvent`)
- Optimized type imports to use `import type` for better tree-shaking
