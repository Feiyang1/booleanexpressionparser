// let expression = `"market value" > 10 AND "market value" < 100 OR "market value" != 1000 OR "market value" ! 10 `;
// let metadata = [{
//     displayName : "market value",
//     key: "mkt_val",
//     operators : [">", "<", "!="]
// }];


function print(node) {
    let str = "";
    if (node instanceof Filter) {
        str += printFilter(node);
    }
    else {
        if (node.type === "OR")
            str += "(";
        str += print(node.left); 
        str += (" " + node.type + " ");
        str += print(node.right);
        if (node.type === "OR")
            str += ")";
    }
    return str;
}

function printFilter(filter) {
    return filter.name + " " + filter.operator + " " + filter.values[0];
}

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

// to be based on metadata
function isNumber(token) {
    return token != null && token.match(/^-?[0-9]+$/) != null;
}

// to be based on metadata
function isName(token) {
    return token != null && token.match(/^[A-Za-z]\w*$/) != null;
}

// to be based on metadata
function isOperator(token) {
    return token != null && token.match(/^[^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeffA-Za-z0-9_]+$/) != null;
}

function Filter(name, operator, values, match) {
    this.name = name;
    this.match = match;
    this.operator = operator;
    this.values = values;
}

function parse(code) {
    let tokens = tokenize(code);
    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume(token) {
        position++;
    }

    function parsePrimaryExpr() {

    }

    function parseFilterExpr() {
        let t = peek();
        let filter, filterName, operator, value;
        if (isName(t)) {
            consume(t)
            filterName = t;
            t = peek();
            if (isOperator(t)) {
                consume(t)
                operator = t;
                t = peek();
                if (isNumber(t)) {
                    consume(t);
                    value = t;
                }
                else {
                    throw new SyntaxError("expected Number");
                }
            }
            else {
                throw new SyntaxError("expected Operator");
            }
            filter = new Filter(filterName, operator, [value]); // a leaf node
        }
        else if (t === "(") {
            consume(t);
            filter = parseExpr();

            t = peek();
            if (t !== ")") {
                throw new SyntaxError("expected )");
            }
            consume(t);
        }

        return filter;
    }

    function parseExpr() {
        let expr = parseFilterExpr();
        let t = peek();

        while (t === "AND" || t === "OR") {
            consume(t);
            let rhs = parseFilterExpr();
            expr = { type: t, left: expr, right: rhs };
            t = peek();
        }

        return expr;
    }

    let result = parseExpr();

    if (position !== tokens.length) {
        throw new SyntaxError("unexpected '" + peek() + "'");
    }

    return result;
}