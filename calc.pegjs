start
  = statements

ws = [ ]+

term_op = [+-]

statements
  = first:statement "\n" rest:statements { return [first, ...rest] }
  / s:statement { return [s] }

statement
  = var_declaration

identifier
  = id:[a-z]+ ([a-zA-Z0-9]+)? { return id.join("") }

var_declaration
  = lhs:identifier ws "=" ws rhs:term { return { type: 'assignment', lhs, rhs } }

term
  = lhs:factor ws op:term_op ws rhs:term { return { type: 'bin_op', lhs, op, rhs } }
  / factor

factor_op = [*/]

factor
  = lhs:primary ws op:factor_op ws rhs:factor { return { type: 'bin_op', lhs, op, rhs} }
  / primary

primary
  = number
  / "(" ws term ws ")" { return expr }

number
  = digits:[0-9]+ { return { type: 'number', value: Number(digits.join("")) } }