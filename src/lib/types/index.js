// Type definitions are provided as JSDoc comments for better code editors support
// but are not enforced at runtime

/**
 * Represents a stored audio recording
 * @typedef {Object} Recording
 * @property {string} id - Unique identifier
 * @property {Blob} blob - Audio data
 * @property {Date} date - Recording date
 * @property {string} url - Object URL
 * @property {string} name - Recording name
 * @property {number} duration - Duration in seconds
 */

/**
 * Recording progress information
 * @typedef {Object} RecordingProgress
 * @property {number|null} start_time - Recording start timestamp
 * @property {number} duration - Duration in seconds
 * @property {boolean} is_active - Whether recording is active
 */

/**
 * Playback state information
 * @typedef {Object} PlaybackState
 * @property {boolean} is_playing - Whether audio is playing
 * @property {number} current_time - Current playback position
 * @property {number} duration - Total duration
 * @property {number} playback_rate - Playback speed
 * @property {boolean} repeat - Whether to repeat playback
 */
