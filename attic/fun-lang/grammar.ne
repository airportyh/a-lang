@{%
const first = arr => arr[0];
%}

main -> statements

_ -> [ ]:*

__ -> [ ]:+

statements
    -> statement "\n" statements
    |  statement

statement
    -> create_statement
    |  for_loop
    |  where_statement

create_statement
    -> "create" __ word __ "as a" __ constructor_call
        {% d => ({
            type: 'create_statement',
            variable: d[2],
            constructor: d[6]
        }) %}

word
    -> [a-z]:+ {% d => d[0].join("") %}

argument_list
    -> argument _ "," _ argument_list
        {% d => [d[0], ...d[4]] %}
    |  argument {% d => [d[0]] %}

argument
    -> word {% first %}

constructor_call
    -> type_name
        {% d => ({
            type: 'constructor_call',
            typeName: d[0]
        }) %}
    |  type_name ":" _ argument_list
        {% d => ({
            type: 'constructor_call',
            typeName: d[0],
            arguments: d[3]
        }) %}

type_name
    -> "dictionary"
    |  "list"