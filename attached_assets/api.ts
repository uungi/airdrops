/**
 * Helper function to make API requests
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  
  return res;
}

/**
 * Check Notion connection status
 */
export async function checkNotionStatus() {
  try {
    const res = await fetch('/api/notion/status');
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error checking Notion status:', error);
    throw error;
  }
}

/**
 * Get all Notion databases
 */
export async function getNotionDatabases() {
  try {
    const res = await fetch('/api/notion/databases');
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data.databases;
  } catch (error) {
    console.error('Error fetching Notion databases:', error);
    throw error;
  }
}

/**
 * Setup Airdrops database in Notion
 */
export async function setupNotionDatabase() {
  try {
    const res = await apiRequest('POST', '/api/notion/setup', {});
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error setting up Notion database:', error);
    throw error;
  }
}

/**
 * Add sample airdrops to Notion database
 */
export async function addSampleAirdrops() {
  try {
    const res = await apiRequest('POST', '/api/notion/sample-data', {});
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding sample airdrops:', error);
    throw error;
  }
}

/**
 * Get all airdrops
 */
export async function getAirdrops() {
  try {
    const res = await fetch('/api/airdrops');
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data.airdrops;
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    throw error;
  }
}

/**
 * Get featured airdrops
 */
export async function getFeaturedAirdrops() {
  try {
    const res = await fetch('/api/airdrops/featured');
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data.airdrops;
  } catch (error) {
    console.error('Error fetching featured airdrops:', error);
    throw error;
  }
}
