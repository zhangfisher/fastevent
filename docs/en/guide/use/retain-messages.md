# Retained Events

FastEvent's message retention feature allows new subscribers to immediately receive the last event data, making it ideal for state management scenarios.

## Basic Usage

### Trigger and Retain Events

```typescript
// Trigger and retain event
emitter.emit('system/status', { online: true }, true);

// Later registered listeners will immediately receive the retained event
emitter.on('system/status', (message) => {
    console.log('Current status:', message.payload.online); // true
});
```

### Check Retained Events

```typescript
// Check if event is retained
const hasRetained = emitter.hasRetained('system/status');

// Get retained event data
const retained = emitter.getRetained('system/status');
if (retained) {
    console.log('Last status:', retained.payload);
}
```

## Type Safety

```typescript
interface AppEvents {
    'system/status': { online: boolean };
    'user/current': { id: string; name: string };
}

const emitter = new FastEvent<AppEvents>();

// Type check passes
emitter.emit('system/status', { online: true }, true);

// Type error
emitter.emit('system/status', { status: 'up' }, true); // ❌
```

## Use Cases

### State Synchronization

```typescript
// Component A: Update and retain state
emitter.emit('ui/theme', { mode: 'dark' }, true);

// Component B: Get current theme on initialization
emitter.on('ui/theme', (message) => {
    applyTheme(message.payload.mode);
});
```

### Configuration Sharing

```typescript
// Load config on app startup
loadConfig().then((config) => {
    emitter.emit('app/config', config, true);
});

// Any module can access latest config
const currentConfig = emitter.getRetained('app/config');
```

### Cross-Component Communication

```typescript
// Retain user data after login
emitter.emit('user/login', userData, true);

// Other components get current user
emitter.on('user/login', (message) => {
    renderUserProfile(message.payload);
});
```

## Advanced Usage

### Retained Event Lifecycle

```typescript
// Clear specific retained event
emitter.clearRetained('system/status');

// Clear all retained events
emitter.clearAllRetained();
```

### Retained Event Change Listeners

```typescript
emitter.onRetainedChange('user/current', (message) => {
    console.log('Current user changed:', message?.payload);
});