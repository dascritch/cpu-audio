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

# Build player lib

java -jar /usr/share/java/closure-compiler.jar \
    --compilation_level ${JS_COMPILATION_LEVEL} \
        --use_types_for_optimization=true \
        --summary_detail_level=3 \
    --js "${PROJECT_DIR}/src/main.js" \
    --entry_point "${PROJECT_DIR}/src/main.js" \
       --language_in ECMASCRIPT_2017 \
            --module_resolution BROWSER \
            --js_module_root src --jscomp_off internetExplorerChecks \
    --js_output_file "${PROJECT_DIR}/tmp/main.js" \
        --language_out ECMASCRIPT_2017 \
    --create_source_map "${PROJECT_DIR}/tmp/main.js.map"



component_html="${PROJECT_DIR}/dist/cpu-audio.html"

echo "<style>" > "${component_html}"
cat "${PROJECT_DIR}/tmp/global.css" >> "${component_html}"
echo "</style>" >> "${component_html}"
echo "<template><style>" >> "${component_html}"
cat "${PROJECT_DIR}/tmp/scoped.css" >> "${component_html}"
echo "</style>" >> "${component_html}"
cat "${PROJECT_DIR}/tmp/template.html" >> "${component_html}" 
echo "</template>" >> "${component_html}"
echo "<script>" >> "${component_html}"
cat "${PROJECT_DIR}/tmp/main.js" >> "${component_html}" 
echo "</script>" >> "${component_html}"

if [ '' != "${DESTINATION}" ] ; then
    scp ${PROJECT_DIR}/dist/cpu-audio.html ${DESTINATION}/cpu-audio.html
    scp ${PROJECT_DIR}/dist/cpu-audio.js ${DESTINATION}/cpu-audio.js
fi
