{
  const _ = require('lodash');

  function join(matches) {
    return _.flatten(matches).join('');
  }
}

start
  = statements

ws = [ \t]*
wsl = [ \t\n]*

statements
  = ws first:statement "\n"+ rest:statements { return [first, ...rest] }
  / ws s:statement { return [s] }

statement
  = var_declaration
  / function_definition_short
  / function_definition_long
  / function_call

function_body_statements
  = ws first:function_body_statement "\n"+ rest:function_body_statements { return [first, ...rest] }
  / ws s:function_body_statement { return [s] }

function_body_statement
  = var_declaration
  / function_definition_short
  / function_definition_long
  / function_call
  / return_statement
  
identifier
  = id:([a-z][a-zA-Z0-9]*) { return { type: 'identifier', name: join(id) } }

var_declaration
  = lhs:identifier ws "=" ws rhs:expr { return { type: 'assignment', lhs, rhs } }

function_call
  = fn:identifier "(" ws args:argument_list ws ")"
    { return { type: 'function_call', fn, args }}

parameter_list
  = first:identifier ws "," ws rest:parameter_list { return [first, ...rest] }
  / param:identifier { return [param] }
  / "" { return [] }

function_definition_short
  = fn:identifier "(" ws params:parameter_list ws ")" ws "=" ws body:expr
    { return { type: 'function_definition', fn, params, body: [ { type: 'return_statement', value: body } ] } }

function_definition_long
  = fn:identifier "(" ws params:parameter_list ws ")" ws 
    "{" "\n" body:function_body_statements "\n" "}"
    { return { type: 'function_definition', fn, params, body } }

return_statement
  = "return" ws value:expr { return { type: 'return_statement', value } }

argument_list
  = first:expr ws "," ws rest:argument_list { return [ first, ...rest ] }
  / expr:expr { return [expr] }
  / "" { return [] }

expr = term
  
term_op = [+-]

term
  = lhs:factor ws op:term_op ws rhs:term { return { type: 'bin_op', lhs, op, rhs } }
  / factor

factor_op = [*/]

factor
  = lhs:power ws op:factor_op ws rhs:factor { return { type: 'bin_op', lhs, op, rhs} }
  / power

power
  = lhs:primary ws "^" ws rhs:power { return { type: 'bin_op', lhs, op: '^', rhs } }
  / primary

primary
  = number
  / function_call
  / identifier
  / "(" ws expr ws ")" { return expr }

number
  = digits:("-"?[0-9]+) { return { type: 'number', value: Number(join(digits)) } }