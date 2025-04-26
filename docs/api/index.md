# API Reference

This section provides detailed documentation for FastEvent's API.

## FastEvent Class

The main class that provides event management functionality.

### Constructor

```typescript
constructor(options?: FastEventOptions)
```

#### Options

```typescript
interface FastEventOptions<Meta = Record<string, any>, Context = any> {
    /** Unique identifier for the emitter instance */
    id?: string;

    /** Whether to enable debug mode */
    debug?: boolean;

    /** Delimiter for event path segments */
    delimiter?: string;

    /** Default execution context for event handlers */
    context?: Context;

    /** Whether to ignore listener errors */
    ignoreErrors?: boolean;

    /** Global metadata attached to all events */
    meta?: Meta;

    /** Callback when a listener is added */
    onAddListener?: (path: string[], listener: Function) => void;

    /** Callback when a listener is removed */
    onRemoveListener?: (path: string[], listener: Function) => void;

    /** Callback when all listeners are cleared */
    onClearListeners?: () => void;

    /** Callback when a listener throws an error */
    onListenerError?: (type: string, error: Error) => void;

    /** Callback after listeners are executed (debug mode only) */
    onExecuteListener?: (message: FastEventMessage, returns: any[], listeners: any[]) => void;
}
```

### Core Methods

#### Event Subscription

```typescript
// Add event listener
on(type: string, listener: Function): this

// Add one-time event listener
once(type: string, listener: Function): this

// Remove specific listener
off(type: string, listener: Function): this

// Remove all listeners for an event type
offAll(type?: string): this

// Clear all listeners
clear(): this
```

#### Event Emission

```typescript
// Emit event
emit(type: string, payload?: any, retain?: boolean, meta?: any): any[]
emit(message: FastEventMessage): any[]

// Emit event asynchronously
emitAsync(type: string, payload?: any, retain?: boolean, meta?: any): Promise<any[]>
emitAsync(message: FastEventMessage): Promise<any[]>
```

#### Scope Management

```typescript
// Create new scope
scope<Name extends string, Events extends Record<string, any> = Record<string, any>>(
    name: Name,
    options?: ScopeOptions
): FastEventScope<Events>
```

#### Retained Messages

```typescript
// Check for retained message
hasRetained(type: string): boolean

// Get retained message
getRetained(type: string): FastEventMessage | undefined

// Clear specific retained message
clearRetained(type: string): void

// Clear all retained messages
clearAllRetained(): void
```

### Properties

```typescript
// Number of registered listeners
readonly listenerCount: number

// Map of retained messages
readonly retainedMessages: Map<string, FastEventMessage>
```

## FastEventScope Class

A class that provides scoped event management.

### Methods

Inherits all methods from FastEvent class, with paths automatically prefixed with scope name.

```typescript
// Create nested scope
scope<Name extends string, Events extends Record<string, any> = Record<string, any>>(
    name: Name,
    options?: ScopeOptions
): FastEventScope<Events>

// Clear all listeners in scope
clear(): void
```

## Types

### FastEventMessage

```typescript
interface FastEventMessage<T = string, P = any, M = unknown> {
    /** Event type/path */
    type: T;

    /** Event payload */
    payload: P;

    /** Event metadata */
    meta: M;
}
```

### FastEventListener

```typescript
type FastEventListener<T = string, P = any, M = unknown> = (message: FastEventMessage<T, P, M>) => any;
```

### ScopeOptions

```typescript
interface ScopeOptions<Meta = Record<string, any>, Context = any> {
    /** Scope-specific metadata */
    meta?: Meta;

    /** Scope-specific context */
    context?: Context;
}
```

## Type Parameters

### FastEvent

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```

### FastEventScope

```typescript
class FastEventScope<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```
