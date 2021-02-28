#!/bin/bash

HELP=$(cat <<-HELP

Usage: make.sh [OPTIONS]

Build the cpu-audio webcomponent source.

Projet repo
  → http://github.com/dascritch/cpu-audio

Options:
  -h, --help            Display this message.
  -c, --clean        	Clean dist/ directory
  -d, --debug           Used for ease debug.
  -a, --advanced        Tries 'ADVANCED_OPTIMIZATIONS' for Google Closure. DEPRECIATED

Needed utilities : 
— npm/npx
HELP
)

PROJECT_DIR=$(readlink -f $(dirname ${0}))
component_file_js="cpu-audio.js" 

OTHER_OPTIONS=''
webpack_mode='production'

while [ '-' == "${1:0:1}" ] ; do
	case "${1}" in
		-h|--help)
			echo "${HELP}"
			exit 0
		;;
		-c|--clean)
			echo 'cleaning dist/*'
			rm ${PROJECT_DIR}/dist/*
		;;
		-a|--advanced)
			component_file_js='cpu-audio.EXPERIMENTAL.js'
		;;
		-d|--debug)
			OTHER_OPTIONS=' --debug '
			webpack_mode='development'
		;;
		--)
			shift
			break
		;;
		*)
		  echo "Invalid \"${1}\" option. See ${0} --help"
		  exit 1
	   ;;
	esac
	shift
done

function _clean() {
	mkdir -p ${PROJECT_DIR}/tmp
	rm ${PROJECT_DIR}/tmp/*
}

function _build_template() {

	npx clean-css-cli -o tmp/global.css src/global.css 
	npx clean-css-cli -o tmp/scoped.css src/scoped.css 

	npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace src/template.html -o tmp/template.html

	global_css=$(cat "${PROJECT_DIR}/tmp/global.css")
	scoped_css=$(cat "${PROJECT_DIR}/tmp/scoped.css")
	template_html=$(cat "${PROJECT_DIR}/tmp/template.html")

	echo "// auto-generated source, done via make.sh
import {__} from '../src/i18n.js'
export function insert_template(){
	let style = document.createElement('style');
	style.innerHTML = \`${global_css}\`;
	document.head.appendChild(style);

	let template = document.createElement('template');
	template.id = 'CPU__template';
	template.innerHTML = \`<style>${scoped_css}</style>${template_html}\`;
	document.head.appendChild(template);
}" > "${PROJECT_DIR}/tmp/insert_template.js"

}

license="/**

$(cat ${PROJECT_DIR}/src/license.txt)

**/
//# sourceMappingURL=./cpu-audio.js.map

"

function _build_component_js_webpack() {
	npx webpack --mode ${webpack_mode} --target es2020 --entry ./src/index.js --output-path ./dist --output-filename ${component_file_js} --devtool source-map 
}


_clean

# It fails ? crash
set -e

_build_template
_build_component_js_webpack
