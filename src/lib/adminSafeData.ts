export type SafeAdminData<T> = {
  data: T;
  error: string | null;
};

export function toPlainData<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function safeAdminData<T>(label: string, loader: () => T, fallback: T): SafeAdminData<T> {
  try {
    return { data: toPlainData(loader()), error: null };
  } catch (error) {
    console.error(`[admin:${label}]`, error);
    return { data: toPlainData(fallback), error: `${label}: ${errorMessage(error)}` };
  }
}

export function collectAdminErrors(...results: Array<{ error: string | null }>) {
  return results.map((result) => result.error).filter((error): error is string => Boolean(error));
}
