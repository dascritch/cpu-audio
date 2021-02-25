export const CpuAudioTagName = 'CPU-AUDIO';
export const CpuControllerTagName = 'CPU-CONTROLLER';
export const selector_interface = '#interface';
export const acceptable_selector = 'audio[controls]';

// Acceptables attributes values for hide="" parameter on webcomponent
// @private
export const acceptable_hide_atttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];

// Regex used to validate planes, points and injected css names
// @private
export const valid_id = /^[a-zA-Z0-9\-_]+$/;

// Regex for extracting plane and point names from an id
// @private
export const plane_point_names_from_id = /^([a-zA-Z0-9\-_]+_«)([a-zA-Z0-9\-_]+)((»_.*_«)([a-zA-Z0-9\-_]+))?(»)$/;


// should be put in CPU-controller ?
export let preview_classname = 'with-preview';

// For addEventListener
// @private
export const passive_ev = {'passive': true};
// @private
export const once_passive_ev = {'passive':true, 'once':true};