#!/bin/sh

TABLENAME='words';
COUNTER=0;
while IFS=$'\n\r' read -r STATEMENT
do
  if [[ $STATEMENT != *"'"* ]]; then
    echo -e "INSERT INTO $TABLENAME (ID, WORD) VALUES ($COUNTER, '$STATEMENT');"
    COUNTER=$((COUNTER+1))
  fi

done <wordlist.txt