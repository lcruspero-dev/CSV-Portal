describe("Hello World Test", () => {
  test("should pass basic math test", () => {
    expect(1 + 1).toBe(2);
  });

  test("should verify string equality", () => {
    expect("hello").toBe("hello");
  });

  test("should verify array includes value", () => {
    expect([1, 2, 3]).toContain(2);
  });
});
