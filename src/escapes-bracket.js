// These are the characters carrying special meanings when they appear INSIDE a
// character class (delimited by square brackets) within a regular expression.
// To be interpreted literally, they must be escaped with a backslash.
// Notice how much smaller this class is than the one above; note also that the
// hyphen and caret do NOT appear above.
module.exports = {
  '\u0000': '\\u0000',
  '\u0001': '\\u0001',
  '\u0002': '\\u0002',
  '\u0003': '\\u0003',
  '\u0004': '\\u0004',
  '\u0005': '\\u0005',
  '\u0006': '\\u0006',
  '\u0007': '\\u0007',
  '\u0008': '\\u0008',
  '\t': '\\t', // tab
  '\n': '\\n', // line feed
  '\v': '\\v', // vertical tab
  '\f': '\\f', // form feed
  '\r': '\\r', // carriage return
  '\u000E': '\\u000E',
  '\u000F': '\\u000F',
  '\u0010': '\\u0010',
  '\u0011': '\\u0011',
  '\u0012': '\\u0012',
  '\u0013': '\\u0013',
  '\u0014': '\\u0014',
  '\u0015': '\\u0015',
  '\u0016': '\\u0016',
  '\u0017': '\\u0017',
  '\u0018': '\\u0018',
  '\u0019': '\\u0019',
  '\u001A': '\\u001A',
  '\u001B': '\\u001B',
  '\u001C': '\\u001C',
  '\u001D': '\\u001D',
  '\u001E': '\\u001E',
  '\u001F': '\\u001F',
  '\\': '\\\\',
  '[': '\\[',
  ']': '\\]',
  '^': '\\^',
  '-': '\\-',
  '\u007F': '\\u007F'
}
