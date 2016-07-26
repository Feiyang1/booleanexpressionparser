
describe("Tokenizer", () => {
    it("should tokenize", () => {
        expect(tokenize("123\n")).toEqual(["123"]);
        expect(tokenize("A > 10")).toEqual(["A", ">", "10"]);
        expect(tokenize("A_10_l()>10 AND (A<100 OR A!=1000  )")).toEqual(["A_10_l", "(", ")", ">", "10", "AND", "(", "A", "<", "100", "OR", "A", "!=", "1000", ")"]);
        expect(tokenize("   A   != 24 AND\n\n  pi")).toEqual(["A", "!=", "24", "AND", "pi"]);
        expect(tokenize("()")).toEqual(["(", ")"]);
        expect(tokenize("    ")).toEqual([]);
        expect(tokenize(`"Market Value"`)).toEqual(["Market Value"]);
        expect(tokenize(`"Market Value"[SLG]`)).toEqual(["Market Value", "[", "SLG", "]"])
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

        expr = `A [match ] > 101 AND (A < 100 OR B != 0)`;
    });

    it("should parse BETWEEN operator", () => {
        let expr = `A between 10 and 100`;
        expect(parse(expr)).toEqual(new Filter("A", "between", ["10", "100"]));
    });

    it("should parse between with AND condition", () => {
        let expr = `A between 10 and 100 AND B between 20 and 200`;
        expect(parse(expr).toEqual({ type: "AND", left: new Filter("A", "between", ["10", "100"]), right: Filter("B", "between", ["20", "200"]) }));
    });

    it("should parse IN operator", () => {
        let expr = `A in ("C", "E", "F")`;
        expect(parse(expr)).toEqual(new Filter("A", "in", ["C", "E", "F"]));
    });

    it("should parse NOT BETWEEN operator", () => {

    });

    it("should parse START WITH operator", () => {

    });

    it("should parse BLANK operator", () => {

    });

    it("should parse NOT BLANK operator", () => {

    });

});