#! /bin/bash

#####################################################################
# Per https://sharats.me/posts/shell-script-best-practices/ (partial)
set -o errexit
set -o nounset
set -o pipefail

if [[ "${TRACE-0}" == "1" ]]; then
    set -o xtrace
fi
#####################################################################

git status | grep modified:

if [ $? = 0 ]
then
  exit 1
fi
