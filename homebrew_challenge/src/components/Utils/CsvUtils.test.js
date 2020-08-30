import {
  readCsvData,
  createPlaceDateValuesMap,
  createDateAggregateValuesMap,
  fetchAndStore,
  getPlaceNameByFeatureCode,
  parse7DayWindowCsvData,
  getRelativeReportedDate,
} from "../Utils/CsvUtils";
import { act } from "react-dom/test-utils";

beforeEach(() => {
  fetch.resetMocks();
});

const inputCsvData = `date,areaname,count
    2020-03-16,Orkney Islands,0
    2020-03-23,Glasgow City,7
    2020-03-23,Aberdeen City,0
    2020-03-30,Orkney Islands,0
    2020-03-30,Glasgow City,46
    2020-03-16,Glasgow City,1
    2020-03-16,Aberdeen City,1
    2020-03-23,Orkney Islands,0
    2020-03-30,Aberdeen City,2

    `;

const parsedCsvData = [
  ["2020-03-16", "Orkney Islands", "0"],
  ["2020-03-23", "Glasgow City", "7"],
  ["2020-03-23", "Aberdeen City", "0"],
  ["2020-03-30", "Orkney Islands", "0"],
  ["2020-03-30", "Glasgow City", "46"],
  ["2020-03-16", "Glasgow City", "1"],
  ["2020-03-16", "Aberdeen City", "1"],
  ["2020-03-23", "Orkney Islands", "0"],
  ["2020-03-30", "Aberdeen City", "2"],
];

test("readCsvData", () => {
  expect(readCsvData(inputCsvData)).toStrictEqual(parsedCsvData);
});

test("fetchAndStore when fetch fails", async () => {
  fetch.mockReject(new Error("fetch failed"));
  global.suppressConsoleErrorLogs();
  var processedResult = null;

  await act(async () => {
    await fetchAndStore(
      "test query",
      readCsvData,
      (val) => (processedResult = parsedCsvData)
    );
  });

  expect(processedResult).toBeNull();
  expect(fetch.mock.calls).toHaveLength(1);
});

test("fetchAndStore when fetch succeeds", async () => {
  fetch.mockResponse(inputCsvData);
  var processedResult = null;

  await act(async () => {
    await fetchAndStore(
      "test query",
      readCsvData,
      (val) => (processedResult = parsedCsvData)
    );
  });

  expect(processedResult).toStrictEqual(parsedCsvData);
  expect(fetch.mock.calls).toHaveLength(1);
});

test("getPlaceNameByFeatureCode", async () => {
  // Health board
  expect(getPlaceNameByFeatureCode("S08000031")).toStrictEqual(
    "Greater Glasgow & Clyde"
  );
  expect(getPlaceNameByFeatureCode("S08000017")).toStrictEqual(
    "Dumfries & Galloway"
  );
  // Council area
  expect(getPlaceNameByFeatureCode("S12000040")).toStrictEqual("West Lothian");
  expect(getPlaceNameByFeatureCode("S12000013")).toStrictEqual(
    "Na h-Eileanan Siar"
  );
  // Country
  expect(getPlaceNameByFeatureCode("S92000003")).toStrictEqual("Scotland");
  expect(() => getPlaceNameByFeatureCode("S12345678")).toThrow(
    "Unknown feature code: S12345678"
  );
  expect(() => getPlaceNameByFeatureCode("unknown")).toThrow(
    "Unknown feature code: unknown"
  );
  expect(() => getPlaceNameByFeatureCode("")).toThrow("Unknown feature code: ");
  expect(() => getPlaceNameByFeatureCode(null)).toThrow(
    "Unknown feature code: null"
  );
  expect(() => getPlaceNameByFeatureCode(undefined)).toThrow(
    "Unknown feature code: undefined"
  );
});

// Contains both health board and council area feature codes
const dailyNHSCsvData = `
20200306,S08000031,0,21,0.21,0,1,10,0,31,0
20200306,S08000022,1,22,0.22,0,2,20,0,32,0
20200306,S12000013,1,23,0.23,0,3,30,0,33,0
20200309,S08000031,0,24,0.24,0,4,40,0,34,0
20200309,S08000022,300,25,0.25,0,5,50,0,35,0
20200309,S12000013,-8,26,0.26,0,6,60,0,36,0
20200308,S08000031,0,27,0.27,0,7,70,0,37,0
20200308,S08000022,201,28,0.28,0,8,80,0,38,0
20200308,S12000013,26,29,0.29,0,9,90,0,39,0
20200307,S08000031,0,0,0,0,0,0,0,0,0
20200307,S08000022,-1,-21,-0.21,0,-1,-10,0,-31,0
20200307,S12000013,-1,-22,-0.22,0,-2,-20,0,-32,0
`;

const dailyHealthBoardCsvLabels =
  "Date,HB,DailyPositive,CumulativePositive,CrudeRatePositive,CumulativePositivePercent,DailyDeaths,CumulativeDeaths,CrudeRateDeaths,CumulativeNegative,CrudeRateNegative";
