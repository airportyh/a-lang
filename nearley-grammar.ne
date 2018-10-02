@{%
const _ = require('lodash');

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
const assignment = operator('=')
const number = tokenType('number')
const leftparan = tokenType('leftparan')
const rightparan = tokenType('rightparan')
const if_ = keyword('if')
const return_ = keyword('return')
const blockbegin = tokenType('blockbegin')
const blockend = tokenType('blockend')
const newline = tokenType('newline')
const identifier = tokenType('word')
%}

main -> statements {% d => d %}

statements
    -> statement %newline:+ statements
        {% d => [d[0], ...d[2]] %}
    |  statement {% d => [d[0]] %}
    |  null {% () => [] %}

statement
    -> if_statement        {% first %}
    |  function_definition {% first %}
    |  function_definition_short {% first %}
    |  function_call       {% first %}
    |  assignment          {% first %}
    |  expression          {% first %}

function_body_statements
    -> function_body_statement %newline function_body_statements
        {% d => [d[0], ...d[2]] %}
    |  function_body_statement {% d => [d[0]] %}
    |  null {% () => [] %}

function_body_statement
    -> if_statement        {% first %}
    |  function_definition {% first %}
    |  function_definition_short {% first %}
    |  function_call       {% first %}
    |  assignment          {% first %}
    |  return_statement    {% first %}
    |  expression          {% first %}

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

identifier -> %identifier {% d => ({ type: 'identifier', name: d[0].word }) %}

if_statement
    -> %if_ expression %blockbegin %newline
            statements 
        %newline:? %blockend
        {% d => ({ type: 'if_statement', cond: d[1], consequent: d[4] }) %}

expression -> term {% first %}

term
    -> factor (%plus|%minus) term
        {% d => ({ type: 'bin_op', op: d[1][0].op, lhs: d[0], rhs: d[2] }) %}
    |  factor {% first %}

factor
    -> exponent (%times|%divide) factor
        {% d => ({ type: 'bin_op', op: d[1][0].op, lhs: d[0], rhs: d[2] }) %}
    |  exponent {% first %}

exponent
    -> exponent %exp single
        {% d => ({ type: 'bin_op', op: d[1][0].op, lhs: d[0], rhs: d[4] }) %}
    |  single {% first %}

single
    -> %number {% first %}
    |  identifier {% first %}
    |  function_call {% first %}
    |  %leftparan expression %rightparan {% second %}
