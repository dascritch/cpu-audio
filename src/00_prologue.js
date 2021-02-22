let template, shadow_element;

const thisDoc = (document._currentScript || document.currentScript).ownerDocument;
const CpuAudioTagName = 'CPU-AUDIO';
const CpuControllerTagName = 'CPU-CONTROLLER';
const selector_interface = '#interface';
const acceptable_selector = 'audio[controls]';

// Acceptables attributes values for hide="" parameter on webcomponent
// @private
const acceptable_hide_atttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];

// Regex used to validate planes, points and injected css names
// @private
const valid_id = /^[a-zA-Z0-9\-_]+$/;

// Regex for extracting plane and point names from an id
// @private
const plane_point_names_from_id = /^([a-zA-Z0-9\-_]+_«)([a-zA-Z0-9\-_]+)((»_.*_«)([a-zA-Z0-9\-_]+))?(»)$/;

// Add regexes used for WebVTT tag validation
// @private
const regex_vtt = {
	opentag : /<(\w+)(\.[^>]+)?( [^>]+)?>/gi,
	closetag : /<\/(\w+)( [^>]*)?>/gi
};

// should be put in CPU-controller ?
let preview_classname = 'with-preview';

// For addEventListener
// @private
const passive_ev = {'passive': true};
// @private
const once_passive_ev = {'passive':true, 'once':true};