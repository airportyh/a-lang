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
const plus = { test: token => token.type === 'operator' && token.op === '+' }
const times = { test: token => token.type === 'operator' && token.op === '*' }
const exp = { test: token => token.type === 'operator' && token.op === '^' }
const number = { test: token => token.type === 'number' }
const leftparan = { test: token => token.type === 'leftparan' }
const rightparan = { test: token => token.type === 'rightparan' }
%}

main -> sum
    {% d => first(d) %}

sum
    -> product %plus sum {% d => ({ type: 'sum', op: '+', lhs: d[0], rhs: d[4] }) %}
    |  product {% first %}

product
    -> exponent %times product {% d => ({ type: 'product', op: '*', lhs: d[0], rhs: d[4] }) %}
    |  exponent {% first %}

exponent
    -> exponent %exp single
        {% d => ({ type: 'exponent', op: '^', lhs: d[0], rhs: d[4] }) %}
    |  single {% first %}

single
    -> %number {% first %}
    |  %leftparan sum %rightparan {% third %}
