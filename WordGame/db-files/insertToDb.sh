#!/bin/sh

TABLENAME='words';
COUNTER=0;
while read STATEMENT
do
  echo -e "INSERT INTO $TABLENAME (ID, WORD) VALUES ($COUNTER, '$STATEMENT');"
  COUNTER=$((COUNTER+1))
done <words.txt