/**
 * Manage saved MCP endpoints (like Postman collections)
 */

export interface SavedEndpoint {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  lastUsed?: number;
}

const STORAGE_KEY = "mcp_saved_endpoints";

export class EndpointStorage {
  /**
   * Get all saved endpoints
   */
  static getAll(): SavedEndpoint[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load saved endpoints:", error);
      return [];
    }
  }

  /**
   * Save a new endpoint
   */
  static save(name: string, url: string): SavedEndpoint {
    const endpoints = this.getAll();

    // Check if URL already exists
    const existing = endpoints.find((e) => e.url === url);
    if (existing) {
      // Update existing
      existing.name = name;
      existing.lastUsed = Date.now();
      this.saveAll(endpoints);
      return existing;
    }

    // Create new
    const newEndpoint: SavedEndpoint = {
      id: crypto.randomUUID(),
      name,
      url,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    endpoints.push(newEndpoint);
    this.saveAll(endpoints);
    return newEndpoint;
  }

  /**
   * Delete an endpoint
   */
  static delete(id: string): void {
    const endpoints = this.getAll().filter((e) => e.id !== id);
    this.saveAll(endpoints);
  }

  /**
   * Update last used timestamp
   */
  static markAsUsed(url: string): void {
    const endpoints = this.getAll();
    const endpoint = endpoints.find((e) => e.url === url);
    if (endpoint) {
      endpoint.lastUsed = Date.now();
      this.saveAll(endpoints);
    }
  }

  /**
   * Get a specific endpoint by ID
   */
  static getById(id: string): SavedEndpoint | undefined {
    return this.getAll().find((e) => e.id === id);
  }

  /**
   * Save all endpoints to localStorage
   */
  private static saveAll(endpoints: SavedEndpoint[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
    } catch (error) {
      console.error("Failed to save endpoints:", error);
    }
  }

  /**
   * Clear all saved endpoints
   */
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
