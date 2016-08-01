
describe("Tokenizer", () => {
    it("should tokenize", () => {
        expect(tokenize("123\n")).toEqual(["123"]);
        expect(tokenize("A > 10")).toEqual(["A", ">", "10"]);
        expect(tokenize("A_10_l()>10 AND (A<100 OR A!=1000  )")).toEqual(["A_10_l", "(", ")", ">", "10", "AND", "(", "A", "<", "100", "OR", "A", "!=", "1000", ")"]);
        expect(tokenize("   A   != 24 AND\n\n  pi")).toEqual(["A", "!=", "24", "AND", "pi"]);
        expect(tokenize("()")).toEqual(["(", ")"]);
        expect(tokenize("    ")).toEqual([]);
        expect(tokenize(`"Market Value"`)).toEqual([`Market Value`]);
        expect(tokenize(`"   Market    Value "`)).toEqual([`Market Value`]);
        expect(tokenize(`"Market Value"[SLG]`)).toEqual([`Market Value`, "[", "SLG", "]"]);
        expect(tokenize(`A in ("C", "E", "F")`)).toEqual([`A`, "in", "(", "C", ",", "E", ",", "F", ")"]);

    });
});

describe("Token", () => {
    let metadata = {};
    it("should recoginize token correctly", () => {
        expect(isNumber("123")).toBeTruthy();
        expect(isNumber("-9213")).toBeTruthy();
        expect(!isNumber("-i1")).toBeTruthy();
        expect(!isNumber("123a")).toBeTruthy();
        expect(isName("abc_a")).toBeTruthy();
        expect(isName("abc a")).toBeTruthy();
        expect(!isName("-123w")).toBeTruthy();
        expect(!isName("123")).toBeTruthy();
        expect(isOperator(">")).toBeTruthy();
        expect(isOperator("!=")).toBeTruthy();
        expect(!isOperator("!=2")).toBeTruthy();
        expect(!isOperator("abc2")).toBeTruthy();
        expect(!isOperator("123")).toBeTruthy();
    });
})

describe("parser", () => {

    it("should parse simple filter", () => {
        let expr = `A > 10`;
        expect(parse(expr)).toEqual(new Filter("A", ">", ["10"]));

        expr = `A > 10 AND A < 100`;
        expect(parse(expr)).toEqual({
            type: "AND",
            left: new Filter("A", ">", ["10"]),
            right: new Filter("A", "<", ["100"])
        });

        expr = `A > 101 AND (A < 100 OR B != 0)`;
        let tree = parse(expr);
        expect(print(tree)).toEqual(expr);
    });

    it("should parse BETWEEN operator", () => {
        let expr = `A between 10 and 100`;
        expect(parse(expr)).toEqual(new Filter("A", "between", ["10", "100"]));
    });

    it("should parse between with AND condition", () => {
        let expr = `A between 10 and 100 AND B between 20 and 200`;
        expect(parse(expr)).toEqual({ type: "AND", left: new Filter("A", "between", ["10", "100"]), right: new Filter("B", "between", ["20", "200"]) });
    });

    it("should parse NOT BETWEEN operator", () => {
        let expr = `A not between 10 and 100 AND B not between 20 and 200`;
        expect(parse(expr)).toEqual({ type: "AND", left: new Filter("A", "not between", ["10", "100"]), right: new Filter("B", "not between", ["20", "200"]) });
    });

    it("should parse IN operator", () => {
        let expr = `A in ("C", "E", "F")`;
        expect(parse(expr)).toEqual(new Filter("A", "in", ["C", "E", "F"]));
    });

    it("should parse STARTS WITH operator", () => {
        let expr = `A STARTS WITH "C"`;
        expect(parse(expr)).toEqual(new Filter("A", "STARTS WITH", ["C"]));
    });

    it("should parse BLANK operator", () => {
        let expr = `A blank`;
        expect(parse(expr)).toEqual(new Filter("A", "blank", []));
    });

    it("should parse NOT BLANK operator", () => {
        let expr = `A not blank`;
        expect(parse(expr)).toEqual(new Filter("A", "not blank", []));
    });

    it("should parse filter with Match", () => {
        let expr = `A[SLG] > 10`;
        expect(parse(expr, true)).toEqual(new Filter("A", ">", ["10"], "SLG"));

        expr = `"Market Value"[ANY] between 10 and 100`;
        expect(parse(expr, true)).toEqual(new Filter("Market Value", "between", ["10", "100"], "ANY"));
    });

    it("should parse complex filters", () => {
        let expr = `A [ANY] > 101 OR (A[ALL] < 100 OR B[HH] Between 0 and 6 AND (C[ANY] BLANK OR D[ALL] in (A, B, C)))`;
        expect(parse(expr, true)).toEqual({
            type: 'OR', left: new Filter('A', '>', ['101'], 'ANY'), right: {
                type: 'OR', left: new Filter('A', '<', ['100'], 'ALL'), right: {
                    type: 'AND', left: new Filter('B', 'Between', ['0', '6'], 'HH'), right: { type: 'OR', left: new Filter('C', 'BLANK', [], 'ANY'), right: new Filter('D', 'in', ['A', 'B', 'C'], 'ALL') }
                }
            }
        })
    });

});