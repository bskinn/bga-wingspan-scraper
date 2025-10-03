#! /bin/bash

#####################################################################
# Per https://sharats.me/posts/shell-script-best-practices/ (partial)
# set -o errexit  # We don't want this because we're trapping errors
set -o nounset
set -o pipefail

if [[ "${TRACE-0}" == "1" ]]; then
    set -o xtrace
fi
#####################################################################

git status | grep modified:

RESULT=$?

if [[ $RESULT -eq 0 ]]
then
  # grep found something modified, reject
  exit 1
elif [[ $RESULT -eq 1 ]]
then
  # grep didn't find anything, we're ok
  exit 0
else
  # Some other error
  exit $RESULT
fi
