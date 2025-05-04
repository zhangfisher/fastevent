# Overview

FastEvent is a powerful, type-safe event library designed for modern JavaScript/TypeScript applications. It provides a flexible event handling mechanism with advanced features like namespaces, scope isolation, and event retention, making event-driven programming simple and elegant.

## Why Choose FastEvent?

FastEvent is not just another event emitter; it's a comprehensive event management solution:

-   Type Safety: Complete TypeScript support with precise type inference
-   High Performance: Optimized event dispatch mechanism with minimal overhead
-   Flexibility: Supports various event patterns for different application scenarios
-   Reliability: Comprehensive error handling and debugging support

## Core Features

🚀 **Complete TypeScript Support**: Provides comprehensive type definitions and inference for safer, more reliable code

🌳 **Hierarchical Event System**: Supports event hierarchies using delimiters (like '/') for better organization and management

🎯 **Scope Isolation**: Create independent event scopes through the scope API for modular event management

🔄 **Event Retention**: Support for retaining the last event, allowing new subscribers to immediately receive the latest state

🌟 **Flexible Wildcards**: Support for single-level (*) and multi-level (**) wildcards for flexible event matching

🛡️ **Error Handling**: Comprehensive error capture and handling options for enhanced application stability

⚡ **Sync/Async Support**: Support for both synchronous and asynchronous event triggering to meet different scenarios

🎨 **Metadata Extension**: Support for custom event metadata to provide richer context information

🔍 **Debug-Friendly**: Built-in debug mode to help developers track event flow

🎮 **Context Control**: Support for customizing event handler execution context with flexible 'this' binding

📦 **Lightweight Design**: Zero dependencies for core functionality, small bundle size, suitable for various projects

🔌 **Plugin Architecture**: Hook mechanism for feature extension and custom behavior

🎭 **Multiple Subscription Modes**: Support for one-time subscriptions, counted subscriptions, and more

⏳ **Timeout Control**: Support for setting timeout when waiting for events to avoid infinite waiting

🔗 **Method Chaining**: Support for method chaining for a fluent API experience

## Quick Start

```typescript
import { FastEvent } from 'fastevent';

// Create event emitter
const emitter = new FastEvent();

// Listen to events
emitter.on('user/login', (message) => {
    console.log(`User login: ${message.payload}`);
});

// Create scope
const userScope = emitter.scope('user');
userScope.on('logout', (message) => {
    console.log(`User logout: ${message.payload}`);
});

// Trigger events
emitter.emit('user/login', { userId: 123 });
userScope.emit('logout', { userId: 123 });
```

FastEvent makes event-driven programming simple yet powerful, capable of handling various event processing needs in both small projects and large applications.