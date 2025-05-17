import { Client } from "@notionhq/client";
import { Airdrop } from "@shared/schema";

// Initialize Notion client
export const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
  const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }

  throw Error("Failed to extract page ID from Notion page URL");
}

export const NOTION_PAGE_ID = process.env.NOTION_PAGE_URL 
  ? extractPageIdFromUrl(process.env.NOTION_PAGE_URL)
  : "";

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
  // Array to store the child databases
  const childDatabases = [];

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
        if (block.type === "child_database") {
          const databaseId = block.id;

          // Retrieve the database title
          try {
            const databaseInfo = await notion.databases.retrieve({
              database_id: databaseId,
            });

            // Add the database to our list
            childDatabases.push(databaseInfo);
          } catch (error) {
            console.error(`Error retrieving database ${databaseId}:`, error);
          }
        }
      }

      // Check if there are more results to fetch
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return childDatabases;
  } catch (error) {
    console.error("Error listing child databases:", error);
    throw error;
  }
}

// Find a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
  const databases = await getNotionDatabases();

  for (const db of databases) {
    if (db.title && Array.isArray(db.title) && db.title.length > 0) {
      const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
      if (dbTitle === title.toLowerCase()) {
        return db;
      }
    }
  }

  return null;
}

// Create the Airdrops database if it doesn't exist
export async function createAirdropsDatabase() {
  const existingDb = await findDatabaseByTitle("Airdrops");
  if (existingDb) {
    return existingDb;
  }

  // Create the database with properties for airdrops
  return await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: NOTION_PAGE_ID
    },
    title: [
      {
        type: "text",
        text: {
          content: "Airdrops"
        }
      }
    ],
    properties: {
      Name: {
        title: {}
      },
      Description: {
        rich_text: {}
      },
      Status: {
        select: {
          options: [
            { name: "Active", color: "green" },
            { name: "Upcoming", color: "yellow" },
            { name: "Ended", color: "red" }
          ]
        }
      },
      Platform: {
        select: {
          options: [
            { name: "Ethereum", color: "blue" },
            { name: "Solana", color: "purple" },
            { name: "BSC", color: "yellow" },
            { name: "Polygon", color: "green" },
            { name: "Arbitrum", color: "pink" },
            { name: "Optimism", color: "red" },
            { name: "Other", color: "gray" }
          ]
        }
      },
      EstimatedValue: {
        rich_text: {}
      },
      StartDate: {
        date: {}
      },
      EndDate: {
        date: {}
      },
      Featured: {
        checkbox: {}
      },
      ImageUrl: {
        url: {}
      },
      ProjectUrl: {
        url: {}
      }
    }
  });
}

// Get airdrops from Notion database
export async function getAirdropsFromNotion(featuredOnly: boolean = false): Promise<Airdrop[]> {
  try {
    const airdropsDb = await findDatabaseByTitle("Airdrops");
    
    if (!airdropsDb) {
      return [];
    }

    const filter = featuredOnly 
      ? {
          property: "Featured",
          checkbox: {
            equals: true
          }
        }
      : undefined;

    const response = await notion.databases.query({
      database_id: airdropsDb.id,
      filter: filter
    });

    return response.results.map((page: any) => {
      const properties = page.properties;
      
      // Calculate the timing based on start/end dates
      const startDate = properties.StartDate?.date?.start 
        ? new Date(properties.StartDate.date.start) 
        : null;
        
      const endDate = properties.EndDate?.date?.start 
        ? new Date(properties.EndDate.date.start) 
        : null;
        
      const now = new Date();
      
      let timing = "Unknown";
      if (startDate && startDate > now) {
        const days = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        timing = `Starts in ${days} day${days !== 1 ? 's' : ''}`;
      } else if (endDate && endDate > now) {
        const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        timing = `Ends in ${days} day${days !== 1 ? 's' : ''}`;
      } else if (endDate && endDate <= now) {
        timing = "Ended";
      }

      return {
        id: page.id,
        notionId: page.id,
        name: properties.Name?.title?.[0]?.plain_text || "Untitled Airdrop",
        description: properties.Description?.rich_text?.[0]?.plain_text || "",
        status: properties.Status?.select?.name || "Upcoming",
        platform: properties.Platform?.select?.name || "Other",
        estimatedValue: properties.EstimatedValue?.rich_text?.[0]?.plain_text || "Unknown",
        startDate: startDate,
        endDate: endDate,
        timing: timing,
        imageUrl: properties.ImageUrl?.url || "",
        projectUrl: properties.ProjectUrl?.url || "",
        featured: properties.Featured?.checkbox || false,
        createdAt: new Date(page.created_time),
        updatedAt: new Date(page.last_edited_time)
      };
    });
  } catch (error) {
    console.error("Error fetching airdrops from Notion:", error);
    throw new Error("Failed to fetch airdrops from Notion");
  }
}

