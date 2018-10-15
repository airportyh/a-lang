@{%
const _ = require('lodash');
const util = require('util');

function join(things) {
    return _.flatten(things).join("");
}
function first(things) {
    return things[0];
}
function second(things) {
    return things[1];
}
function third(things) {
    return things[2];
}
function fifth(things) {
    return things[4];
}
const flatten = _.flatten;
function flattenFirst(thing) {
    return first(flatten(thing))
}

function keyword(word) {
    return { test: token => token.type === 'word' && token.word === word };
}
function tokenType(type) {
    return { test: token => token.type === type }
}
function operator(op) {
    return { test: token => token.type === 'operator' && token.op === op }
}

const plus = operator('+')
const minus = operator('-')
const times = operator('*')
const divide = operator('/')
const exp = operator('^')
const comma = operator(',')
const gt = operator('>')
const lt = operator('<')
const gte = operator('>=')
const lte = operator('<=')
const eql = operator('==')
const leftbracket = operator('[')
const rightbracket = operator(']')
const assignment = operator('=')
const number = tokenType('number')
const leftparan = tokenType('leftparan')
const rightparan = tokenType('rightparan')
const if_ = keyword('if')
const return_ = keyword('return')
const else_ = keyword('else')
const while_ = keyword('while')
const blockbegin = tokenType('blockbegin')
const blockend = tokenType('blockend')
const newline = tokenType('newline')
const identifier = tokenType('word')
const string = tokenType('string_literal')
%}

main -> statements {% d => d %}

statements
    -> line_statement %newline:+ statements
        {% d => [d[0], ...d[2]] %}
    |  block_statement statements
        {% d => [d[0], ...d[1]] %}
    |  line_statement  {% d => [d[0]] %}
    |  block_statement {% d => [d[0]] %}
    |  null            {% () => [] %}

block_statement
    -> if_statement {% id %}
    | function_definition {% id %}
    | while_loop    {% id %}

line_statement
    -> function_definition_short {% id %}
    |  function_call             {% id %}
    |  assignment                {% id %}
    |  expression                {% id %}

function_body_statements
    -> function_body_statement %newline function_body_statements
        {% d => [d[0], ...d[2]] %}
    |  function_body_statement {% d => [d[0]] %}
    |  null {% () => [] %}

function_body_statement
    -> if_statement        {% id %}
    |  function_definition {% id %}
    |  function_definition_short {% id %}
    |  function_call       {% id %}
    |  assignment          {% id %}
    |  return_statement    {% id %}
    |  expression          {% id %}

assignment
    -> identifier %assignment expression
        {% d => ({ type: 'assignment', lhs: d[0], rhs: d[2] }) %}

argument_list
    -> expression %comma argument_list
        {% d => [d[0], ...d[2]] %}
    |  expression {% d => [d[0]] %}
    |  null {% d => [] %}

function_call
    -> identifier %leftparan argument_list %rightparan
        {% d => ({ type: 'function_call', fn: d[0].name, arguments: d[2] }) %}

array_literal
    -> %leftbracket argument_list %rightbracket
        {% d => ({ type: 'array_literal', items: d[1] }) %}

parameter_list
    -> identifier %comma parameter_list
        {% d => [d[0], ...d[2]] %}
    |  identifier {% d => [d[0]] %}
    |  null {% d => [] %}

function_definition
    -> identifier %leftparan parameter_list %rightparan %blockbegin %newline
            function_body_statements
        %newline:? %blockend
        {% d => ({
            type: 'function_definition', 
            name: d[0].name, 
            parameters: d[2],
            body: d[6]
        }) %}

function_definition_short
    -> identifier %leftparan parameter_list %rightparan %assignment expression
        {% d => ({
            type: 'function_definition',
            name: d[0].name,
            parameters: d[2],
            body: [{
                type: 'return_statement',
                value: d[5]
            }]
        }) %}

return_statement
    -> %return_ expression {% d => ({ type: 'return_statement', value: d[1] }) %}

if_statement
    -> %if_ expression %blockbegin %newline
            statements 
        %newline:? %blockend
        else_if_clauses:?
        else_clause:?
        {% d => {
            const firstClause = {
                type: 'if_clause',
                cond: d[1],
                consequent: d[4]
            };
            const restClauses = d[7] || [];
            return ({
                type: 'if_statement',
                clauses: [firstClause, ...restClauses],
                alternate: d[8] || []
            })
         } %}

else_if_clauses
    -> else_if_clause else_if_clauses {% d => [d[0], ...d[1]] %}
    |  else_if_clause {% d => [d[0]] %}

else_if_clause
    -> %else_ %if_ expression %blockbegin %newline
        statements
        %newline:? %blockend
        {% d => ({
            type: "if_clause",
            cond: d[2],
            consequent: d[5]
        }) %}

else_clause
    -> %else_ %blockbegin %newline
            statements
        %newline:? %blockend
        {% d => d[3] %}

while_loop
    -> %while_ expression %blockbegin %newline
            statements
        %newline:? %blockend
        {% d => ({
            type: 'while_loop',
            cond: d[1],
            body: d[4]
        }) %}

expression -> comparison {% id %}

comparison_op
    -> %gt  {% id %}
    |  %lt  {% id %}
    |  %gte {% id %}
    |  %lte {% id %}
    |  %eql {% id %}

comparison
    -> term comparison_op comparison
        {% d => ({
            type: 'bin_op',
            lhs: d[0],
            op: d[1].op,
            rhs: d[2]
        }) %}
    |  term {% id %}

term
    -> factor (%plus|%minus) term
        {% d => ({ type: 'bin_op', op: d[1][0].op, lhs: d[0], rhs: d[2] }) %}
    |  factor {% id %}

factor
    -> exponent (%times|%divide) factor
        {% d => ({ type: 'bin_op', op: d[1][0].op, lhs: d[0], rhs: d[2] }) %}
    |  exponent {% id %}

exponent
    -> single %exp exponent
        {% d => ({ type: 'bin_op', op: d[1].op, lhs: d[0], rhs: d[2] }) %}
    |  single {% id %}

negative
    -> %minus expression {% d => ({ type: 'negative', value: d[1] }) %}

single
    -> %number {% id %}
    |  negative {% id %}
    |  identifier {% id %}
    |  function_call {% id %}
    |  %string {% id %}
    |  array_literal {% id %}
    |  %leftparan expression %rightparan {% second %}
    |  index_access {% id %}

index_access
    -> expression %leftbracket expression %rightbracket
    {% d => ({
        type: "index_access",
        subject: d[0],
        index: d[2]
    }) %}

identifier -> %identifier {% d => ({ type: 'identifier', name: d[0].word }) %}
