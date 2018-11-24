export type Manifest<T> = {
  ModelName: string;
  IterationVersion: number;
  InsertRoot: string;
  Entries: Record<string,Record<string, T>>;
}
