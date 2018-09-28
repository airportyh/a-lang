start
  = term

whitespace
  = " " *

term_op
  = [+-]

factor_op
  = [*/]

term
  = lhs:factor whitespace op:term_op whitespace rhs:term { return { lhs: lhs, op, rhs: rhs }; }
  / factor

factor
  = lhs:primary whitespace op:factor_op whitespace rhs:factor { return { lhs: lhs, op, rhs: rhs }; }
  / primary

primary
  = integer
  / "(" whitespace term:term whitespace ")" { return term; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }