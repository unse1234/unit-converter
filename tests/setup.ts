import '@testing-library/jest-dom/vitest';

// jsdom does no layout, so scrolling APIs are missing. Components call
// scrollIntoView to keep the active option of a list in view.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
