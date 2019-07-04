#!/bin/bash

HELP=$(cat <<-HELP

Usage: make.sh [OPTIONS] [DESTINATION]

Build the cpu-audio webcomponent source.

Projet repo
  → http://github.com/dascritch/cpu-audio

Options:
  -h, --help            Display this message.

DESTINATION is a sftp URL where to copy the builded files

Needed utilities : 
— tr (GNU coreutils) 8.26
— sed
— Google Closure (need Java 8). See https://github.com/google/closure-compiler/wiki/Binary-Downloads
HELP
)

PROJECT_DIR=$(readlink -f $(dirname ${0}))

JS_COMPILATION_LEVEL='SIMPLE_OPTIMIZATIONS'

while [ '-' == "${1:0:1}" ] ; do
	case "${1}" in
		-h|--help)
			echo "${HELP}"
			exit 0
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
	rm ${PROJECT_DIR}/dist/*
	rm ${PROJECT_DIR}/tmp/*    
}

function _remove_spaces() {
	from=${1}
	to=${2}

	cat "${from}"  | sed  -r 's/\/\*.*\*\// /g' | tr '\n' ' '  | sed -r 's/[\t ]+/ /g' > "${to}"
}

function _build_template() {
	for file in 'template.html' 'global.css' 'scoped.css'
	do
		_remove_spaces "${PROJECT_DIR}/src/${file}" "${PROJECT_DIR}/tmp/${file}"
	done

	global_css=$(cat "${PROJECT_DIR}/tmp/global.css")
	scoped_css=$(cat "${PROJECT_DIR}/tmp/scoped.css")
	template_html=$(cat "${PROJECT_DIR}/tmp/template.html")

	echo "function _insert(){
		let style = document.createElement('style');
		style.innerHTML = \`${global_css}\`;
		document.head.appendChild(style);

		let template = document.createElement('template');
		template.id = 'CPU__template';
		template.innerHTML = \`<style>${scoped_css}</style>${template_html}\`;
		document.head.appendChild(template);
	}
	if (document.head !== null) {
		_insert();
	} else {
		document.addEventListener('DOMContentLoaded', _insert, false);
	}" > "${PROJECT_DIR}/tmp/insert_template.js"

}

license="/**

$(cat ${PROJECT_DIR}/src/license.txt)

**/
//# sourceMappingURL=./cpu-audio.js.map

"

function _build_component_js() {

	component_file_js="./dist/cpu-audio.js" # ${PROJECT_DIR}

	java -jar /usr/share/java/closure-compiler.jar \
		--compilation_level ${JS_COMPILATION_LEVEL} \
			--use_types_for_optimization=true \
			--summary_detail_level=3 \
		--isolation_mode=IIFE \
		--assume_function_wrapper \
		--js ./src/license.txt \
		--js ./src/{00_prologue,10_i18n,../tmp/insert_template,11_utils,20_convert,30_trigger,40_document_cpu,45_element_cpu,50_media_element_extension,70_cpu_controller.class,71_cpu_audio.class,90_main}.js \
		--entry_point "./src/90_main.js" \
		   --language_in ECMASCRIPT_2017 \
				--module_resolution BROWSER \
				--js_module_root src --jscomp_off internetExplorerChecks \
				--strict_mode_input \
		--js_output_file "${component_file_js}" \
			--language_out ECMASCRIPT_2017 \
		--create_source_map "${component_file_js}.map" 
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
_build_component_js

_copy_to_server

