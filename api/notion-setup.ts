import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from "@notionhq/client";

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
  const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }

  throw Error("Failed to extract page ID from Notion page URL");
}

const NOTION_PAGE_ID = process.env.NOTION_PAGE_URL 
  ? extractPageIdFromUrl(process.env.NOTION_PAGE_URL)
  : "";

/**
 * Find a Notion database with the matching title
 */
async function findDatabaseByTitle(title: string) {
  try {
    // Query all child blocks in the specified page
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: NOTION_PAGE_ID,
        start_cursor: startCursor,
      });

      // Process the results
      for (const block of response.results) {
        // Check if the block is a child database
        if ('type' in block && block.type === "child_database") {
          const databaseId = block.id;

          // Retrieve the database title
          try {
            const databaseInfo = await notion.databases.retrieve({
              database_id: databaseId,
            });

            // Check if the title matches
            const dbTitle = databaseInfo.title && 
                           Array.isArray(databaseInfo.title) && 
                           databaseInfo.title.length > 0 && 
                           databaseInfo.title[0]?.plain_text;
            
            if (dbTitle && dbTitle.toLowerCase() === title.toLowerCase()) {
              return databaseInfo;
            }
          } catch (error) {
            console.error(`Error retrieving database ${databaseId}:`, error);
          }
        }
      }

      // Check if there are more results to fetch
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return null;
  } catch (error) {
    console.error("Error finding database by title:", error);
    throw error;
  }
}

/**
 * Create a database if one with the given title doesn't exist
 */
async function createDatabaseIfNotExists(title: string, properties: any) {
  try {
    // Check if the database already exists
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
      return {
        success: true,
        message: `Database "${title}" already exists.`,
        database: existingDb
      };
    }

    // Create the database
    const newDb = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: NOTION_PAGE_ID
      },
      title: [
        {
          type: "text",
          text: {
            content: title
          }
        }
      ],
      properties: properties
    });

    return {
      success: true,
      message: `Database "${title}" has been created.`,
      database: newDb
    };
  } catch (error) {
    console.error(`Error creating database "${title}":`, error);
    throw error;
  }
}

/**
 * Set up the Airdrops database in Notion
 */
async function createAirdropsDatabase() {
  return await createDatabaseIfNotExists("Airdrops", {
    Name: {
      title: {}
    },
    Description: {
      rich_text: {}
    },
    Status: {
      select: {
        options: [
          { name: "Live", color: "green" },
          { name: "Upcoming", color: "blue" },
          { name: "Completed", color: "gray" },
          { name: "Rumored", color: "orange" }
        ]
      }
    },
    TokenSymbol: {
      rich_text: {}
    },
    Featured: {
      checkbox: {}
    },
    EndDate: {
      date: {}
    },
    ReleaseDate: {
      date: {}
    },
    Requirements: {
      rich_text: {}
    },
    ProjectURL: {
      url: {}
    },
    Category: {
      select: {
        options: [
          { name: "Layer 1", color: "red" },
          { name: "Layer 2", color: "blue" },
          { name: "DeFi", color: "green" },
          { name: "NFT", color: "yellow" },
          { name: "Gaming", color: "purple" },
          { name: "Interoperability", color: "orange" },
          { name: "Infrastructure", color: "gray" },
          { name: "Modular Blockchain", color: "pink" },
          { name: "Other", color: "default" }
        ]
      }
    },
    LogoURL: {
      url: {}
    },
    PotentialValue: {
      rich_text: {}
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const database = await createAirdropsDatabase();
    return res.json({ success: true, database });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}