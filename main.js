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
    let tokenRegExp = /\s*(".*"|[\(]|[\)]|\w+|[^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeffA-Za-z0-9_]+)\s*/g;
    let m, token;

    while ((m = tokenRegExp.exec(code)) !== null) {
        token = m[1];
        if (isQuoted(token)) {
            token = token.replace(/"\s*|\s*"/g, ""); // remove quotes
            token = token.replace(/\s+/g, " "); // remove whitespaces
        }
        results.push(token);
    }
    return results;
}

// return applicable operators given a filtername
function getApplicableOperators(filterName) {
    return [">", "=", "<", "!=", "BETWEEN", "NOT BETWEEN", "STARTS WITH"];
}

function isQuoted(token) {
    return token != null && token.match(/".*"/) != null;
}

// to be based on metadata
function isNumber(token) {
    return token != null && token.match(/^-?[0-9]+$/) != null;
}

// to be based on metadata
function isName(token) {
    return token != null && token.match(/^[A-Za-z]\w*\s*\w*$/) != null;
}

// to be based on metadata
function isOperator(token) {
    return token != null
        && (token.match(/^[^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeffA-Za-z0-9_]+$/) != null
            || token.toUpperCase() === "BETWEEN");
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

    /**
     * parse operators and values
     * @param 
     * applicableOperators: [">", "=", "BETWEEN", "NOT BETWEEN", "STARTS WITH" ....]
     */
    function parseOperator(applicableOperators) {
        let operator, input;
        let localApplicableOperators = applicableOperators, localOperator;
        let t = peek(), match = false;
        input = t;
        while (!match && localApplicableOperators.length > 0) {
            consume(t);
            let nextApplicableOperators = [];
            for (let i = 0, n = localApplicableOperators.length; i < n; i++) {
                localOperator = localApplicableOperators[i];
                if (localOperator.toUpperCase() === input.toUpperCase())//find match
                {
                    match = true;
                    operator = input;
                    break;
                }

                if (localOperator.toUpperCase().startsWith(input.toUpperCase())) {
                    nextApplicableOperators.push(localOperator);
                }
            }

            localApplicableOperators = nextApplicableOperators;
            t = peek();
            input = input + " " + t; // multi-words operators
        }

        return operator;
    }

    function parseValues(operator) {
        let values = [];
        let t = peek();
        switch (operator.toUpperCase()) {
            case "BETWEEN":
            case "NOT BETWEEN":
                if (isNumber(t)) {
                    values.push(t);
                    consume(t);

                    t = peek();
                    //AND
                    if (t.toUpperCase() === "AND") {
                        consume(t);
                        t = peek();

                        if (isNumber(t)) {
                            values.push(t);
                            consume(t);
                        }
                        else{
                            throw new SyntaxError("expected Number");
                        }
                    }
                    else {
                        throw new SyntaxError("expected AND after BETWEEN/NOT BETWEEN");
                    }

                }
                else {
                    throw new SyntaxError("expected Number");
                }
                break;
            case "IN":
                break
            default:
                values.push(t);
                consume(t);
        }

        return values;
    }

    function parseFilterExpr() {
        let t = peek();
        let filter, filterName, operator, values = [];
        if (isName(t)) {
            consume(t)
            filterName = t;
            let applicableOperators = getApplicableOperators(filterName);
            operator = parseOperator(applicableOperators);

            if (operator) {
                values = parseValues(operator);
            }
            else {
                throw new SyntaxError("unexpected Operator");
            }

            filter = new Filter(filterName, operator, values); // a leaf node
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