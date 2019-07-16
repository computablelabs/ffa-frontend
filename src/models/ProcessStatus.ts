export enum ProcessStatus {
  NotReady = 0,
  Ready = 1,
  Executing = 2,
  Complete = 3,
  Error = 4,
}

export interface ProcessStatusLabelMap {
  [key: number]: string
}
