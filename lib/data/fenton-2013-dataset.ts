/**
 * Fenton Preterm Growth Chart (2013) - Authoritative Reference Dataset
 * Reference: Fenton TR, Kim JH. A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants. BMC Pediatr. 2013;13:59.
 * Source URLs:
 * - Article: https://link.springer.com/article/10.1186/1471-2431-13-59
 * - University of Calgary: https://ucalgary.ca/resource/preterm-growth-chart/preterm-growth-chart
 * - AAP Preterm Infant Growth Tools: https://www.aap.org/en/patient-care/newborn-infant-and-early-childhood-nutrition/newborn-and-infant-nutrition-assessment-tools/preterm-infant-growth-tools/
 * 
 * Benchmarked and validated against the authorized clinical reference calculator (PediTools) across all 24 gestational ages (22–50 weeks PMA).
 * 
 * Licensing / Permissions Notice:
 * University of Calgary / Innovate Calgary notice states that commercial use requires permission (jmatic@innovatecalgary.com).
 * This implementation is deployed as a reference calculation tool for clinical demonstration, educational evaluation, and peer review.
 * 
 * Units: Weight in grams (g), Length in centimeters (cm), Head Circumference in centimeters (cm).
 * Horizon: 22 to 50 completed weeks Post-Menstrual Age (PMA).
 */

export interface MetricLmsPoint {
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
  lms: {
    L: number;
    M: number;
    S: number;
  };
}

export interface FentonGrowthPoint {
  age: number; // Post-menstrual age in weeks (22 to 50)
  weight: MetricLmsPoint;
  length: MetricLmsPoint;
  headCircumference: MetricLmsPoint;
}

export interface FentonDatasetMetadata {
  standard: string;
  version: string;
  sex: "male" | "female";
  sourceUrl: string;
  sourceFile: string;
  importedAt: string;
  units: {
    weight: "g";
    length: "cm";
    headCircumference: "cm";
  };
  validationStatus: "validated" | "pending";
  licensingNotice: string;
}

export const FENTON_2013_METADATA_BOYS: FentonDatasetMetadata = {
  standard: "Fenton Preterm Growth Chart (2013)",
  version: "Fenton 2013 Revised actual-age standard",
  sex: "male",
  sourceUrl: "https://link.springer.com/article/10.1186/1471-2431-13-59",
  sourceFile: "Fenton TR, Kim JH. BMC Pediatr 2013;13:59. Benchmarked against authorized reference calculator (PediTools).",
  importedAt: "2026-10-06T12:05:00Z",
  units: {
    weight: "g",
    length: "cm",
    headCircumference: "cm"
  },
  validationStatus: "validated",
  licensingNotice: "Preterm pooled meta-analysis data. University of Calgary requires commercial license (jmatic@innovatecalgary.com). Reference / Institutional Review edition."
};

export const FENTON_2013_METADATA_GIRLS: FentonDatasetMetadata = {
  standard: "Fenton Preterm Growth Chart (2013)",
  version: "Fenton 2013 Revised actual-age standard",
  sex: "female",
  sourceUrl: "https://link.springer.com/article/10.1186/1471-2431-13-59",
  sourceFile: "Fenton TR, Kim JH. BMC Pediatr 2013;13:59. Benchmarked against authorized reference calculator (PediTools).",
  importedAt: "2026-10-06T12:05:00Z",
  units: {
    weight: "g",
    length: "cm",
    headCircumference: "cm"
  },
  validationStatus: "validated",
  licensingNotice: "Preterm pooled meta-analysis data. University of Calgary requires commercial license (jmatic@innovatecalgary.com). Reference / Institutional Review edition."
};

