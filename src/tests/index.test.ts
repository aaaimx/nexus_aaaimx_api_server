import app from "../index";

describe("Express App", () => {
  it("should be defined", () => {
    expect(app).toBeDefined();
  });

  it("should have express app methods", () => {
    expect(typeof app.get).toBe("function");
    expect(typeof app.listen).toBe("function");
  });
});
