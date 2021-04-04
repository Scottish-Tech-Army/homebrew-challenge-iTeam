import {  unmountComponentAtNode } from "react-dom";
import {
  commonChartConfiguration,
  calculateDateRange,
  datasetConfiguration,
  getChartYMax,
  getMaxTicks,
} from "./DataChartsModel";
import {
  ALL_DATES,
  LAST_WEEK,
  LAST_TWO_WEEKS,
  LAST_MONTH,
  LAST_THREE_MONTHS,
} from "../DataCharts/DataChartsConsts";

var container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  fetch.resetMocks();
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

const TEST_MAX_DATA_1 = [363, 101, 257, 771, 799, 297, 118];
const TEST_MAX_DATA_2 = [4056, 256, 235, 367, 2478, 163, 842];

describe("commonChartConfiguration", () => {
  const mockData = [
    datasetConfiguration("testLabel", TEST_MAX_DATA_1, "#767676"),
  ];

  const testDates = [
    Date.parse("2020-01-01"),
    Date.parse("2020-01-02"),
    Date.parse("2020-01-03"),
    Date.parse("2020-01-04"),
  ];
  const smallMockData = [
    datasetConfiguration("testLabel", [1, 0, 0, 1], "#767676"),
  ];

  it("with date range", () => {
    const result = commonChartConfiguration(testDates, mockData, false, {
      startDate: 0,
      endDate: 1,
    });
    const expectedResult = { max: 1, min: 0, fontColor: "#767676" };
    expect(result.options.scales.xAxes[0].ticks).toStrictEqual(expectedResult);
  });

  it("without date range", () => {
    const result = commonChartConfiguration(testDates, mockData, false);
    const expectedResult = { fontColor: "#767676" };
    expect(result.options.scales.xAxes[0].ticks).toStrictEqual(expectedResult);
  });

  it("annotations with dataset", () => {
    const result = commonChartConfiguration(testDates, mockData, false);
    expect(result.options.annotation).not.toBeUndefined();
  });

  it("annotations without dataset", () => {
    const result = commonChartConfiguration(testDates, [], false);
    expect(result.options.annotation).toBeUndefined();
  });
  it("darkmode true", () => {
    const result = commonChartConfiguration(testDates, mockData, true);
    expect(result.options.scales.yAxes[0].gridLines.color).toStrictEqual(
      "#121212"
    );
    expect(result.options.scales.xAxes[0].ticks.fontColor).toStrictEqual(
      "#f2f2f2"
    );
    expect(result.options.scales.yAxes[0].ticks.fontColor).toStrictEqual(
      "#f2f2f2"
    );
    expect(result.options.legend.labels.fontColor).toStrictEqual("#f2f2f2");
    expect(result.options.annotation.annotations[0].borderColor).toStrictEqual(
      "#f2f2f2"
    );
    expect(
      result.options.annotation.annotations[0].label.backgroundColor
    ).toStrictEqual("#c1def1");
  });
  it("darkmode false", () => {
    const result = commonChartConfiguration(testDates, mockData, false);
    expect(result.options.scales.yAxes[0].gridLines.color).toStrictEqual(
      "#cccccc"
    );
    expect(result.options.scales.xAxes[0].ticks.fontColor).toStrictEqual(
      "#767676"
    );
    expect(result.options.scales.yAxes[0].ticks.fontColor).toStrictEqual(
      "#767676"
    );
    expect(result.options.legend.labels.fontColor).toStrictEqual("#767676");
    expect(result.options.annotation.annotations[0].borderColor).toStrictEqual(
      "rgba(0,0,0,0.25)"
    );
    expect(
      result.options.annotation.annotations[0].label.backgroundColor
    ).toStrictEqual("#007EB9");
  });

  it("receive maxTicks less than 20", () => {
    const result = commonChartConfiguration(testDates, smallMockData);
    expect(result.options.scales.yAxes[0].ticks.maxTicksLimit).toStrictEqual(1);
  });

  it("receive maxTicks more than 20", () => {
    const result = commonChartConfiguration(testDates, mockData);
    expect(result.options.scales.yAxes[0].ticks.maxTicksLimit).toStrictEqual(
      20
    );
  });
});