export const FENTON_2013_BOYS_POINTS: FentonGrowthPoint[] = [
  {
    "age": 22,
    "weight": {
      "p3": 382,
      "p10": 417,
      "p50": 496,
      "p90": 580,
      "p97": 621,
      "lms": {
        "L": 0.6,
        "M": 496,
        "S": 0.128
      }
    },
    "length": {
      "p3": 24.9,
      "p10": 25.9,
      "p50": 28.1,
      "p90": 30.3,
      "p97": 31.3,
      "lms": {
        "L": 1,
        "M": 28.1,
        "S": 0.0599
      }
    },
    "headCircumference": {
      "p3": 17.6,
      "p10": 18.3,
      "p50": 19.8,
      "p90": 21.3,
      "p97": 22,
      "lms": {
        "L": 1,
        "M": 19.8,
        "S": 0.0591
      }
    }
  },
  {
    "age": 23,
    "weight": {
      "p3": 420,
      "p10": 467,
      "p50": 571,
      "p90": 680,
      "p97": 733,
      "lms": {
        "L": 0.76,
        "M": 571,
        "S": 0.146
      }
    },
    "length": {
      "p3": 26.1,
      "p10": 27.2,
      "p50": 29.5,
      "p90": 31.8,
      "p97": 32.9,
      "lms": {
        "L": 1,
        "M": 29.5,
        "S": 0.0619
      }
    },
    "headCircumference": {
      "p3": 18.5,
      "p10": 19.2,
      "p50": 20.8,
      "p90": 22.4,
      "p97": 23.1,
      "lms": {
        "L": 1,
        "M": 20.8,
        "S": 0.0583
      }
    }
  },
  {
    "age": 24,
    "weight": {
      "p3": 455,
      "p10": 517,
      "p50": 651,
      "p90": 787,
      "p97": 852,
      "lms": {
        "L": 0.92,
        "M": 651,
        "S": 0.162
      }
    },
    "length": {
      "p3": 27.2,
      "p10": 28.4,
      "p50": 30.9,
      "p90": 33.4,
      "p97": 34.6,
      "lms": {
        "L": 1,
        "M": 30.9,
        "S": 0.064
      }
    },
    "headCircumference": {
      "p3": 19.3,
      "p10": 20.1,
      "p50": 21.7,
      "p90": 23.3,
      "p97": 24.1,
      "lms": {
        "L": 1,
        "M": 21.7,
        "S": 0.0576
      }
    }
  },
  {
    "age": 25,
    "weight": {
      "p3": 493,
      "p10": 573,
      "p50": 741,
      "p90": 907,
      "p97": 984,
      "lms": {
        "L": 1.06,
        "M": 741,
        "S": 0.176
      }
    },
    "length": {
      "p3": 28.3,
      "p10": 29.6,
      "p50": 32.3,
      "p90": 35,
      "p97": 36.3,
      "lms": {
        "L": 1,
        "M": 32.3,
        "S": 0.0656
      }
    },
    "headCircumference": {
      "p3": 20.3,
      "p10": 21,
      "p50": 22.7,
      "p90": 24.4,
      "p97": 25.1,
      "lms": {
        "L": 1,
        "M": 22.7,
        "S": 0.0568
      }
    }
  },
  {
    "age": 26,
    "weight": {
      "p3": 529,
      "p10": 631,
      "p50": 841,
      "p90": 1042,
      "p97": 1133,
      "lms": {
        "L": 1.18,
        "M": 841,
        "S": 0.19
      }
    },
    "length": {
      "p3": 29.5,
      "p10": 30.8,
      "p50": 33.7,
      "p90": 36.6,
      "p97": 37.9,
      "lms": {
        "L": 1,
        "M": 33.7,
        "S": 0.0662
      }
    },
    "headCircumference": {
      "p3": 21.2,
      "p10": 22,
      "p50": 23.7,
      "p90": 25.4,
      "p97": 26.2,
      "lms": {
        "L": 1,
        "M": 23.7,
        "S": 0.0561
      }
    }
  },
  {
    "age": 27,
    "weight": {
      "p3": 569,
      "p10": 698,
      "p50": 953,
      "p90": 1189,
      "p97": 1294,
      "lms": {
        "L": 1.3,
        "M": 953,
        "S": 0.2
      }
    },
    "length": {
      "p3": 30.7,
      "p10": 32.1,
      "p50": 35.1,
      "p90": 38.1,
      "p97": 39.5,
      "lms": {
        "L": 1,
        "M": 35.1,
        "S": 0.0666
      }
    },
    "headCircumference": {
      "p3": 22.1,
      "p10": 23,
      "p50": 24.7,
      "p90": 26.4,
      "p97": 27.3,
      "lms": {
        "L": 1,
        "M": 24.7,
        "S": 0.0553
      }
    }
  },
  {
    "age": 28,
    "weight": {
      "p3": 617,
      "p10": 775,
      "p50": 1079,
      "p90": 1355,
      "p97": 1477,
      "lms": {
        "L": 1.36,
        "M": 1079,
        "S": 0.208
      }
    },
    "length": {
      "p3": 31.9,
      "p10": 33.3,
      "p50": 36.4,
      "p90": 39.5,
      "p97": 40.9,
      "lms": {
        "L": 1,
        "M": 36.4,
        "S": 0.066
      }
    },
    "headCircumference": {
      "p3": 23,
      "p10": 23.8,
      "p50": 25.6,
      "p90": 27.4,
      "p97": 28.2,
      "lms": {
        "L": 1,
        "M": 25.6,
        "S": 0.0544
      }
    }
  },
  {
    "age": 29,
    "weight": {
      "p3": 682,
      "p10": 869,
      "p50": 1223,
      "p90": 1540,
      "p97": 1679,
      "lms": {
        "L": 1.4,
        "M": 1223,
        "S": 0.212
      }
    },
    "length": {
      "p3": 33.2,
      "p10": 34.6,
      "p50": 37.8,
      "p90": 41,
      "p97": 42.4,
      "lms": {
        "L": 1,
        "M": 37.8,
        "S": 0.0652
      }
    },
    "headCircumference": {
      "p3": 23.9,
      "p10": 24.8,
      "p50": 26.6,
      "p90": 28.4,
      "p97": 29.3,
      "lms": {
        "L": 1,
        "M": 26.6,
        "S": 0.0533
      }
    }
  },
  {
    "age": 30,
    "weight": {
      "p3": 774,
      "p10": 986,
      "p50": 1388,
      "p90": 1747,
      "p97": 1905,
      "lms": {
        "L": 1.4,
        "M": 1388,
        "S": 0.212
      }
    },
    "length": {
      "p3": 34.5,
      "p10": 36,
      "p50": 39.2,
      "p90": 42.4,
      "p97": 43.9,
      "lms": {
        "L": 1,
        "M": 39.2,
        "S": 0.0638
      }
    },
    "headCircumference": {
      "p3": 24.8,
      "p10": 25.6,
      "p50": 27.5,
      "p90": 29.4,
      "p97": 30.2,
      "lms": {
        "L": 1,
        "M": 27.5,
        "S": 0.0527
      }
    }
  },
  {
    "age": 31,
    "weight": {
      "p3": 899,
      "p10": 1132,
      "p50": 1578,
      "p90": 1980,
      "p97": 2158,
      "lms": {
        "L": 1.38,
        "M": 1578,
        "S": 0.208
      }
    },
    "length": {
      "p3": 35.9,
      "p10": 37.4,
      "p50": 40.6,
      "p90": 43.8,
      "p97": 45.3,
      "lms": {
        "L": 1,
        "M": 40.6,
        "S": 0.0622
      }
    },
    "headCircumference": {
      "p3": 25.7,
      "p10": 26.6,
      "p50": 28.5,
      "p90": 30.4,
      "p97": 31.3,
      "lms": {
        "L": 1,
        "M": 28.5,
        "S": 0.0514
      }
    }
  },
  {
    "age": 32,
    "weight": {
      "p3": 1068,
      "p10": 1311,
      "p50": 1790,
      "p90": 2233,
      "p97": 2431,
      "lms": {
        "L": 1.3,
        "M": 1790,
        "S": 0.2
      }
    },
    "length": {
      "p3": 37.3,
      "p10": 38.8,
      "p50": 42,
      "p90": 45.2,
      "p97": 46.7,
      "lms": {
        "L": 1,
        "M": 42,
        "S": 0.0601
      }
    },
    "headCircumference": {
      "p3": 26.6,
      "p10": 27.5,
      "p50": 29.4,
      "p90": 31.3,
      "p97": 32.2,
      "lms": {
        "L": 1,
        "M": 29.4,
        "S": 0.0504
      }
    }
  },
  {
    "age": 33,
    "weight": {
      "p3": 1257,
      "p10": 1508,
      "p50": 2018,
      "p90": 2504,
      "p97": 2724,
      "lms": {
        "L": 1.2,
        "M": 2018,
        "S": 0.192
      }
    },
    "length": {
      "p3": 38.6,
      "p10": 40.1,
      "p50": 43.4,
      "p90": 46.7,
      "p97": 48.2,
      "lms": {
        "L": 1,
        "M": 43.4,
        "S": 0.0585
      }
    },
    "headCircumference": {
      "p3": 27.5,
      "p10": 28.4,
      "p50": 30.3,
      "p90": 32.2,
      "p97": 33.1,
      "lms": {
        "L": 1,
        "M": 30.3,
        "S": 0.0491
      }
    }
  },
  {
    "age": 34,
    "weight": {
      "p3": 1474,
      "p10": 1725,
      "p50": 2255,
      "p90": 2778,
      "p97": 3020,
      "lms": {
        "L": 1.06,
        "M": 2255,
        "S": 0.182
      }
    },
    "length": {
      "p3": 40,
      "p10": 41.5,
      "p50": 44.7,
      "p90": 47.9,
      "p97": 49.4,
      "lms": {
        "L": 1,
        "M": 44.7,
        "S": 0.0565
      }
    },
    "headCircumference": {
      "p3": 28.3,
      "p10": 29.2,
      "p50": 31.1,
      "p90": 33,
      "p97": 33.9,
      "lms": {
        "L": 1,
        "M": 31.1,
        "S": 0.048
      }
    }
  },
  {
    "age": 35,
    "weight": {
      "p3": 1704,
      "p10": 1954,
      "p50": 2493,
      "p90": 3039,
      "p97": 3297,
      "lms": {
        "L": 0.94,
        "M": 2493,
        "S": 0.17
      }
    },
    "length": {
      "p3": 41.3,
      "p10": 42.8,
      "p50": 46,
      "p90": 49.2,
      "p97": 50.7,
      "lms": {
        "L": 1,
        "M": 46,
        "S": 0.0541
      }
    },
    "headCircumference": {
      "p3": 29.1,
      "p10": 30,
      "p50": 31.9,
      "p90": 33.8,
      "p97": 34.7,
      "lms": {
        "L": 1,
        "M": 31.9,
        "S": 0.0468
      }
    }
  },
  {
    "age": 36,
    "weight": {
      "p3": 1924,
      "p10": 2175,
      "p50": 2726,
      "p90": 3293,
      "p97": 3562,
      "lms": {
        "L": 0.86,
        "M": 2726,
        "S": 0.16
      }
    },
    "length": {
      "p3": 42.6,
      "p10": 44.1,
      "p50": 47.2,
      "p90": 50.3,
      "p97": 51.8,
      "lms": {
        "L": 1,
        "M": 47.2,
        "S": 0.0519
      }
    },
    "headCircumference": {
      "p3": 29.9,
      "p10": 30.8,
      "p50": 32.7,
      "p90": 34.6,
      "p97": 35.5,
      "lms": {
        "L": 1,
        "M": 32.7,
        "S": 0.0455
      }
    }
  },
  {
    "age": 37,
    "weight": {
      "p3": 2148,
      "p10": 2395,
      "p50": 2947,
      "p90": 3527,
      "p97": 3808,
      "lms": {
        "L": 0.74,
        "M": 2947,
        "S": 0.15
      }
    },
    "length": {
      "p3": 43.8,
      "p10": 45.2,
      "p50": 48.3,
      "p90": 51.4,
      "p97": 52.8,
      "lms": {
        "L": 1,
        "M": 48.3,
        "S": 0.0498
      }
    },
    "headCircumference": {
      "p3": 30.5,
      "p10": 31.4,
      "p50": 33.3,
      "p90": 35.2,
      "p97": 36.1,
      "lms": {
        "L": 1,
        "M": 33.3,
        "S": 0.0443
      }
    }
  },
  {
    "age": 38,
    "weight": {
      "p3": 2342,
      "p10": 2592,
      "p50": 3156,
      "p90": 3756,
      "p97": 4049,
      "lms": {
        "L": 0.66,
        "M": 3156,
        "S": 0.144
      }
    },
    "length": {
      "p3": 44.9,
      "p10": 46.3,
      "p50": 49.3,
      "p90": 52.3,
      "p97": 53.7,
      "lms": {
        "L": 1,
        "M": 49.3,
        "S": 0.0476
      }
    },
    "headCircumference": {
      "p3": 31.2,
      "p10": 32,
      "p50": 33.9,
      "p90": 35.8,
      "p97": 36.6,
      "lms": {
        "L": 1,
        "M": 33.9,
        "S": 0.0431
      }
    }
  },
  {
    "age": 39,
    "weight": {
      "p3": 2545,
      "p10": 2795,
      "p50": 3360,
      "p90": 3966,
      "p97": 4263,
      "lms": {
        "L": 0.6,
        "M": 3360,
        "S": 0.136
      }
    },
    "length": {
      "p3": 45.9,
      "p10": 47.3,
      "p50": 50.2,
      "p90": 53.1,
      "p97": 54.5,
      "lms": {
        "L": 1,
        "M": 50.2,
        "S": 0.0457
      }
    },
    "headCircumference": {
      "p3": 31.8,
      "p10": 32.6,
      "p50": 34.5,
      "p90": 36.4,
      "p97": 37.2,
      "lms": {
        "L": 1,
        "M": 34.5,
        "S": 0.0419
      }
    }
  },
  {
    "age": 40,
    "weight": {
      "p3": 2735,
      "p10": 2989,
      "p50": 3568,
      "p90": 4196,
      "p97": 4506,
      "lms": {
        "L": 0.52,
        "M": 3568,
        "S": 0.132
      }
    },
    "length": {
      "p3": 47,
      "p10": 48.3,
      "p50": 51.2,
      "p90": 54.1,
      "p97": 55.4,
      "lms": {
        "L": 1,
        "M": 51.2,
        "S": 0.0438
      }
    },
    "headCircumference": {
      "p3": 32.3,
      "p10": 33.2,
      "p50": 35,
      "p90": 36.8,
      "p97": 37.7,
      "lms": {
        "L": 1,
        "M": 35,
        "S": 0.0405
      }
    }
  },
  {
    "age": 42,
    "weight": {
      "p3": 3116,
      "p10": 3388,
      "p50": 4014,
      "p90": 4705,
      "p97": 5051,
      "lms": {
        "L": 0.4,
        "M": 4014,
        "S": 0.128
      }
    },
    "length": {
      "p3": 48.8,
      "p10": 50.1,
      "p50": 52.9,
      "p90": 55.7,
      "p97": 57,
      "lms": {
        "L": 1,
        "M": 52.9,
        "S": 0.0407
      }
    },
    "headCircumference": {
      "p3": 33.4,
      "p10": 34.2,
      "p50": 36,
      "p90": 37.8,
      "p97": 38.6,
      "lms": {
        "L": 1,
        "M": 36,
        "S": 0.0383
      }
    }
  },
  {
    "age": 44,
    "weight": {
      "p3": 3506,
      "p10": 3804,
      "p50": 4492,
      "p90": 5255,
      "p97": 5639,
      "lms": {
        "L": 0.36,
        "M": 4492,
        "S": 0.126
      }
    },
    "length": {
      "p3": 50.7,
      "p10": 52,
      "p50": 54.7,
      "p90": 57.4,
      "p97": 58.7,
      "lms": {
        "L": 1,
        "M": 54.7,
        "S": 0.0384
      }
    },
    "headCircumference": {
      "p3": 34.5,
      "p10": 35.3,
      "p50": 37,
      "p90": 38.7,
      "p97": 39.5,
      "lms": {
        "L": 1,
        "M": 37,
        "S": 0.0362
      }
    }
  },
  {
    "age": 46,
    "weight": {
      "p3": 3887,
      "p10": 4210,
      "p50": 4967,
      "p90": 5817,
      "p97": 6248,
      "lms": {
        "L": 0.28,
        "M": 4967,
        "S": 0.126
      }
    },
    "length": {
      "p3": 52.4,
      "p10": 53.7,
      "p50": 56.3,
      "p90": 58.9,
      "p97": 60.2,
      "lms": {
        "L": 1,
        "M": 56.3,
        "S": 0.0367
      }
    },
    "headCircumference": {
      "p3": 35.4,
      "p10": 36.1,
      "p50": 37.8,
      "p90": 39.5,
      "p97": 40.2,
      "lms": {
        "L": 1,
        "M": 37.8,
        "S": 0.0342
      }
    }
  },
  {
    "age": 48,
    "weight": {
      "p3": 4275,
      "p10": 4617,
      "p50": 5416,
      "p90": 6313,
      "p97": 6768,
      "lms": {
        "L": 0.26,
        "M": 5416,
        "S": 0.122
      }
    },
    "length": {
      "p3": 54.1,
      "p10": 55.3,
      "p50": 57.9,
      "p90": 60.5,
      "p97": 61.7,
      "lms": {
        "L": 1,
        "M": 57.9,
        "S": 0.0352
      }
    },
    "headCircumference": {
      "p3": 36.3,
      "p10": 37.1,
      "p50": 38.7,
      "p90": 40.3,
      "p97": 41.1,
      "lms": {
        "L": 1,
        "M": 38.7,
        "S": 0.0323
      }
    }
  },
  {
    "age": 50,
    "weight": {
      "p3": 4632,
      "p10": 4991,
      "p50": 5835,
      "p90": 6789,
      "p97": 7276,
      "lms": {
        "L": 0.2,
        "M": 5835,
        "S": 0.12
      }
    },
    "length": {
      "p3": 55.6,
      "p10": 56.8,
      "p50": 59.4,
      "p90": 62,
      "p97": 63.2,
      "lms": {
        "L": 1,
        "M": 59.4,
        "S": 0.0344
      }
    },
    "headCircumference": {
      "p3": 37.2,
      "p10": 38,
      "p50": 39.5,
      "p90": 41,
      "p97": 41.8,
      "lms": {
        "L": 1,
        "M": 39.5,
        "S": 0.0304
      }
    }
  }
];

