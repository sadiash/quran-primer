import { describe, it, expect, beforeEach } from "vitest";
import { Container } from "./di";

describe("Container", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it("registers and resolves a dependency", () => {
    container.register("greeting", () => "hello");
    expect(container.resolve<string>("greeting")).toBe("hello");
  });

  it("returns the same singleton instance", () => {
    let count = 0;
    container.register("counter", () => ++count);

    expect(container.resolve<number>("counter")).toBe(1);
    expect(container.resolve<number>("counter")).toBe(1); // same instance
  });

  it("throws on unregistered token", () => {
    expect(() => container.resolve("nope")).toThrow('No registration found for "nope"');
  });

  it("has() checks registration", () => {
    container.register("a", () => 1);
    expect(container.has("a")).toBe(true);
    expect(container.has("b")).toBe(false);
  });

  it("clear() removes all registrations", () => {
    container.register("a", () => 1);
    container.clear();
    expect(container.has("a")).toBe(false);
  });

  it("re-registering clears cached singleton", () => {
    container.register("val", () => "first");
    expect(container.resolve<string>("val")).toBe("first");

    container.register("val", () => "second");
    expect(container.resolve<string>("val")).toBe("second");
  });
});
