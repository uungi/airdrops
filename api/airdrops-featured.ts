import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from "@notionhq/client";
import { z } from "zod";

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

// Define the airdrop schema for validation
const airdropSchema = z.object({
  id: z.number(),
  notionId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string(),
  tokenSymbol: z.string(),
  featured: z.boolean().default(false),
  endDate: z.date().nullable().optional(),
  releaseDate: z.date().nullable().optional(),
  requirements: z.string().optional(),
  projectUrl: z.string().url().optional(),
  category: z.string().optional(),
  logoUrl: z.string().url().optional(),
  potentialValue: z.string().optional()
});

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

async function getAirdropsFromNotion(featuredOnly: boolean = false) {
  try {
    // Find the Airdrops database
    const db = await findDatabaseByTitle("Airdrops");
    
    if (!db) {
      throw new Error("Airdrops database not found. Please set up the database first.");
    }

    // Query the database
    const response = await notion.databases.query({
      database_id: db.id,
      filter: featuredOnly ? {
        property: "Featured",
        checkbox: {
          equals: true
        }
      } : undefined,
    });

    // Map the results to our schema
    const airdrops = response.results.map((page: any, index: number) => {
      const properties = page.properties;
      
      // Parse dates
      const endDate = properties.EndDate?.date?.start 
        ? new Date(properties.EndDate.date.start) 
        : null;
      
      const releaseDate = properties.ReleaseDate?.date?.start 
        ? new Date(properties.ReleaseDate.date.start) 
        : null;

      return {
        id: index,
        notionId: page.id,
        name: properties.Name?.title?.[0]?.plain_text || "Unnamed Airdrop",
        description: properties.Description?.rich_text?.[0]?.plain_text || "",
        status: properties.Status?.select?.name || "Unknown",
        tokenSymbol: properties.TokenSymbol?.rich_text?.[0]?.plain_text || "",
        featured: properties.Featured?.checkbox || false,
        endDate,
        releaseDate,
        requirements: properties.Requirements?.rich_text?.[0]?.plain_text || "",
        projectUrl: properties.ProjectURL?.url || "",
        category: properties.Category?.select?.name || "Other",
        logoUrl: properties.LogoURL?.url || "",
        potentialValue: properties.PotentialValue?.rich_text?.[0]?.plain_text || ""
      };
    });

    return airdrops;
  } catch (error) {
    console.error("Error fetching airdrops:", error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const airdrops = await getAirdropsFromNotion(true);
    return res.json({ airdrops });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}