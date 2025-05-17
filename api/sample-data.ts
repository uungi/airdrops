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
 * Add sample airdrops to the Notion database
 */
async function addSampleAirdrops() {
  try {
    // Find the Airdrops database
    const db = await findDatabaseByTitle("Airdrops");
    
    if (!db) {
      throw new Error("Airdrops database not found. Please set up the database first.");
    }

    const sampleAirdrops = [
      {
        Name: "Arbitrum",
        Description: "Arbitrum is a Layer 2 scaling solution for Ethereum that enables low-cost, high-throughput transactions.",
        Status: "Live",
        TokenSymbol: "ARB",
        Featured: true,
        EndDate: new Date("2023-06-30"),
        ReleaseDate: new Date("2023-03-23"),
        Requirements: "Users needed to have used Arbitrum before the snapshot date.",
        ProjectURL: "https://arbitrum.io/",
        Category: "Layer 2",
        LogoURL: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
        PotentialValue: "High"
      },
      {
        Name: "Optimism",
        Description: "Optimism is an Ethereum Layer 2 scaling solution that aims to reduce transaction fees and increase throughput.",
        Status: "Completed",
        TokenSymbol: "OP",
        Featured: true,
        EndDate: new Date("2022-06-01"),
        ReleaseDate: new Date("2022-05-31"),
        Requirements: "Early users, GitHub contributors, and DAO members.",
        ProjectURL: "https://www.optimism.io/",
        Category: "Layer 2",
        LogoURL: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
        PotentialValue: "Medium"
      },
      {
        Name: "Celestia",
        Description: "Celestia is a modular blockchain network designed to scale with minimal hardware requirements.",
        Status: "Upcoming",
        TokenSymbol: "TIA",
        Featured: true,
        EndDate: new Date("2023-12-15"),
        ReleaseDate: new Date("2023-12-30"),
        Requirements: "Participate in testnet activities and community contributions.",
        ProjectURL: "https://celestia.org/",
        Category: "Modular Blockchain",
        LogoURL: "https://cryptologos.cc/logos/celestia-tia-logo.png",
        PotentialValue: "High"
      },
      {
        Name: "LayerZero",
        Description: "LayerZero is an omnichain interoperability protocol designed for lightweight cross-chain messaging.",
        Status: "Rumored",
        TokenSymbol: "ZRO",
        Featured: false,
        EndDate: null,
        ReleaseDate: null,
        Requirements: "Expected to reward users of protocols built on LayerZero.",
        ProjectURL: "https://layerzero.network/",
        Category: "Interoperability",
        LogoURL: "https://cryptologos.cc/logos/layerzero-logo.png",
        PotentialValue: "Very High"
      },
      {
        Name: "Starknet",
        Description: "Starknet is a permissionless decentralized ZK-Rollup operating as an L2 network over Ethereum.",
        Status: "Upcoming",
        TokenSymbol: "STRK",
        Featured: true,
        EndDate: new Date("2023-12-01"),
        ReleaseDate: new Date("2024-01-15"),
        Requirements: "Users who have interacted with Starknet or its ecosystem.",
        ProjectURL: "https://starknet.io/",
        Category: "Layer 2",
        LogoURL: "https://cryptologos.cc/logos/starknet-strk-logo.png",
        PotentialValue: "High"
      }
    ];

    for (const airdrop of sampleAirdrops) {
      // Check if the airdrop already exists
      const query = await notion.databases.query({
        database_id: db.id,
        filter: {
          property: "Name",
          title: {
            equals: airdrop.Name
          }
        }
      });

      if (query.results.length === 0) {
        // Create airdrop
        await notion.pages.create({
          parent: {
            database_id: db.id
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: airdrop.Name
                  }
                }
              ]
            },
            Description: {
              rich_text: [
                {
                  text: {
                    content: airdrop.Description
                  }
                }
              ]
            },
            Status: {
              select: {
                name: airdrop.Status
              }
            },
            TokenSymbol: {
              rich_text: [
                {
                  text: {
                    content: airdrop.TokenSymbol
                  }
                }
              ]
            },
            Featured: {
              checkbox: airdrop.Featured
            },
            EndDate: airdrop.EndDate ? {
              date: {
                start: airdrop.EndDate.toISOString().split('T')[0]
              }
            } : null,
            ReleaseDate: airdrop.ReleaseDate ? {
              date: {
                start: airdrop.ReleaseDate.toISOString().split('T')[0]
              }
            } : null,
            Requirements: {
              rich_text: [
                {
                  text: {
                    content: airdrop.Requirements
                  }
                }
              ]
            },
            ProjectURL: {
              url: airdrop.ProjectURL
            },
            Category: {
              select: {
                name: airdrop.Category
              }
            },
            LogoURL: {
              url: airdrop.LogoURL
            },
            PotentialValue: {
              rich_text: [
                {
                  text: {
                    content: airdrop.PotentialValue
                  }
                }
              ]
            }
          }
        });
      }
    }

    return { success: true, message: `${sampleAirdrops.length} sample airdrops have been created.` };
  } catch (error) {
    console.error("Error adding sample airdrops:", error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await addSampleAirdrops();
    return res.json({ 
      success: true, 
      message: "Sample airdrops have been added to your Notion database" 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}