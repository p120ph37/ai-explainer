/**
 * Tests for the discovery callback system
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { onDiscovery, markTopicDiscovered, resetAllProgress } from '@/app/progress.ts';

// Helper to create a mock element
const createMockElement = () => {
  const element = document.createElement('a');
  // Add minimal DOM properties that might be accessed
  element.getBoundingClientRect = () => ({
    top: 100,
    left: 100,
    width: 50,
    height: 20,
    bottom: 120,
    right: 150,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  });
  return element as HTMLElement;
};

describe('Discovery Callbacks', () => {
  beforeEach(() => {
    resetAllProgress();
  });

  test('callback is invoked when topic is first discovered', () => {
    const callback = mock((_nodeId: string, _sourceElement: HTMLElement) => {});
    
    onDiscovery(callback);
    
    const mockElement = createMockElement();
    markTopicDiscovered('new-topic', mockElement);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('callback receives correct nodeId', () => {
    let receivedNodeId: string | null = null;
    
    onDiscovery((nodeId) => {
      receivedNodeId = nodeId;
    });
    
    const mockElement = createMockElement();
    markTopicDiscovered('specific-topic', mockElement);
    
    expect(receivedNodeId).toBe('specific-topic');
  });

  test('callback receives source element', () => {
    let receivedElement: HTMLElement | null = null;
    
    onDiscovery((_, sourceElement) => {
      receivedElement = sourceElement;
    });
    
    const mockElement = createMockElement();
    markTopicDiscovered('topic-with-element', mockElement);
    
    expect(receivedElement).toBe(mockElement);
  });

  test('callback is NOT invoked when sourceElement is null', () => {
    const callback = mock(() => {});
    
    onDiscovery(callback);
    
    // Passing null/undefined should not trigger callback
    markTopicDiscovered('topic-no-element');
    
    expect(callback).not.toHaveBeenCalled();
  });

  test('callback is NOT invoked for already discovered topic', () => {
    const callback = mock(() => {});
    
    // Discover first (without callback)
    markTopicDiscovered('already-discovered', createMockElement());
    
    // Then subscribe
    onDiscovery(callback);
    
    // Try to discover again
    markTopicDiscovered('already-discovered', createMockElement());
    
    expect(callback).not.toHaveBeenCalled();
  });

  test('unsubscribe stops callback invocations', () => {
    const callback = mock(() => {});
    
    const unsubscribe = onDiscovery(callback);
    
    markTopicDiscovered('topic-1', createMockElement());
    expect(callback).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    
    markTopicDiscovered('topic-2', createMockElement());
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  test('multiple callbacks can be registered', () => {
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});
    
    onDiscovery(callback1);
    onDiscovery(callback2);
    
    markTopicDiscovered('multi-callback-topic', createMockElement());
    
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('callbacks are independent for unsubscribe', () => {
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});
    
    const unsub1 = onDiscovery(callback1);
    onDiscovery(callback2);
    
    unsub1(); // Only unsubscribe callback1
    
    markTopicDiscovered('independent-topic', createMockElement());
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('return value indicates if topic was newly discovered', () => {
    const mockElement = createMockElement();
    
    const firstResult = markTopicDiscovered('return-test-topic', mockElement);
    expect(firstResult).toBe(true);
    
    const secondResult = markTopicDiscovered('return-test-topic', mockElement);
    expect(secondResult).toBe(false);
  });
});
