import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Resilience & Context Invalidation Suite", () => {
  function isExtensionValid(chromeMock) {
    try {
      return typeof chromeMock !== "undefined" && !!chromeMock?.runtime && !!chromeMock?.runtime?.id;
    } catch (e) {
      return false;
    }
  }

  function calculateSafePosition(rect, iconPosition, scrollY = 0, scrollX = 0, innerWidth = 1024) {
    const bTop = typeof rect?.top === "number" ? rect.top : 0;
    const bBottom = typeof rect?.bottom === "number" ? rect.bottom : bTop;
    const bLeft = typeof rect?.left === "number" ? rect.left : 0;
    const bWidth = typeof rect?.width === "number" ? rect.width : 0;

    let top = (iconPosition === "below" ? bBottom + 8 : bTop - 36) + scrollY;
    let left = bLeft + (bWidth / 2) - 14 + scrollX;

    const safeTop = Number.isFinite(top) ? Math.max(8, top) : 8;
    const maxLeft = innerWidth ? innerWidth - 36 : 400;
    const safeLeft = Number.isFinite(left) ? Math.max(8, Math.min(maxLeft, left)) : 8;

    return { safeTop, safeLeft };
  }

  test("should detect valid extension context when runtime.id exists", () => {
    const validChrome = { runtime: { id: "mock_extension_id_123" } };
    assert.ok(isExtensionValid(validChrome));
  });

  test("should detect invalidated extension context safely when runtime is disconnected", () => {
    const invalidChrome = { runtime: { id: undefined } };
    assert.equal(isExtensionValid(invalidChrome), false);
    assert.equal(isExtensionValid(undefined), false);
  });

  test("should calculate safe positions and never return NaN", () => {
    // Standard rect
    const normalRect = { top: 100, bottom: 120, left: 200, width: 80 };
    const pos1 = calculateSafePosition(normalRect, "above", 50, 0, 1920);
    assert.ok(Number.isFinite(pos1.safeTop));
    assert.ok(Number.isFinite(pos1.safeLeft));
    assert.equal(pos1.safeTop, 100 - 36 + 50); // 114

    // Null or undefined rect fields (e.g. detached elements)
    const brokenRect = { top: undefined, bottom: undefined, left: NaN, width: null };
    const pos2 = calculateSafePosition(brokenRect, "above", 0, 0, 1920);
    assert.ok(Number.isFinite(pos2.safeTop));
    assert.ok(Number.isFinite(pos2.safeLeft));
    assert.equal(pos2.safeTop, 8);
    assert.equal(pos2.safeLeft, 8);
  });

  test("should constrain positions within viewport bounds", () => {
    const offscreenRect = { top: -200, bottom: -180, left: 3000, width: 100 };
    const pos = calculateSafePosition(offscreenRect, "above", 0, 0, 1000);
    assert.equal(pos.safeTop, 8); // clamped to min 8
    assert.equal(pos.safeLeft, 1000 - 36); // clamped to max window width
  });
});