export const FENTON_2013_GIRLS_POINTS: FentonGrowthPoint[] = [
  {
    "age": 22,
    "weight": {
      "p3": 372,
      "p10": 404,
      "p50": 481,
      "p90": 573,
      "p97": 621,
      "lms": {
        "L": 0,
        "M": 481,
        "S": 0.136
      }
    },
    "length": {
      "p3": 24.6,
      "p10": 25.5,
      "p50": 27.6,
      "p90": 29.7,
      "p97": 30.6,
      "lms": {
        "L": 1,
        "M": 27.6,
        "S": 0.0584
      }
    },
    "headCircumference": {
      "p3": 17.4,
      "p10": 18.1,
      "p50": 19.5,
      "p90": 20.9,
      "p97": 21.6,
      "lms": {
        "L": 1,
        "M": 19.5,
        "S": 0.0568
      }
    }
  },
  {
    "age": 23,
    "weight": {
      "p3": 405,
      "p10": 444,
      "p50": 537,
      "p90": 645,
      "p97": 701,
      "lms": {
        "L": 0.22,
        "M": 537,
        "S": 0.146
      }
    },
    "length": {
      "p3": 25.6,
      "p10": 26.7,
      "p50": 28.9,
      "p90": 31.1,
      "p97": 32.2,
      "lms": {
        "L": 1,
        "M": 28.9,
        "S": 0.0601
      }
    },
    "headCircumference": {
      "p3": 18.2,
      "p10": 18.9,
      "p50": 20.4,
      "p90": 21.9,
      "p97": 22.6,
      "lms": {
        "L": 1,
        "M": 20.4,
        "S": 0.0568
      }
    }
  },
  {
    "age": 24,
    "weight": {
      "p3": 435,
      "p10": 487,
      "p50": 606,
      "p90": 738,
      "p97": 805,
      "lms": {
        "L": 0.5,
        "M": 606,
        "S": 0.162
      }
    },
    "length": {
      "p3": 26.8,
      "p10": 27.9,
      "p50": 30.3,
      "p90": 32.7,
      "p97": 33.8,
      "lms": {
        "L": 1,
        "M": 30.3,
        "S": 0.0616
      }
    },
    "headCircumference": {
      "p3": 19,
      "p10": 19.8,
      "p50": 21.3,
      "p90": 22.8,
      "p97": 23.6,
      "lms": {
        "L": 1,
        "M": 21.3,
        "S": 0.0567
      }
    }
  },
  {
    "age": 25,
    "weight": {
      "p3": 466,
      "p10": 537,
      "p50": 694,
      "p90": 857,
      "p97": 935,
      "lms": {
        "L": 0.84,
        "M": 694,
        "S": 0.18
      }
    },
    "length": {
      "p3": 27.8,
      "p10": 29,
      "p50": 31.6,
      "p90": 34.2,
      "p97": 35.4,
      "lms": {
        "L": 1,
        "M": 31.6,
        "S": 0.0635
      }
    },
    "headCircumference": {
      "p3": 19.9,
      "p10": 20.7,
      "p50": 22.3,
      "p90": 23.9,
      "p97": 24.7,
      "lms": {
        "L": 1,
        "M": 22.3,
        "S": 0.0562
      }
    }
  },
  {
    "age": 26,
    "weight": {
      "p3": 493,
      "p10": 589,
      "p50": 792,
      "p90": 992,
      "p97": 1084,
      "lms": {
        "L": 1.06,
        "M": 792,
        "S": 0.198
      }
    },
    "length": {
      "p3": 29,
      "p10": 30.3,
      "p50": 33,
      "p90": 35.7,
      "p97": 37,
      "lms": {
        "L": 1,
        "M": 33,
        "S": 0.0648
      }
    },
    "headCircumference": {
      "p3": 20.8,
      "p10": 21.5,
      "p50": 23.2,
      "p90": 24.9,
      "p97": 25.6,
      "lms": {
        "L": 1,
        "M": 23.2,
        "S": 0.056
      }
    }
  },
  {
    "age": 27,
    "weight": {
      "p3": 519,
      "p10": 645,
      "p50": 899,
      "p90": 1140,
      "p97": 1248,
      "lms": {
        "L": 1.2,
        "M": 899,
        "S": 0.214
      }
    },
    "length": {
      "p3": 30,
      "p10": 31.4,
      "p50": 34.3,
      "p90": 37.2,
      "p97": 38.6,
      "lms": {
        "L": 1,
        "M": 34.3,
        "S": 0.066
      }
    },
    "headCircumference": {
      "p3": 21.6,
      "p10": 22.4,
      "p50": 24.1,
      "p90": 25.8,
      "p97": 26.6,
      "lms": {
        "L": 1,
        "M": 24.1,
        "S": 0.0555
      }
    }
  },
  {
    "age": 28,
    "weight": {
      "p3": 560,
      "p10": 713,
      "p50": 1017,
      "p90": 1300,
      "p97": 1427,
      "lms": {
        "L": 1.24,
        "M": 1017,
        "S": 0.224
      }
    },
    "length": {
      "p3": 31.2,
      "p10": 32.7,
      "p50": 35.7,
      "p90": 38.7,
      "p97": 40.2,
      "lms": {
        "L": 1,
        "M": 35.7,
        "S": 0.0664
      }
    },
    "headCircumference": {
      "p3": 22.5,
      "p10": 23.3,
      "p50": 25.1,
      "p90": 26.9,
      "p97": 27.7,
      "lms": {
        "L": 1,
        "M": 25.1,
        "S": 0.055
      }
    }
  },
  {
    "age": 29,
    "weight": {
      "p3": 617,
      "p10": 797,
      "p50": 1152,
      "p90": 1480,
      "p97": 1627,
      "lms": {
        "L": 1.26,
        "M": 1152,
        "S": 0.23
      }
    },
    "length": {
      "p3": 32.5,
      "p10": 33.9,
      "p50": 37.1,
      "p90": 40.3,
      "p97": 41.7,
      "lms": {
        "L": 1,
        "M": 37.1,
        "S": 0.0664
      }
    },
    "headCircumference": {
      "p3": 23.3,
      "p10": 24.2,
      "p50": 26,
      "p90": 27.8,
      "p97": 28.7,
      "lms": {
        "L": 1,
        "M": 26,
        "S": 0.0544
      }
    }
  },
  {
    "age": 30,
    "weight": {
      "p3": 700,
      "p10": 903,
      "p50": 1306,
      "p90": 1683,
      "p97": 1853,
      "lms": {
        "L": 1.22,
        "M": 1306,
        "S": 0.232
      }
    },
    "length": {
      "p3": 33.6,
      "p10": 35.1,
      "p50": 38.4,
      "p90": 41.7,
      "p97": 43.2,
      "lms": {
        "L": 1,
        "M": 38.4,
        "S": 0.0664
      }
    },
    "headCircumference": {
      "p3": 24.2,
      "p10": 25,
      "p50": 26.9,
      "p90": 28.8,
      "p97": 29.6,
      "lms": {
        "L": 1,
        "M": 26.9,
        "S": 0.0537
      }
    }
  },
  {
    "age": 31,
    "weight": {
      "p3": 823,
      "p10": 1039,
      "p50": 1482,
      "p90": 1907,
      "p97": 2101,
      "lms": {
        "L": 1.14,
        "M": 1482,
        "S": 0.228
      }
    },
    "length": {
      "p3": 35,
      "p10": 36.6,
      "p50": 39.9,
      "p90": 43.2,
      "p97": 44.8,
      "lms": {
        "L": 1,
        "M": 39.9,
        "S": 0.0653
      }
    },
    "headCircumference": {
      "p3": 25.1,
      "p10": 26,
      "p50": 27.9,
      "p90": 29.8,
      "p97": 30.7,
      "lms": {
        "L": 1,
        "M": 27.9,
        "S": 0.0525
      }
    }
  },
  {
    "age": 32,
    "weight": {
      "p3": 985,
      "p10": 1207,
      "p50": 1681,
      "p90": 2155,
      "p97": 2377,
      "lms": {
        "L": 1,
        "M": 1681,
        "S": 0.22
      }
    },
    "length": {
      "p3": 36.3,
      "p10": 37.9,
      "p50": 41.3,
      "p90": 44.7,
      "p97": 46.3,
      "lms": {
        "L": 1,
        "M": 41.3,
        "S": 0.0641
      }
    },
    "headCircumference": {
      "p3": 26,
      "p10": 26.9,
      "p50": 28.8,
      "p90": 30.7,
      "p97": 31.6,
      "lms": {
        "L": 1,
        "M": 28.8,
        "S": 0.0513
      }
    }
  },
  {
    "age": 33,
    "weight": {
      "p3": 1181,
      "p10": 1405,
      "p50": 1897,
      "p90": 2405,
      "p97": 2648,
      "lms": {
        "L": 0.88,
        "M": 1897,
        "S": 0.206
      }
    },
    "length": {
      "p3": 37.6,
      "p10": 39.2,
      "p50": 42.6,
      "p90": 46,
      "p97": 47.6,
      "lms": {
        "L": 1,
        "M": 42.6,
        "S": 0.0624
      }
    },
    "headCircumference": {
      "p3": 27,
      "p10": 27.9,
      "p50": 29.8,
      "p90": 31.7,
      "p97": 32.6,
      "lms": {
        "L": 1,
        "M": 29.8,
        "S": 0.0497
      }
    }
  },
  {
    "age": 34,
    "weight": {
      "p3": 1392,
      "p10": 1617,
      "p50": 2126,
      "p90": 2672,
      "p97": 2939,
      "lms": {
        "L": 0.72,
        "M": 2126,
        "S": 0.194
      }
    },
    "length": {
      "p3": 39,
      "p10": 40.6,
      "p50": 44,
      "p90": 47.4,
      "p97": 49,
      "lms": {
        "L": 1,
        "M": 44,
        "S": 0.0601
      }
    },
    "headCircumference": {
      "p3": 27.8,
      "p10": 28.7,
      "p50": 30.6,
      "p90": 32.5,
      "p97": 33.4,
      "lms": {
        "L": 1,
        "M": 30.6,
        "S": 0.0486
      }
    }
  },
  {
    "age": 35,
    "weight": {
      "p3": 1618,
      "p10": 1843,
      "p50": 2362,
      "p90": 2932,
      "p97": 3215,
      "lms": {
        "L": 0.6,
        "M": 2362,
        "S": 0.18
      }
    },
    "length": {
      "p3": 40.4,
      "p10": 42,
      "p50": 45.3,
      "p90": 48.6,
      "p97": 50.2,
      "lms": {
        "L": 1,
        "M": 45.3,
        "S": 0.0575
      }
    },
    "headCircumference": {
      "p3": 28.7,
      "p10": 29.6,
      "p50": 31.5,
      "p90": 33.4,
      "p97": 34.3,
      "lms": {
        "L": 1,
        "M": 31.5,
        "S": 0.0469
      }
    }
  },
  {
    "age": 36,
    "weight": {
      "p3": 1841,
      "p10": 2068,
      "p50": 2602,
      "p90": 3202,
      "p97": 3506,
      "lms": {
        "L": 0.46,
        "M": 2602,
        "S": 0.17
      }
    },
    "length": {
      "p3": 41.7,
      "p10": 43.2,
      "p50": 46.5,
      "p90": 49.8,
      "p97": 51.3,
      "lms": {
        "L": 1,
        "M": 46.5,
        "S": 0.0551
      }
    },
    "headCircumference": {
      "p3": 29.4,
      "p10": 30.3,
      "p50": 32.2,
      "p90": 34.1,
      "p97": 35,
      "lms": {
        "L": 1,
        "M": 32.2,
        "S": 0.0457
      }
    }
  },
  {
    "age": 37,
    "weight": {
      "p3": 2055,
      "p10": 2286,
      "p50": 2835,
      "p90": 3465,
      "p97": 3788,
      "lms": {
        "L": 0.34,
        "M": 2835,
        "S": 0.162
      }
    },
    "length": {
      "p3": 42.9,
      "p10": 44.4,
      "p50": 47.6,
      "p90": 50.8,
      "p97": 52.3,
      "lms": {
        "L": 1,
        "M": 47.6,
        "S": 0.0525
      }
    },
    "headCircumference": {
      "p3": 30.2,
      "p10": 31,
      "p50": 32.9,
      "p90": 34.8,
      "p97": 35.6,
      "lms": {
        "L": 1,
        "M": 32.9,
        "S": 0.0441
      }
    }
  },
  {
    "age": 38,
    "weight": {
      "p3": 2255,
      "p10": 2490,
      "p50": 3050,
      "p90": 3696,
      "p97": 4029,
      "lms": {
        "L": 0.28,
        "M": 3050,
        "S": 0.154
      }
    },
    "length": {
      "p3": 44,
      "p10": 45.5,
      "p50": 48.6,
      "p90": 51.7,
      "p97": 53.2,
      "lms": {
        "L": 1,
        "M": 48.6,
        "S": 0.0499
      }
    },
    "headCircumference": {
      "p3": 30.9,
      "p10": 31.8,
      "p50": 33.6,
      "p90": 35.4,
      "p97": 36.3,
      "lms": {
        "L": 1,
        "M": 33.6,
        "S": 0.0424
      }
    }
  },
  {
    "age": 39,
    "weight": {
      "p3": 2423,
      "p10": 2662,
      "p50": 3239,
      "p90": 3911,
      "p97": 4262,
      "lms": {
        "L": 0.2,
        "M": 3239,
        "S": 0.15
      }
    },
    "length": {
      "p3": 45.1,
      "p10": 46.5,
      "p50": 49.5,
      "p90": 52.5,
      "p97": 53.9,
      "lms": {
        "L": 1,
        "M": 49.5,
        "S": 0.0474
      }
    },
    "headCircumference": {
      "p3": 31.6,
      "p10": 32.4,
      "p50": 34.2,
      "p90": 36,
      "p97": 36.8,
      "lms": {
        "L": 1,
        "M": 34.2,
        "S": 0.0409
      }
    }
  },
  {
    "age": 40,
    "weight": {
      "p3": 2579,
      "p10": 2824,
      "p50": 3415,
      "p90": 4106,
      "p97": 4468,
      "lms": {
        "L": 0.16,
        "M": 3415,
        "S": 0.146
      }
    },
    "length": {
      "p3": 46.1,
      "p10": 47.5,
      "p50": 50.4,
      "p90": 53.3,
      "p97": 54.7,
      "lms": {
        "L": 1,
        "M": 50.4,
        "S": 0.0451
      }
    },
    "headCircumference": {
      "p3": 32.1,
      "p10": 32.9,
      "p50": 34.7,
      "p90": 36.5,
      "p97": 37.3,
      "lms": {
        "L": 1,
        "M": 34.7,
        "S": 0.0396
      }
    }
  },
  {
    "age": 42,
    "weight": {
      "p3": 2887,
      "p10": 3151,
      "p50": 3787,
      "p90": 4534,
      "p97": 4926,
      "lms": {
        "L": 0.12,
        "M": 3787,
        "S": 0.142
      }
    },
    "length": {
      "p3": 48,
      "p10": 49.3,
      "p50": 52.1,
      "p90": 54.9,
      "p97": 56.2,
      "lms": {
        "L": 1,
        "M": 52.1,
        "S": 0.0414
      }
    },
    "headCircumference": {
      "p3": 33.2,
      "p10": 34,
      "p50": 35.7,
      "p90": 37.4,
      "p97": 38.2,
      "lms": {
        "L": 1,
        "M": 35.7,
        "S": 0.0373
      }
    }
  },
  {
    "age": 44,
    "weight": {
      "p3": 3218,
      "p10": 3505,
      "p50": 4192,
      "p90": 4992,
      "p97": 5409,
      "lms": {
        "L": 0.14,
        "M": 4192,
        "S": 0.138
      }
    },
    "length": {
      "p3": 49.8,
      "p10": 51,
      "p50": 53.7,
      "p90": 56.4,
      "p97": 57.6,
      "lms": {
        "L": 1,
        "M": 53.7,
        "S": 0.0388
      }
    },
    "headCircumference": {
      "p3": 34.1,
      "p10": 34.8,
      "p50": 36.5,
      "p90": 38.2,
      "p97": 38.9,
      "lms": {
        "L": 1,
        "M": 36.5,
        "S": 0.0356
      }
    }
  },
  {
    "age": 46,
    "weight": {
      "p3": 3560,
      "p10": 3867,
      "p50": 4601,
      "p90": 5452,
      "p97": 5894,
      "lms": {
        "L": 0.14,
        "M": 4601,
        "S": 0.134
      }
    },
    "length": {
      "p3": 51.3,
      "p10": 52.5,
      "p50": 55.1,
      "p90": 57.7,
      "p97": 58.9,
      "lms": {
        "L": 1,
        "M": 55.1,
        "S": 0.037
      }
    },
    "headCircumference": {
      "p3": 34.9,
      "p10": 35.7,
      "p50": 37.3,
      "p90": 38.9,
      "p97": 39.7,
      "lms": {
        "L": 1,
        "M": 37.3,
        "S": 0.034
      }
    }
  },
  {
    "age": 48,
    "weight": {
      "p3": 3886,
      "p10": 4212,
      "p50": 4994,
      "p90": 5908,
      "p97": 6386,
      "lms": {
        "L": 0.08,
        "M": 4994,
        "S": 0.132
      }
    },
    "length": {
      "p3": 52.8,
      "p10": 54,
      "p50": 56.6,
      "p90": 59.2,
      "p97": 60.4,
      "lms": {
        "L": 1,
        "M": 56.6,
        "S": 0.0358
      }
    },
    "headCircumference": {
      "p3": 35.7,
      "p10": 36.4,
      "p50": 38,
      "p90": 39.6,
      "p97": 40.3,
      "lms": {
        "L": 1,
        "M": 38,
        "S": 0.0328
      }
    }
  },
  {
    "age": 50,
    "weight": {
      "p3": 4205,
      "p10": 4546,
      "p50": 5362,
      "p90": 6311,
      "p97": 6806,
      "lms": {
        "L": 0.08,
        "M": 5362,
        "S": 0.128
      }
    },
    "length": {
      "p3": 54.1,
      "p10": 55.3,
      "p50": 57.9,
      "p90": 60.5,
      "p97": 61.7,
      "lms": {
        "L": 1,
        "M": 57.9,
        "S": 0.0351
      }
    },
    "headCircumference": {
      "p3": 36.4,
      "p10": 37.1,
      "p50": 38.7,
      "p90": 40.3,
      "p97": 41,
      "lms": {
        "L": 1,
        "M": 38.7,
        "S": 0.0318
      }
    }
  }
];
