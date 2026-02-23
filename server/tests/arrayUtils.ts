export function map(items: any[], changeItem: (item: any) => any): any[] {
  const mapped: any[] = [];

  for (let i = 0; i < items.length; i += 1) {
    mapped.push(changeItem(items[i]));
  }

  return mapped;
}

export function filter(items: any[], shouldKeep: (item: any) => boolean): any[] {
  const filtered: any[] = [];

  for (let i = 0; i < items.length; i += 1) {
    if (shouldKeep(items[i])) {
      filtered.push(items[i]);
    }
  }

  return filtered;
}