const dailyCouncilAreaCsvLabels =
  "Date,CA,DailyPositive,CumulativePositive,CrudeRatePositive,CumulativePositivePercent,DailyDeaths,CumulativeDeaths,CrudeRateDeaths,CumulativeNegative,CrudeRateNegative";

const dailyHealthBoardCsvData = dailyHealthBoardCsvLabels + dailyNHSCsvData;
const dailyCouncilAreaCsvData = dailyCouncilAreaCsvLabels + dailyNHSCsvData;

describe("createPlaceDateValuesMap", () => {
  const expectedPlaceDateValuesMap = {
    dates: [
      Date.parse("2020-03-06"),
      Date.parse("2020-03-07"),
      Date.parse("2020-03-08"),
      Date.parse("2020-03-09"),
    ],
    placeDateValuesMap: new Map()
      .set(
        "S08000031",
        new Map()
          .set(Date.parse("2020-03-06"), {
            cases: 0,
            deaths: 1,
            cumulativeDeaths: 10,
            cumulativeCases: 21,
            crudeRatePositive: 0.21,
          })
          .set(Date.parse("2020-03-07"), {
            cases: 0,
            deaths: 0,
            cumulativeDeaths: 0,
            cumulativeCases: 0,
            crudeRatePositive: 0,
          })
          .set(Date.parse("2020-03-08"), {
            cases: 0,
            deaths: 7,
            cumulativeDeaths: 70,
            cumulativeCases: 27,
            crudeRatePositive: 0.27,
          })
          .set(Date.parse("2020-03-09"), {
            cases: 0,
            deaths: 4,
            cumulativeDeaths: 40,
            cumulativeCases: 24,
            crudeRatePositive: 0.24,
          })
      )
      .set(
        "S08000022",
        new Map()
          .set(Date.parse("2020-03-06"), {
            cases: 1,
            deaths: 2,
            cumulativeDeaths: 20,
            cumulativeCases: 22,
            crudeRatePositive: 0.22,
          })
          .set(Date.parse("2020-03-07"), {
            cases: -1,
            deaths: -1,
            cumulativeDeaths: -10,
            cumulativeCases: -21,
            crudeRatePositive: -0.21,
          })
          .set(Date.parse("2020-03-08"), {
            cases: 201,
            deaths: 8,
            cumulativeDeaths: 80,
            cumulativeCases: 28,
            crudeRatePositive: 0.28,
          })
          .set(Date.parse("2020-03-09"), {
            cases: 300,
            deaths: 5,
            cumulativeDeaths: 50,
            cumulativeCases: 25,
            crudeRatePositive: 0.25,
          })
      )
      .set(
        "S12000013",
        new Map()
          .set(Date.parse("2020-03-06"), {
            cases: 1,
            deaths: 3,
            cumulativeDeaths: 30,
            cumulativeCases: 23,
            crudeRatePositive: 0.23,
          })
          .set(Date.parse("2020-03-07"), {
            cases: -1,
            deaths: -2,
            cumulativeDeaths: -20,
            cumulativeCases: -22,
            crudeRatePositive: -0.22,
          })
          .set(Date.parse("2020-03-08"), {
            cases: 26,
            deaths: 9,
            cumulativeDeaths: 90,
            cumulativeCases: 29,
            crudeRatePositive: 0.29,
          })
          .set(Date.parse("2020-03-09"), {
            cases: -8,
            deaths: 6,
            cumulativeDeaths: 60,
            cumulativeCases: 26,
            crudeRatePositive: 0.26,
          })
      ),
  };

  it("health boards", () => {
    const parsedDailyHealthBoardData = readCsvData(dailyHealthBoardCsvData);
    expect(createPlaceDateValuesMap(parsedDailyHealthBoardData)).toStrictEqual(
      expectedPlaceDateValuesMap
    );
  });

  it("council areas", () => {
    const parsedDailyCouncilAreaData = readCsvData(dailyCouncilAreaCsvData);
    expect(createPlaceDateValuesMap(parsedDailyCouncilAreaData)).toStrictEqual(
      expectedPlaceDateValuesMap
    );
  });
});

