#!/bin/bash

HELP=$(cat <<-HELP

Usage: make.sh [OPTIONS]

Build the cpu-audio webcomponent source.

Projet repo
  → http://github.com/dascritch/cpu-audio

Options:
  -h, --help            Display this message
  -c, --clean        	Clean build/ directory
  -d, --debug           Used for ease debug.
  -t, --test        	Run tests after (ev.) compression
  -i, --index        	Recreate INDEX.md with examples and applications
  --theme THEME_NAME    Build especially THEME_NAME variant
  --all-themes			Build all themes
Needed utilities : 
— npm/npx

Optimal options for release :
./make.sh --clean --test --index --all-themes
HELP
)

PROJECT_DIR=$(readlink -f $(dirname ${0}))

OTHER_OPTIONS=' --no-devtool'
OTHER_OPTIONS=' --devtool source-map'
webpack_mode='production'

THEME_NAME="default"
THEME_OUTPUT=''
ALL_THEMES=0
TESTS=0
REINDEX=0

SRC_TEMPLATE="${PROJECT_DIR}/src/themes/default/template.html"
SRC_GLOBAL="${PROJECT_DIR}/src/themes/default/global.css"
SRC_SCOPED="${PROJECT_DIR}/src/themes/default/scoped.css"

mkdir -p ${PROJECT_DIR}/tmp

while [ '-' == "${1:0:1}" ] ; do
	case "${1}" in
		-h|--help)
			echo "${HELP}"
			exit 0
		;;
		-c|--clean)
			echo 'cleaning build/*'
			rm ${PROJECT_DIR}/build/*
			rm ${PROJECT_DIR}/tmp/*
		;;
		-d|--debug)
			OTHER_OPTIONS=' --devtool source-map'
			webpack_mode='development'
		;;
		-t|--test)
			TESTS=1
		;;
		-i|--index)
			REINDEX=1
		;;
		--theme)
			shift
			THEME_NAME=${1}
			THEME_OUTPUT=".${THEME_NAME}"
		;;
		--all-themes)
			ALL_THEMES=1
			echo "NO YET"
			exit 1
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

function _retarget_src_files() {
	if [ -f "${PROJECT_DIR}/src/themes/${THEME_NAME}/template.html" ] ; then
		SRC_TEMPLATE="${PROJECT_DIR}/src/themes/${THEME_NAME}/template.html"
	else
		echo "No template.html in ${THEME_NAME} theme, will use ${SRC_TEMPLATE} instead"
	fi
	if [ -f "${PROJECT_DIR}/src/themes/${THEME_NAME}/global.css" ] ; then
		SRC_GLOBAL="${PROJECT_DIR}/src/themes/${THEME_NAME}/global.css"
	else
		echo "No global.css in ${THEME_NAME} theme, will use ${SRC_GLOBAL} instead"
	fi
	if [ -f "${PROJECT_DIR}/src/themes/${THEME_NAME}/scoped.css" ] ; then
		SRC_SCOPED="${PROJECT_DIR}/src/themes/${THEME_NAME}/scoped.css"
	else
		echo "No scoped.css in ${THEME_NAME} theme, will use ${SRC_SCOPED} instead"
	fi
}

function _clean_too_old() {
	SRC_FILE=${1}
	TMP_FILE=${1}
	if [ "${TMP_FILE}" -ot "${SRC_FILE}" ]; then
		echo "${TMP_FILE} needs refresh"
		rm ${TMP_FILE}
	fi
}

function _clean() {
	_clean_too_old ${SRC_TEMPLATE} tmp/template.html
	_clean_too_old ${SRC_GLOBAL}   tmp/global.css 
	_clean_too_old ${SRC_SCOPED}   tmp/scoped.css 
}

function _build_template() {
	echo 'compress'
	if [ ! -f tmp/global.css ] ; then
		echo '.. global.css'
		npx clean-css-cli -o tmp/global.css ${SRC_GLOBAL}
	fi
	if [ ! -f tmp/scoped.css ] ; then
		echo '.. scoped.css'
		npx clean-css-cli -o tmp/scoped.css ${SRC_SCOPED}
	fi
	if [ ! -f tmp/template.html ] ; then
		echo '.. template.html'
		npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace ${SRC_TEMPLATE} -o tmp/template.html
	fi

	global_css=$(cat "${PROJECT_DIR}/tmp/global.css")
	scoped_css=$(cat "${PROJECT_DIR}/tmp/scoped.css")
	template_html=$(cat "${PROJECT_DIR}/tmp/template.html")

	echo "// auto-generated source, done via make.sh
import {__} from '../src/i18n.js';
/** @summary insert styles and template into host document */
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

function _build_component_js_webpack() {
	echo 'webpacking'
	component_file_js="cpu-audio${THEME_OUTPUT}.js"
	npx webpack --config ${PROJECT_DIR}/webpack.config.js --mode ${webpack_mode} --target es2020 --entry ${PROJECT_DIR}/src/index.js --output-path ${PROJECT_DIR}/build --output-filename ${component_file_js} ${OTHER_OPTIONS}
	if [[ "${THEME_NAME}" != "default" ]] ; then
		echo -e "\n// Generated theme : ${THEME_NAME}\n" >> ${PROJECT_DIR}/build/${component_file_js}
	fi
}

function _tests() {
	# watchout to NOT inclue "browser", which is only a browsder comptability test, and Chrome fails it
	for chapter in minimal api interface; do
    	npx node-qunit-puppeteer "tests/tests-${chapter}.html" 150000 "--allow-file-access-from-files --no-sandbox --autoplay-policy=no-user-gesture-required --user-agent=puppeteer"
	done
}

function _recreate_index() {
	EXAMPLES_MD=${PROJECT_DIR}/EXAMPLES.md
	EXAMPLES_HTML=${PROJECT_DIR}/examples.html
	rm ${EXAMPLES_MD}
	rm ${EXAMPLES_HTML}
	echo -e "\n\n### Examples\n\n" >> ${EXAMPLES_MD}
	echo "<h2>Examples</h2><ul>" >> ${EXAMPLES_HTML}
	for line in $(ls -1 examples/*.html); do 
		echo " * [${line}](${line})" >> ${EXAMPLES_MD}
		echo "<li><a href='${line}'>${line}</a></li>" >> ${EXAMPLES_HTML}
	done

	echo -e "\n\n### Applications\n\n" >> ${EXAMPLES_MD}
	echo "</ul><h2>Applications</h2><ul>" >> ${EXAMPLES_HTML}
	for line in $(ls -1 applications/*.html); do 
		echo " * [${line}](${line})" >> ${EXAMPLES_MD}
		echo "<li><a href='${line}'>${line}</a></li>" >> ${EXAMPLES_HTML}
	done
	echo "</ul>" >> ${EXAMPLES_HTML}

	echo -e "\n\n### Tests\n\n" >> ${EXAMPLES_MD}
	echo "</ul><h2>Tests</h2><ul>" >> ${EXAMPLES_HTML}
	for line in $(ls -1 tests/*.html); do 
		echo " * [${line}](${line})" >> ${EXAMPLES_MD}
		echo "<li><a href='${line}'>${line}</a></li>" >> ${EXAMPLES_HTML}
	done
	echo "</ul>" >> ${EXAMPLES_HTML}
}


_retarget_src_files
_clean

# It fails ? crash
set -e

_build_template
_build_component_js_webpack

if [ "1" == "${TESTS}" ] ; then
	_tests
fi

if [ "1" == "${REINDEX}" ] ; then
	_recreate_index
fi

ls -l ${PROJECT_DIR}/build/*