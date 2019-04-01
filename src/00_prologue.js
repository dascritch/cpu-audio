let template, shadow_element;

const thisDoc = (document._currentScript || document.currentScript).ownerDocument;
const CpuAudioTagName = 'CPU-AUDIO';
const CpuControllerTagName = 'CPU-CONTROLLER';
const selector_interface = '#interface';
const acceptable_selector = 'audio[controls]';
const acceptable_hide_atttributes = ['poster', 'actions', 'chapters'];