describe("createDateAggregateValuesMap", () => {
  const expectedDateAggregateValuesMap = new Map()
    .set(Date.parse("2020-03-06"), {
      cases: 2,
      deaths: 6,
      cumulativeCases: 66,
      cumulativeDeaths: 60,
      cumulativeNegativeTests: 96,
    })
    .set(Date.parse("2020-03-07"), {
      cases: -2,
      deaths: -3,
      cumulativeCases: -43,
      cumulativeDeaths: -30,
      cumulativeNegativeTests: -63,
    })
    .set(Date.parse("2020-03-08"), {
      cases: 227,
      deaths: 24,
      cumulativeCases: 84,
      cumulativeDeaths: 240,
      cumulativeNegativeTests: 114,
    })
    .set(Date.parse("2020-03-09"), {
      cases: 292,
      deaths: 15,
      cumulativeCases: 75,
      cumulativeDeaths: 150,
      cumulativeNegativeTests: 105,
    });

  it("health boards", () => {
    const parsedDailyHealthBoardData = readCsvData(dailyHealthBoardCsvData);
    expect(
      createDateAggregateValuesMap(parsedDailyHealthBoardData)
    ).toStrictEqual(expectedDateAggregateValuesMap);
  });

  it("council areas", () => {
    const parsedDailyCouncilAreaData = readCsvData(dailyCouncilAreaCsvData);
    expect(
      createDateAggregateValuesMap(parsedDailyCouncilAreaData)
    ).toStrictEqual(expectedDateAggregateValuesMap);
  });
});

test("getRelativeReportedDate", () => {
  // Set today to be 2020-06-22
  setMockDate("2020-06-22");

  expect(getRelativeReportedDate(Date.parse("2020-06-22"))).toBe(
    "Reported Today"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-21"))).toBe(
    "Reported Yesterday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-20"))).toBe(
    "Reported last Saturday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-19"))).toBe(
    "Reported last Friday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-18"))).toBe(
    "Reported last Thursday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-17"))).toBe(
    "Reported last Wednesday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-16"))).toBe(
    "Reported last Tuesday"
  );
  expect(getRelativeReportedDate(Date.parse("2020-06-15"))).toBe(
    "Reported on 15/06/2020"
  );
  expect(getRelativeReportedDate(undefined)).toBeUndefined();
  expect(getRelativeReportedDate(null)).toBeUndefined();
});

const dailyCasesCsvData = `
  Date,HB,DailyPositive,CumulativePositive,CrudeRatePositive,CumulativePositivePercent,DailyDeaths,CumulativeDeaths,CrudeRateDeaths,CumulativeNegative,CrudeRateNegative
  20200309,S08000020,-8,0,0,0,-2,0,0,28,7.58068009529998
  20200308,S08000020,26,0,0,0,0,0,0,28,7.58068009529998
  20200307,S08000020,-1,0,0,0,-1,0,0,28,7.58068009529998
  20200306,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200305,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200304,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200303,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200302,S08000020,-6,0,0,0,-2,0,0,28,7.58068009529998
  20200301,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200229,S08000020,1,0,0,0,1,0,0,28,7.58068009529998
  20200308,S08000031,0,0,0,0,11,0,0,26,22.5088736905896
  20200307,S08000031,400,0,0,0,10,0,0,26,22.5088736905896
  20200306,S08000031,300,0,0,0,9,0,0,26,22.5088736905896
  20200305,S08000031,200,0,0,0,8,0,0,26,22.5088736905896
  20200304,S08000031,100,0,0,0,7,0,0,26,22.5088736905896
  20200303,S08000031,50,0,0,0,6,0,0,26,22.5088736905896
  20200226,S08000031,20,0,0,0,5,0,0,26,22.5088736905896
  20200225,S08000031,0,0,0,0,4,0,0,26,22.5088736905896
  20200224,S08000031,10,0,0,0,3,0,0,26,22.5088736905896
  20200309,S08000022,300,0,0,0,10,0,0,21,14.1072148327287
  20200308,S08000022,201,0,0,0,9,0,0,21,14.1072148327287
  20200306,S08000022,1,0,0,0,8,0,0,21,14.1072148327287
  20200307,S08000022,-1,0,0,0,7,0,0,21,14.1072148327287
    `;

test("parse7DayWindowCsvData", () => {
  // Grampian : 09/03 - 03/03 : 7 days of data
  // Glasgow : 08/03 - 03/03 : 6 days of data
  // Highland : 09/03 - 06/03 : 4 days of data
  const expectedResult = new Map()
    .set("S08000020", {
      cases: 21,
      deaths: 1,
      name: "Grampian",
      fromDate: Date.parse("2020-03-03"),
      toDate: Date.parse("2020-03-09"),
    })
    .set("S08000031", {
      cases: 1050,
      deaths: 51,
      name: "Greater Glasgow & Clyde",
      fromDate: Date.parse("2020-03-03"),
      toDate: Date.parse("2020-03-09"),
    })
    .set("S08000022", {
      cases: 501,
      deaths: 34,
      name: "Highland",
      fromDate: Date.parse("2020-03-03"),
      toDate: Date.parse("2020-03-09"),
    })
    .set("S92000003", {
      cases: 1572,
      deaths: 86,
      name: "Scotland",
      fromDate: Date.parse("2020-03-03"),
      toDate: Date.parse("2020-03-09"),
    });

  expect(parse7DayWindowCsvData(readCsvData(dailyCasesCsvData))).toStrictEqual(
    expectedResult
  );
});

function setMockDate(date) {
  jest
    .spyOn(global.Date, "now")
    .mockImplementation(() => Date.parse(date).valueOf());
}
