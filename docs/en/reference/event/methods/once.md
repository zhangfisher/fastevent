# once

Register a one-time event listener that automatically unsubscribes after receiving the event once.

The `once` method is simply a shortcut for `on(event, payload, { count: 1 })`.
