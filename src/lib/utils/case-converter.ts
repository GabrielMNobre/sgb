type AnyObject = Record<string, unknown>;

function isObject(obj: unknown): obj is AnyObject {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as T;
  }

  if (isObject(obj)) {
    const newObj: AnyObject = {};
    for (const key in obj) {
      const camelKey = toCamelCase(key);
      newObj[camelKey] = snakeToCamel(obj[key]);
    }
    return newObj as T;
  }

  return obj as T;
}

export function camelToSnake<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item)) as T;
  }

  if (isObject(obj)) {
    const newObj: AnyObject = {};
    for (const key in obj) {
      const snakeKey = toSnakeCase(key);
      newObj[snakeKey] = camelToSnake(obj[key]);
    }
    return newObj as T;
  }

  return obj as T;
}
