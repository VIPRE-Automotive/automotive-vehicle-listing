export interface Vehicle {
  StockNum: string,
  Sold: boolean,
  ModelYear: number,
  Make: string,
  Model: string,
  Trim: string | null,
  Transmission: "Automatic" | "Manual" | null,
  Drivetrain: Drivetrains | null,
  Price: string, // To avoid floating point errors, we store the price as a string
  MSRP: string, // To avoid floating point errors, we store the price as a string
  VIN: string,
  IntColor: string[],
  ExtColor: string[],
  Owners: number,
  EPA: EpaRating,
  Odometer: number,
}

export enum Drivetrains {
  AWD = "AWD",
  FWD = "FWD",
  RWD = "RWD",
}

export interface EpaRating {
  City: number;
  Highway: number;
}

export interface Metadata {
  Makes: MetadataMake[];
  ModelYears: MetadataYear[];
}

export interface MetadataMake {
  [make: string]: number;
}

export interface MetadataYear {
  [year: string]: number;
}
