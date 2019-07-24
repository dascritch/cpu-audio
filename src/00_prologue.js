let template, shadow_element;

const thisDoc = (document._currentScript || document.currentScript).ownerDocument;
const CpuAudioTagName = 'CPU-AUDIO';
const CpuControllerTagName = 'CPU-CONTROLLER';
const selector_interface = '#interface';
const acceptable_selector = 'audio[controls]';
const acceptable_hide_atttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];
const valid_id = /^[a-zA-Z0-9\-_]+$/;
const plane_point_names_from_id = /^([a-zA-Z0-9\-_]+_«)([a-zA-Z0-9\-_]+)((»_.*_«)([a-zA-Z0-9\-_]+))?(»)$/;
let preview_classname = 'with-preview';
const passive_ev = {passive: true};