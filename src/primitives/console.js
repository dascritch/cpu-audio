import { CpuAudioTagName } from './utils.js';

/**
 * @summary Shortcut for console info
 *
 * @param      {string}  message  The message
 */
export const info = (message) => window.console.info(`${CpuAudioTagName}▷ `,message);

/**
 * @summary Shortcut for console warning
 *
 * @param      {string}  message  The message
 */
export const warn = (message) => window.console.warn(`${CpuAudioTagName}▷ `,message);

/**
 * @summary Shortcut for console error
 *
 * @param      {string}  message  The message
 */
export const error = (message) => window.console.error(`${CpuAudioTagName}▷ `,message);
