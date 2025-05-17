import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET || "",
});

// Extract the page ID from the Notion page URL
export function extractPageIdFromUrl(pageUrl: string): string {
    if (!pageUrl) {
        throw new Error("Notion page URL is not defined");
    }
    
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw new Error("Failed to extract page ID from URL: " + pageUrl);
}

// Get the Notion page ID from environment variable
export const getNotionPageId = (): string => {
    const pageUrl = process.env.NOTION_PAGE_URL;
    if (!pageUrl) {
        throw new Error("NOTION_PAGE_URL environment variable is not set");
    }
    
    try {
        return extractPageIdFromUrl(pageUrl);
    } catch (error) {
        console.error("Error extracting Notion page ID:", error);
        throw error;
    }
};

/**
 * Check Notion connection status
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
export async function checkNotionConnection(): Promise<{connected: boolean, error?: string}> {
    try {
        if (!process.env.NOTION_INTEGRATION_SECRET) {
            return { 
                connected: false,
                error: "NOTION_INTEGRATION_SECRET environment variable is not set" 
            };
        }

        if (!process.env.NOTION_PAGE_URL) {
            return { 
                connected: false,
                error: "NOTION_PAGE_URL environment variable is not set" 
            };
        }

        // Test connection by listing users
        await notion.users.list({});
        
        // Try to access the specified page
        const pageId = getNotionPageId();
        await notion.pages.retrieve({ page_id: pageId });
        
        return { connected: true };
    } catch (error: any) {
        console.error("Error checking Notion connection:", error);
        return { 
            connected: false, 
            error: error.message || "An error occurred while connecting to Notion" 
        };
    }
}

/**
 * Lists all child databases contained within the root page
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
    const pageId = getNotionPageId();
    const childDatabases = [];

    try {
        // Query all child blocks in the specified page
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: pageId,
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

                        // Add the database to our list
                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
                }
            }

            // Check if there are more results to fetch
            hasMore = response.has_more;
            startCursor = response.next_cursor as string || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

/**
 * Find a Notion database with the matching title
 * @param title The title of the database to find
 * @returns The database object or null if not found
 */
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        // Check if the database has a title property
        if ('title' in db && db.title) {
            const titleObj = db.title as any;
            // Check if the title is an array and has at least one element
            if (Array.isArray(titleObj) && titleObj.length > 0) {
                const dbTitle = titleObj[0]?.plain_text?.toLowerCase() || "";
                if (dbTitle === title.toLowerCase()) {
                    return db;
                }
            }
        }
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any) {
    try {
        const existingDb = await findDatabaseByTitle(title);
        if (existingDb) {
            return existingDb;
        }
        
        const pageId = getNotionPageId();
        return await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: pageId
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: title
                    }
                }
            ],
            properties
        });
    } catch (error) {
        console.error(`Error creating database "${title}":`, error);
        throw error;
    }
}

/**
 * Setup Airdrops database in Notion
 */
