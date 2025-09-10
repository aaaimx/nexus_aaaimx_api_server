export abstract class BaseFactory {
  private static singletons: Map<string, any> = new Map();

  protected static getSingleton<T>(key: string, factory: () => T): T {
    if (!this.singletons.has(key)) {
      this.singletons.set(key, factory());
    }
    return this.singletons.get(key);
  }

  protected static clearSingletons(): void {
    this.singletons.clear();
  }
}
