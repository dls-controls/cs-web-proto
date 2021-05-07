#!/bin/bash

# Generated run script for cs-studio.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOP=${SCRIPT_DIR}/../../..

# The location of css.sh
CSS_RUN_SCRIPT=$(configure-ioc s -p CSS-gui)


# pop the opifile off the head of the argument list
opifile="$1"
shift

function usage() {
    printf "\\nUsage: $0 opi-file -m macro1=value1,macro2=value2\\n\\n"
    printf "       opi-file path should be relative to $(basename "$0")\\n\\n"
    printf "       Additional arguments are passed to css.sh.\\n"
    printf "       See $CSS_RUN_SCRIPT -h for more.\\n\\n"
}

# Check for valid arguments.
if [[ -z $opifile || $opifile == "-h" || $opifile == "--help" ]]; then
    usage
    exit 1
fi
# Check that requested opi file exists.
if [[ ! -f $SCRIPT_DIR/$opifile ]]; then
    echo "OPI file $SCRIPT_DIR/$opifile does not exist"
    usage
    exit 1
fi

if [ -e "${TOP}/configure/VERSION" ] ; then
    version="$(cat "${TOP}"/configure/VERSION)"
else
    version="dev"
fi
project=pmacUtil_${version}
module=pmacUtil
launch_opi=/${project}/${module}/$opifile

links="${SCRIPT_DIR}=${project}/${module},\
/dls_sw/prod/R3.14.12.7/support/asyn/4-34/asynApp/opi/opi=/${project}/asyn,\
/dls_sw/prod/R3.14.12.7/support/streamDevice/2-5dls11/streamDeviceApp/opi/opi=/${project}/streamDevice,\
/dls_sw/prod/R3.14.12.7/support/busy/1-7dls1/busyApp/opi/opi=/${project}/busy,\
/dls_sw/prod/R3.14.12.7/support/motor/6-10-1dls1-1/motorApp/opi/opi=/${project}/motor,\
/dls_sw/prod/R3.14.12.7/support/seq/2-2-5/seqApp/opi/opi=/${project}/seq,\
/dls_sw/prod/R3.14.12.7/support/calc/3-7/calcApp/opi/opi=/${project}/calc,\
/dls_sw/prod/R3.14.12.7/support/genSub/1-8dls3/genSubApp/opi/opi=/${project}/genSub"

$CSS_RUN_SCRIPT -o "${launch_opi}" -s -l "$links" "$@"
