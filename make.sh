#!/bin/bash

HELP=$(cat <<-HELP

Usage: make.sh [OPTIONS] [DESTINATION]

Build the cpu-audio webcomponent source.

Projet repo
  → http://github.com/dascritch/cpu-audio

Options:
  -h, --help            Display this message.
  -c, --clean        	Clean dist/ directory
  -d, --debug           Used for ease debug.
  -a, --advanced        Tries 'ADVANCED_OPTIMIZATIONS' for Google Closure. ONLY FOR LINT/VERIFICATIONS, NOT PRODUCTION ! (yet)

DESTINATION is a sftp URL where to copy the builded files

Needed utilities : 
— tr (GNU coreutils) 8.26
— sed
— Google Closure (need Java 8). See https://github.com/google/closure-compiler/wiki/Binary-Downloads
HELP
)

PROJECT_DIR=$(readlink -f $(dirname ${0}))
component_file_js="cpu-audio.js" 

JS_COMPILATION_LEVEL='SIMPLE_OPTIMIZATIONS'
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
			JS_COMPILATION_LEVEL='ADVANCED_OPTIMIZATIONS'
			component_file_js='cpu-audio.EXPERIMENTAL.js'
		;;
		-d|--debug)
			JS_COMPILATION_LEVEL='BUNDLE'
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

DESTINATION=${1}

function _clean() {
	mkdir -p ${PROJECT_DIR}/tmp
	rm ${PROJECT_DIR}/tmp/*
}

function _remove_spaces() {
	from=${1}
	to=${2}

	cat "${from}"  | sed  -r 's/\/\*.*\*\// /g' | tr '\n' ' '  | sed -r 's/[\t ]+/ /g' > "${to}"
}

function _build_template() {
	# for file in 'global.css' 'scoped.css' # 'template.html'
	# do
	# 	_remove_spaces "${PROJECT_DIR}/src/${file}" "${PROJECT_DIR}/tmp/${file}"
	# done

	npx clean-css-cli -o tmp/global.css src/global.css 
	npx clean-css-cli -o tmp/scoped.css src/scoped.css 

	npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace src/template.html -o tmp/template.html


	global_css=$(cat "${PROJECT_DIR}/tmp/global.css")
	scoped_css=$(cat "${PROJECT_DIR}/tmp/scoped.css")
	template_html=$(cat "${PROJECT_DIR}/tmp/template.html")

	echo "// auto-generated source, done via make.sh
import {__} from '../src/10_i18n.js'
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

function _build_component_js_closure() {

#	java -jar /usr/share/java/closure-compiler.jar \
	npx google-closure-compiler \
		--compilation_level ${JS_COMPILATION_LEVEL} \
			--use_types_for_optimization=true \
			--summary_detail_level=3 \
		--isolation_mode=IIFE \
		--assume_function_wrapper \
		--module_resolution=BROWSER \
		--js ./src/license.txt \
		--js ./src/{00_prologue,10_i18n,../tmp/insert_template,11_utils,20_convert,30_trigger,40_document_cpu,45_element_cpu,50_media_element_extension,70_cpu_controller.class,71_cpu_audio.class,90_main}.js \
		--js_module_root "/90_main.js" \
		   --language_in ECMASCRIPT_2020 \
				--module_resolution BROWSER \
				--js_module_root src \
				--strict_mode_input \
		--js_output_file "./dist/${component_file_js}" \
			--language_out ECMASCRIPT_2019 \
		--create_source_map "./dist/${component_file_js}.map" \
		--warning_level VERBOSE \
		${OTHER_OPTIONS}
# 		--entry_point "./src/90_main.js" \
}

function _build_component_js_webpack() {
	npx webpack --mode ${webpack_mode} --target es2020 --entry ./src/90_main.js --output-path ./dist --output-filename ${component_file_js}
}


function _copy_to_server() {
	if [ '' != "${DESTINATION}" ] ; then
		scp ${PROJECT_DIR}/dist/cpu-audio.html ${DESTINATION}/cpu-audio.html
		scp ${PROJECT_DIR}/dist/cpu-audio.js ${DESTINATION}/cpu-audio.js
	fi
}


# main

_clean

# It fails ? crash
set -e

_build_template
_build_component_js_webpack

_copy_to_server