// Add sample airdrop data to the Notion database
export async function addSampleAirdrops() {
  try {
    const airdropsDb = await findDatabaseByTitle("Airdrops");
    
    if (!airdropsDb) {
      throw new Error("Airdrops database not found");
    }

    const sampleAirdrops = [
      {
        name: "Ethereum Protocol",
        description: "New L2 solution for Ethereum with major token incentives for early adopters. Complete simple tasks to qualify.",
        status: "Active",
        platform: "Ethereum",
        estimatedValue: "$500-$1000",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        projectUrl: "https://example.com/ethereum-protocol"
      },
      {
        name: "Solana DeFi Platform",
        description: "Next-gen DeFi platform launching on Solana with massive airdrop for early users. Join waitlist now!",
        status: "Upcoming",
        platform: "Solana",
        estimatedValue: "$200-$800",
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        projectUrl: "https://example.com/solana-defi"
      },
      {
        name: "BSC Gaming Project",
        description: "Revolutionary Play-to-Earn game launching on BSC with token airdrop for beta testers and community members.",
        status: "Active",
        platform: "BSC",
        estimatedValue: "$100-$500",
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        featured: true,
        imageUrl: "https://pixabay.com/get/g86a4d9955550a2d26ee5a6f1a5632bcd0b534f341280b54500b5f315e942d9d7597725386811032deb55c91acefe26b287468307f2f0d90537c967195f040f7b_1280.jpg",
        projectUrl: "https://example.com/bsc-gaming"
      },
      {
        name: "Layer3 Protocol",
        description: "New cross-chain bridge solution with airdrop for early adopters. Complete simple tasks to qualify for the airdrop.",
        status: "Active",
        platform: "Ethereum",
        estimatedValue: "$300-$600",
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        projectUrl: "https://example.com/layer3"
      },
      {
        name: "NFT Marketplace",
        description: "Revolutionary NFT marketplace with governance token airdrop for early users and creators.",
        status: "Upcoming",
        platform: "Polygon",
        estimatedValue: "$150-$400",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        projectUrl: "https://example.com/nft-marketplace"
      }
    ];

    for (const airdrop of sampleAirdrops) {
      await notion.pages.create({
        parent: {
          database_id: airdropsDb.id
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: airdrop.name
                }
              }
            ]
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: airdrop.description
                }
              }
            ]
          },
          Status: {
            select: {
              name: airdrop.status
            }
          },
          Platform: {
            select: {
              name: airdrop.platform
            }
          },
          EstimatedValue: {
            rich_text: [
              {
                text: {
                  content: airdrop.estimatedValue
                }
              }
            ]
          },
          StartDate: {
            date: {
              start: airdrop.startDate.toISOString().split('T')[0]
            }
          },
          EndDate: {
            date: {
              start: airdrop.endDate.toISOString().split('T')[0]
            }
          },
          Featured: {
            checkbox: airdrop.featured
          },
          ImageUrl: {
            url: airdrop.imageUrl
          },
          ProjectUrl: {
            url: airdrop.projectUrl
          }
        }
      });
    }

    return sampleAirdrops.length;
  } catch (error) {
    console.error("Error adding sample airdrops:", error);
    throw error;
  }
}
