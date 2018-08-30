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
# JS_COMPILATION_LEVEL='ADVANCED_OPTIMIZATIONS'
JS_COMPILATION_LEVEL='SIMPLE_OPTIMIZATIONS'
# JS_COMPILATION_LEVEL='WHITESPACE_ONLY'

mkdir -p ${PROJECT_DIR}/tmp
rm ${PROJECT_DIR}/dist/*
rm ${PROJECT_DIR}/tmp/*

# It fails ? crash
set -e

for file in 'template.html' 'global.css' 'scoped.css'
    do
    cat "${PROJECT_DIR}/src/${file}" | tr '\n' ' ' | sed -r 's/[\t ]+/ /g' > "${PROJECT_DIR}/tmp/${file}"
done

# Build a dummy for readibility

echo '' > "${PROJECT_DIR}/tmp/UNCOMPRESSED.js"
for src in ${PROJECT_DIR}/src/{prologue,i18n,utils,convert,trigger,document_cpu,element_cpu,media_element_extension,cpu_controller.class,cpu_audio.class,main}.js ; do
    echo "/* ${src} */" >> "${PROJECT_DIR}/tmp/UNCOMPRESSED.js"
    cat $src >> "${PROJECT_DIR}/tmp/UNCOMPRESSED.js"
done


# Build player lib for dist

java -jar /usr/share/java/closure-compiler.jar \
    --compilation_level ${JS_COMPILATION_LEVEL} \
        --use_types_for_optimization=true \
        --summary_detail_level=3 \
    --js ${PROJECT_DIR}/src/{prologue,i18n,utils,convert,trigger,document_cpu,element_cpu,media_element_extension,cpu_controller.class,cpu_audio.class,main}.js \
    --entry_point "${PROJECT_DIR}/src/main.js" \
       --language_in ECMASCRIPT_2017 \
            --module_resolution BROWSER \
            --js_module_root src --jscomp_off internetExplorerChecks \
    --js_output_file "${PROJECT_DIR}/tmp/main.js" \
        --language_out ECMASCRIPT_2017 \
    --create_source_map "${PROJECT_DIR}/tmp/main.js.map"


license=$(cat "${PROJECT_DIR}/src/license.txt")
global_css=$(cat "${PROJECT_DIR}/tmp/global.css")
scoped_css=$(cat "${PROJECT_DIR}/tmp/scoped.css")
template_html=$(cat "${PROJECT_DIR}/tmp/template.html")
main_js=$(cat "${PROJECT_DIR}/tmp/main.js")

component_html="<!--

${license}

-->
<style>${global_css}</style>
<template>
<style>${scoped_css}</style>
${template_html}
</template>
<script>(function(){'use strict';${main_js}})();</script>"

echo "${component_html}" > "${PROJECT_DIR}/dist/cpu-audio.html"

component_js="/*

${license}

*/

function _insert(){
    let style = document.createElement('style');
    style.innerHTML=\`${global_css}\`;
    document.head.appendChild(style);
    let template = document.createElement('template');
    template.innerHTML=\`<style>${scoped_css}</style>${template_html}\`;
    document.head.appendChild(template);
}
if (document.head !== null) {
    _insert();
} else {
    document.addEventListener('DOMContentLoaded', _insert, false);
}

(function(){'use strict';${main_js}})();
"

echo "${component_js}" > "${PROJECT_DIR}/dist/cpu-audio.js"


if [ '' != "${DESTINATION}" ] ; then
    scp ${PROJECT_DIR}/dist/cpu-audio.html ${DESTINATION}/cpu-audio.html
    scp ${PROJECT_DIR}/dist/cpu-audio.js ${DESTINATION}/cpu-audio.js
fi
