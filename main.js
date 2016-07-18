// let expression = `"market value" > 10 AND "market value" < 100 OR "market value" != 1000 OR "market value" ! 10 `;
// let metadata = [{
//     displayName : "market value",
//     key: "mkt_val",
//     operators : [">", "<", "!="]
// }];

let simpleExpression = `A > 10 AND A < 100 OR A != 1000 OR A ! 10`;

var assert = require('assert');

function tokenize(code) {
    let results = [];
    //non space and none alphanumeric character(operators) - [^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeffA-Za-z0-9_]
    let tokenRegExp = /\s*([\(]|[\)]|\w+|[^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeffA-Za-z0-9_]+)\s*/g;
    let m;

    while ((m = tokenRegExp.exec(code)) !== null) {
        results.push(m[1]);
    }

    return results;
}

assert.deepEqual(tokenize("123\n"), ["123"]);
assert.deepEqual(tokenize("A > 10"), ["A", ">", "10"]);
assert.deepEqual(tokenize("A_10_l()>10 AND (A<100 OR A!=1000  )"), ["A_10_l", "(", ")", ">", "10", "AND", "(", "A", "<", "100", "OR", "A", "!=", "1000", ")"]);
assert.deepEqual(tokenize("   A   != 24 AND\n\n  pi"), ["A", "!=", "24", "AND", "pi"]);
assert.deepEqual(tokenize("()"), ["(", ")"]);
assert.deepEqual(tokenize("    "), []);