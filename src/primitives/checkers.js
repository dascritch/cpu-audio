// Determines if the hosting browser can use webcomponents.
export const browserIsDecent = window.customElements !== undefined;

// Checks if we are in a screen context, and not a vocal or braille interface
export const notScreenContext = !window.matchMedia('screen').matches;
