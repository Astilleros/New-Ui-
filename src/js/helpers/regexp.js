
export const isDisabled = /^ *;/;
export const isCategory = /^ *;?\[.*\]/;
export const isValue = /^ *;?[^\.\n]*=.*/;
export const cleanName = /[ ;\[\]]/g;
export const isDigit = /^[a-zA-Z0-9]*\.[a-zA-Z0-9]*( [0-9\-]*){4}/
export const isReference = /^[^ ]*( [0-9\-]*){2}/
export const isNumberValue = /^ *;?[^\n=\.]*\.[^\n=\.]*=.*/;
     