export async function setupAirdropsDatabase() {
    try {
        const db = await createDatabaseIfNotExists("Airdrops", {
            Name: {
                title: {}
            },
            Description: {
                rich_text: {}
            },
            Platform: {
                select: {
                    options: [
                        { name: "Ethereum", color: "blue" },
                        { name: "Solana", color: "green" },
                        { name: "Binance", color: "yellow" },
                        { name: "Avalanche", color: "orange" },
                        { name: "Polygon", color: "purple" },
                        { name: "Other", color: "gray" }
                    ]
                }
            },
            Category: {
                select: {
                    options: [
                        { name: "Layer 2 Solution", color: "blue" },
                        { name: "DeFi Aggregator", color: "green" },
                        { name: "DEX Platform", color: "yellow" },
                        { name: "AI Trading Bot", color: "orange" },
                        { name: "Climate Tech", color: "purple" },
                        { name: "Other", color: "gray" }
                    ]
                }
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
            EstimatedValue: {
                rich_text: {}
            },
            Timing: {
                rich_text: {}
            },
            ImageURL: {
                url: {}
            },
            Featured: {
                checkbox: {}
            },
            Website: {
                url: {}
            },
            Requirements: {
                rich_text: {}
            },
            Steps: {
                rich_text: {}
            },
            CreatedAt: {
                date: {}
            }
        });
        
        return db;
    } catch (error) {
        console.error("Error setting up Airdrops database:", error);
        throw error;
    }
}

/**
 * Add sample airdrops data to the database
 */
export async function addSampleAirdrops() {
    try {
        const db = await findDatabaseByTitle("Airdrops");
        if (!db) {
            throw new Error("Airdrops database not found");
        }
        
        const sampleAirdrops = [
            {
                Name: "NexusChain Airdrop",
                Description: "Join the revolution of decentralized data storage and earn NXS tokens for early participation.",
                Platform: "Ethereum",
                Category: "Layer 2 Solution",
                Status: "Active",
                EstimatedValue: "$200 - $500",
                Timing: "3 days",
                ImageURL: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
                Featured: true,
                Website: "https://example.com/nexuschain",
                Requirements: "ETH wallet address, Twitter follow and retweet, Join Discord server, Complete KYC verification",
                Steps: "Connect your ETH wallet, Complete social media tasks, Join the official Discord and verify, Submit your application",
                CreatedAt: new Date().toISOString()
            },
            {
                Name: "SolForge Airdrop",
                Description: "The next generation DeFi platform offering early user rewards through their FORGE token distribution.",
                Platform: "Solana",
                Category: "DeFi Aggregator",
                Status: "Active",
                EstimatedValue: "$300 - $800",
                Timing: "5 days",
                ImageURL: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
                Featured: true,
                Website: "https://example.com/solforge",
                Requirements: "Solana wallet address, Minimum 0.1 SOL in wallet, Twitter engagement, Telegram group membership",
                Steps: "Connect your Solana wallet, Complete social tasks, Join the community channels, Register for testnet participation",
                CreatedAt: new Date().toISOString()
            },
            {
                Name: "BinanceX Airdrop",
                Description: "Pre-register for the upcoming BinanceX protocol launch and secure your allocation of BXP tokens.",
                Platform: "Binance",
                Category: "DEX Platform",
                Status: "Upcoming",
                EstimatedValue: "$500 - $1,200",
                Timing: "2 days",
                ImageURL: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
                Featured: true,
                Website: "https://example.com/binancex",
                Requirements: "BNB Chain wallet address, Complete social media tasks, Hold minimum BNB tokens, Complete quiz about the project",
                Steps: "Connect your BNB Chain wallet, Follow social media accounts, Complete the knowledge quiz, Submit application",
                CreatedAt: new Date().toISOString()
            }
        ];
        
        for (const airdrop of sampleAirdrops) {
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
                    Platform: {
                        select: {
                            name: airdrop.Platform
                        }
                    },
                    Category: {
                        select: {
                            name: airdrop.Category
                        }
                    },
                    Status: {
                        select: {
                            name: airdrop.Status
                        }
                    },
                    EstimatedValue: {
                        rich_text: [
                            {
                                text: {
                                    content: airdrop.EstimatedValue
                                }
                            }
                        ]
                    },
                    Timing: {
                        rich_text: [
                            {
                                text: {
                                    content: airdrop.Timing
                                }
                            }
                        ]
                    },
                    ImageURL: {
                        url: airdrop.ImageURL
                    },
                    Featured: {
                        checkbox: airdrop.Featured
                    },
                    Website: {
                        url: airdrop.Website
                    },
                    Requirements: {
                        rich_text: [
                            {
                                text: {
                                    content: airdrop.Requirements
                                }
                            }
                        ]
                    },
                    Steps: {
                        rich_text: [
                            {
                                text: {
                                    content: airdrop.Steps
                                }
                            }
                        ]
                    },
                    CreatedAt: {
                        date: {
                            start: airdrop.CreatedAt
                        }
                    }
                }
            });
        }
        
        return { success: true, count: sampleAirdrops.length };
    } catch (error) {
        console.error("Error adding sample airdrops:", error);
        throw error;
    }
}

/**
 * Get all airdrops from the Notion database
 */
export async function getAirdrops() {
    try {
        const db = await findDatabaseByTitle("Airdrops");
        if (!db) {
            throw new Error("Airdrops database not found");
        }
        
        const response = await notion.databases.query({
            database_id: db.id,
        });
        
        return response.results.map((page: any) => {
            const properties = page.properties;
            
            // Extract requirements and steps as arrays
            const requirementsText = properties.Requirements?.rich_text?.[0]?.plain_text || "";
            const stepsText = properties.Steps?.rich_text?.[0]?.plain_text || "";
            
            const requirements = requirementsText.split(',').map((item: string) => item.trim());
            const steps = stepsText.split(',').map((item: string) => item.trim());
            
            return {
                id: page.id,
                name: properties.Name?.title?.[0]?.plain_text || "Untitled Airdrop",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                platform: properties.Platform?.select?.name || "Other",
                category: properties.Category?.select?.name || "Other",
                status: properties.Status?.select?.name || "Active",
                estimatedValue: properties.EstimatedValue?.rich_text?.[0]?.plain_text || "",
                timing: properties.Timing?.rich_text?.[0]?.plain_text || "",
                imageUrl: properties.ImageURL?.url || "",
                featured: properties.Featured?.checkbox || false,
                website: properties.Website?.url || "",
                requirements,
                steps,
                createdAt: properties.CreatedAt?.date?.start || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error("Error getting airdrops:", error);
        throw error;
    }
}

/**
 * Get featured airdrops
 */
export async function getFeaturedAirdrops() {
    try {
        const airdrops = await getAirdrops();
        return airdrops.filter(airdrop => airdrop.featured);
    } catch (error) {
        console.error("Error getting featured airdrops:", error);
        throw error;
    }
}
