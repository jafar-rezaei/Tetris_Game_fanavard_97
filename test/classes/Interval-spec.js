import Interval from "../../src/javascript/classes/Interval";

describe("Interval class", () => {
	var interval = new Interval();
	var time = 1000;
	var executedCount = 0;
	var fooFunc = () => {
		return;
	};

	beforeAll(() => {
		expect(interval.request).toBeDefined();
		expect(interval.reset).toBeDefined();
		expect(interval.update).toBeDefined();
		expect(interval.make).toBeDefined();
		expect(interval._removeIndex).toBeDefined();
		expect(interval.clear).toBeDefined();
		expect(interval.clearAll).toBeDefined();
	});

	beforeEach(function(done) {
		interval.make(() => {
			executedCount++;
			done();
		}, time);
	});

	it("method make: should return id of created interval", () => {
		expect(interval.make(fooFunc, time)).toEqual(jasmine.any(Number));
	});

	it("should interval.intervals not be empty after inteval.make", () => {
		expect(Object.keys(interval.intervals).length).toBeGreaterThan(0);
	});

	it("method clearAll: should remove all intervals", () => {
		interval.clearAll();
		expect(Object.keys(interval.intervals).length).toBe(0);
	});

	it("method make: should execute function", () => {
		expect(executedCount).toBeGreaterThan(0);
	});
});
