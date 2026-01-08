import { describe, it, expect, beforeEach } from 'vitest';
import { ViewStateManager } from '../src/utils/viewStateManager.js';

describe('ViewStateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ViewStateManager();
  });

  describe('constructor', () => {
    it('should initialize with year view', () => {
      expect(manager.getCurrentView()).toBe('year');
      expect(manager.canGoBack()).toBe(false);
    });
  });

  describe('pushView', () => {
    it('should add view to stack and update current view', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      
      expect(manager.getCurrentView()).toBe('monthDays');
      expect(manager.canGoBack()).toBe(true);
    });

    it('should store context with view', () => {
      const context = { monthIndex: 5 };
      manager.pushView('monthDays', context);
      
      const current = manager.peekCurrent();
      expect(current.context).toEqual(context);
    });

    it('should allow pushing multiple views', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      manager.pushView('hours', {});
      manager.pushView('minutes', {});
      
      expect(manager.getCurrentView()).toBe('minutes');
      expect(manager.canGoBack()).toBe(true);
    });
  });

  describe('popView', () => {
    it('should return null when stack is empty', () => {
      const result = manager.popView();
      expect(result).toBeNull();
      expect(manager.getCurrentView()).toBe('year');
    });

    it('should return previous view and update current view', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      manager.pushView('hours', {});
      
      const previous = manager.popView();
      
      expect(previous.name).toBe('monthDays');
      expect(previous.context.monthIndex).toBe(0);
      expect(manager.getCurrentView()).toBe('monthDays');
    });

    it('should restore correct view order', () => {
      manager.pushView('monthDays', { monthIndex: 5 });
      manager.pushView('hours', {});
      manager.pushView('minutes', {});
      
      expect(manager.getCurrentView()).toBe('minutes');
      
      const view1 = manager.popView();
      expect(view1.name).toBe('hours');
      expect(manager.getCurrentView()).toBe('hours');
      
      const view2 = manager.popView();
      expect(view2.name).toBe('monthDays');
      expect(view2.context.monthIndex).toBe(5);
      expect(manager.getCurrentView()).toBe('monthDays');
      
      const view3 = manager.popView();
      expect(view3.name).toBe('year');
      expect(manager.getCurrentView()).toBe('year');
      expect(manager.canGoBack()).toBe(false);
    });

    it('should preserve context when popping', () => {
      const context = { monthIndex: 3, day: 15 };
      manager.pushView('monthDays', context);
      manager.pushView('hours', {});
      
      const previous = manager.popView();
      expect(previous.context).toEqual(context);
    });
  });

  describe('getCurrentView', () => {
    it('should return year initially', () => {
      expect(manager.getCurrentView()).toBe('year');
    });

    it('should return current view name', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      expect(manager.getCurrentView()).toBe('monthDays');
      
      manager.pushView('hours', {});
      expect(manager.getCurrentView()).toBe('hours');
    });
  });

  describe('canGoBack', () => {
    it('should return false when at root', () => {
      expect(manager.canGoBack()).toBe(false);
    });

    it('should return true when view stack has entries', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      expect(manager.canGoBack()).toBe(true);
    });

    it('should return false after popping all views', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      manager.popView();
      expect(manager.canGoBack()).toBe(false);
    });
  });

  describe('peekCurrent', () => {
    it('should return current view object', () => {
      manager.pushView('monthDays', { monthIndex: 2 });
      
      const current = manager.peekCurrent();
      expect(current.name).toBe('monthDays');
      expect(current.context.monthIndex).toBe(2);
    });

    it('should return year view object when at root', () => {
      const current = manager.peekCurrent();
      expect(current.name).toBe('year');
      expect(current.context).toEqual({});
    });
  });

  describe('getViewStack', () => {
    it('should return empty array initially', () => {
      const stack = manager.getViewStack();
      expect(stack).toEqual([]);
    });

    it('should return view stack in order', () => {
      manager.pushView('monthDays', { monthIndex: 0 });
      manager.pushView('hours', {});
      
      const stack = manager.getViewStack();
      expect(stack).toHaveLength(2);
      expect(stack[0].name).toBe('monthDays');
      expect(stack[1].name).toBe('hours');
    });
  });
});