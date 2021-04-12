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
			rm ${PROJECT_DIR}/tmp/*
			shift
			THEME_NAME=${1}
		;;
		--all-themes)
			ALL_THEMES=1
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

tmp_template_html='/dev/null'

function _retarget_src_files() {
	theme_key="${1}"
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

	filename_template_html="${PROJECT_DIR}/tmp/template.${THEME_NAME}.html"
	filename_global_css="${PROJECT_DIR}/tmp/global.${THEME_NAME}.css"
	filename_scoped_css="${PROJECT_DIR}/tmp/scoped.${THEME_NAME}.css"

	filename_insert_template_js="${PROJECT_DIR}/tmp/insert_template.${THEME_NAME}.js"

	THEME_OUTPUT=""
	if [[ "default" != "${THEME_NAME}"  ]] ; then
		THEME_OUTPUT=".${THEME_NAME}"
	fi

	build_component_relative_path="cpu-audio${THEME_OUTPUT}.js"
}

function _clean_too_old() {
	SRC_FILE=${1}
	TMP_FILE=${2}
	if [ "${TMP_FILE}" -ot "${SRC_FILE}" ]; then
		echo "${TMP_FILE} needs refresh"
		rm ${TMP_FILE}
	fi
}

function _clean() {
	_clean_too_old ${SRC_TEMPLATE} ${filename_template_html}
	_clean_too_old ${SRC_GLOBAL}   ${filename_global_css}
	_clean_too_old ${SRC_SCOPED}   ${filename_scoped_css} 
}

function _build_template() {
	echo 'compress'
	if [ ! -f ${filename_global_css} ] ; then
		echo ".. ${filename_global_css}"
		npx clean-css-cli -o ${filename_global_css} ${SRC_GLOBAL}
	fi
	if [ ! -f ${filename_scoped_css} ] ; then
		echo ".. scoped.${THEME_NAME}.css"
		npx clean-css-cli -o ${filename_scoped_css} ${SRC_SCOPED}
	fi
	if [ ! -f ${filename_template_html} ] ; then
		echo ".. ${filename_template_html}"
		npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace ${SRC_TEMPLATE} -o ${filename_template_html}
	fi

	content_global_css=$(cat "${filename_global_css}")
	content_scoped_css=$(cat "${filename_scoped_css}")
	content_template_html=$(cat "${filename_template_html}")

	echo "// auto-generated source, done via make.sh
			import {__} from '../src/i18n.js';
			/** @summary insert styles and template into host document */
			export function insert_style() {
				const style = document.createElement('style');
				style.innerHTML = \`${content_global_css}\`;
				document.head.appendChild(style);
			}

			export function template() {
				return \`<style>${content_scoped_css}</style>${content_template_html}\`;
			}
		" > "${filename_insert_template_js}"
	ln --force -- "${filename_insert_template_js}" "${PROJECT_DIR}/tmp/insert_template.js"
}

function _build_component_js_webpack() {
	echo "webpacking to build/${build_component_relative_path}"
	npx webpack --config ${PROJECT_DIR}/webpack.config.js --mode ${webpack_mode} --target es2020 --entry ${PROJECT_DIR}/src/index.js --output-path ${PROJECT_DIR}/build --output-filename ${build_component_relative_path} ${OTHER_OPTIONS}
	
	echo -e "\n// Generated theme : ${THEME_NAME}\n" >> build/${build_component_relative_path}
	if [ "1" == "${TESTS}" ] ; then
		ls -l build/${build_component_relative_path}*
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

function build() {
	_retarget_src_files ${THEME_NAME}
	_clean
	_build_template
	_build_component_js_webpack
}

# It fails ? crash
set -e

if [[ '1' == ${ALL_THEMES} ]] ; then
	for entry in src/themes/* ; do
		THEME_NAME=$(basename -- ${entry}) 
		echo "build theme ${THEME_NAME}"
		build
	done
else
	build
fi

if [ "1" == "${TESTS}" ] ; then
	_tests
fi

if [ "1" == "${REINDEX}" ] ; then
	_recreate_index
fi

if [[ '1' == ${ALL_THEMES} ]] ; then
	ls -l ${PROJECT_DIR}/build/*
else
	ls -l ${PROJECT_DIR}/build/${build_component_relative_path}*
fi