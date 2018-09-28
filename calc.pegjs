start
  = statements

ws = [ ]*

statements
  = first:statement "\n" rest:statements { return [first, ...rest] }
  / s:statement { return [s] }

statement
  = var_declaration
  / function_call

identifier
  = id:[a-z]+ ([a-zA-Z0-9]+)? { return { type: 'identifier', name: id.join("") } }

var_declaration
  = lhs:identifier ws "=" ws rhs:expr { return { type: 'assignment', lhs, rhs } }

function_call
  = fn:identifier "(" ws args:argument_list ws ")" { return { type: 'function_call', fn, args }}

argument_list
  = first:expr ws "," ws rest:argument_list { return [ first, ...rest ] }
  / expr:expr { return [expr]}

expr
  = term

term_op = [+-]

term
  = lhs:factor ws op:term_op ws rhs:term { return { type: 'bin_op', lhs, op, rhs } }
  / factor

factor_op = [*/]

factor
  = lhs:primary ws op:factor_op ws rhs:factor { return { type: 'bin_op', lhs, op, rhs} }
  / primary

primary
  = number
  / identifier
  / "(" ws term ws ")" { return expr }

number
  = digits:[0-9]+ { return { type: 'number', value: Number(digits.join("")) } }