describe("calculateDateRange", () => {
  const TEST_DATE_RANGE = {
    startDate: Date.parse("2020-02-28"),
    endDate: Date.parse("2020-09-30"),
  };
  const EMPTY_DATE_RANGE = {
    startDate: 0,
    endDate: 1,
  };

  it("all dates", () => {
    const result = calculateDateRange(TEST_DATE_RANGE, ALL_DATES);
    expect(result).toStrictEqual(TEST_DATE_RANGE);
  });

  it("last week", () => {
    const result = calculateDateRange(TEST_DATE_RANGE, LAST_WEEK);
    const expectedResult = {
      startDate: Date.parse("2020-09-23"),
      endDate: Date.parse("2020-09-30"),
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("last two weeks", () => {
    const result = calculateDateRange(TEST_DATE_RANGE, LAST_TWO_WEEKS);
    const expectedResult = {
      startDate: Date.parse("2020-09-16"),
      endDate: Date.parse("2020-09-30"),
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("last month", () => {
    const result = calculateDateRange(TEST_DATE_RANGE, LAST_MONTH);
    const expectedResult = {
      startDate: Date.parse("2020-08-30"),
      endDate: Date.parse("2020-09-30"),
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("last three months", () => {
    const result = calculateDateRange(TEST_DATE_RANGE, LAST_THREE_MONTHS);
    const expectedResult = {
      startDate: Date.parse("2020-06-30"),
      endDate: Date.parse("2020-09-30"),
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("time period is null", () => {
    expect(() => calculateDateRange(TEST_DATE_RANGE, null)).toThrow(
      "timePeriod invalid: null"
    );
  });

  it("time period is unknown", () => {
    expect(() => calculateDateRange(TEST_DATE_RANGE, "unknown")).toThrow(
      "timePeriod invalid: unknown"
    );
  });

  it("last week with short date range", () => {
    const result = calculateDateRange(EMPTY_DATE_RANGE, LAST_WEEK);
    expect(result).toStrictEqual(EMPTY_DATE_RANGE);
  });
});

describe("getChartYMax", () => {
  const TEST_EMPTY_DATASET = [{ data: [] }];
  const TEST_SINGLE_DATASET = [{ data: TEST_MAX_DATA_1 }];
  const TEST_DOUBLE_DATASET = [
    { data: TEST_MAX_DATA_1 },
    { data: TEST_MAX_DATA_2 },
  ];

  it("datasets empty", () => {
    expect(getChartYMax([])).toStrictEqual(0);
  });

  it("datasets null", () => {
    expect(getChartYMax(null)).toStrictEqual(0);
  });

  it("datasets undefined", () => {
    expect(getChartYMax(undefined)).toStrictEqual(0);
  });

  it("normal datasets", () => {
    expect(getChartYMax(TEST_SINGLE_DATASET)).toStrictEqual(799);
    expect(getChartYMax(TEST_DOUBLE_DATASET)).toStrictEqual(4056);
  });

  it("dataset without data points", () => {
    expect(getChartYMax(TEST_EMPTY_DATASET)).toStrictEqual(0);
  });
});

describe("getMaxTicks", () => {
  it("return expected results", () => {
    expect(getMaxTicks(null)).toStrictEqual(1);
    expect(getMaxTicks()).toStrictEqual(1);
    expect(getMaxTicks(0)).toStrictEqual(1);
    expect(getMaxTicks(1)).toStrictEqual(1);
    expect(getMaxTicks(5)).toStrictEqual(5);
    expect(getMaxTicks(20)).toStrictEqual(20);
    expect(getMaxTicks(1000000)).toStrictEqual(20);
  });
});
