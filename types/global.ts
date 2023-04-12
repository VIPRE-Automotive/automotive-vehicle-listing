export interface Vehicle {
  StockNum: string,
  Sold: boolean,
  ModelYear: number,
  Make: string,
  Model: string,
  Trim: string | null,
  Engine?: string, // TODO: implement this
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
  BodyStyle?: BodyStyle, // TODO: implement this
  Options?: string[],
  Condition?: Conditions,
  FuelType?: FuelTypes,
}

export enum Drivetrains {
  AWD = "AWD",
  FWD = "FWD",
  RWD = "RWD",
  "4WD" = "4WD",
}

export interface EpaRating {
  City: number;
  Highway: number;
}

export enum BodyStyle {
  Coupe = "Coupe",
  Convertible = "Convertible",
  Crossover = "Crossover",
  Hatchback = "Hatchback",
  Sedan = "Sedan",
  SUV = "SUV",
  Truck = "Truck",
  Van = "Van",
  Minivan = "Minivan",
  Wagon = "Wagon",
}

export enum Conditions {
  New = "New",
  Used = "Used",
}

export enum FuelTypes {
  Gasoline = "Gasoline",
  Diesel = "Diesel",
  Hybrid = "Hybrid",
  Electric = "Electric",
  Hydrogen = "Hydrogen",
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
