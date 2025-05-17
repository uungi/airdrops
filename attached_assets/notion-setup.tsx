import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { NotionConnectionStatus, NotionDatabase } from "@shared/schema";
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Database, 
  RefreshCw, 
  ExternalLink, 
  Home,
  Info,
  CheckCheck,
  Play,
  FileJson,
  PlusCircle
} from "lucide-react";

export default function NotionSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [initialLoad, setInitialLoad] = useState(true);

  // Query to check Notion connection status
  const statusQuery = useQuery<NotionConnectionStatus>({
    queryKey: ['/api/notion/status'],
    refetchInterval: false,
  });

  // Query to get Notion databases
  const databasesQuery = useQuery<{ databases: NotionDatabase[] }>({
    queryKey: ['/api/notion/databases'],
    enabled: statusQuery.data?.notion_connected === true,
  });

  // Mutation to set up Notion database
  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notion/setup', {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Database created successfully",
        description: "The Airdrops database has been set up in your Notion workspace.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/databases'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create database",
        description: error.message || "An error occurred while setting up the database.",
        variant: "destructive",
      });
    }
  });

  // Mutation to add sample data
  const sampleDataMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notion/sample-data', {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sample data added",
        description: data.message || "Sample airdrops have been added to your Notion database.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add sample data",
        description: error.message || "An error occurred while adding sample data.",
        variant: "destructive",
      });
    }
  });

  // Refresh connection status
  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/notion/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notion/databases'] });
  };

  // Test CORS configuration
  const testCors = async () => {
    try {
      const res = await fetch('/api/notion/test-cors');
      const data = await res.json();
      
      toast({
        title: "CORS Test Result",
        description: data.success 
          ? "CORS configuration is working correctly" 
          : "CORS configuration issue detected",
        variant: data.success ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "CORS Test Failed",
        description: error.message || "An error occurred during the CORS test",
        variant: "destructive",
      });
    }
  };

  // Check if airdrops database exists
  const hasAirdropsDatabase = () => {
    if (!databasesQuery.data?.databases) return false;
    
    return databasesQuery.data.databases.some(db => {
      // Check if the database has a title property
      if ('title' in db && db.title) {
        const titleObj = db.title as any;
        // Check if the title is an array and has at least one element
        if (Array.isArray(titleObj) && titleObj.length > 0) {
          const dbTitle = titleObj[0]?.plain_text?.toLowerCase() || "";
          return dbTitle === "airdrops";
        }
      }
      return false;
    });
  };

  // Update page title
  useEffect(() => {
    document.title = "Notion CMS Setup - Airdrops Hunter";
  }, []);

  // Show notification on initial load if Notion is not connected
  useEffect(() => {
    if (!initialLoad) return;
    
    if (statusQuery.isSuccess) {
      setInitialLoad(false);
      if (!statusQuery.data.notion_connected) {
        toast({
          title: "Notion Connection Issue",
          description: statusQuery.data.error || "Please check your Notion integration setup",
          variant: "destructive",
        });
      }
    }
  }, [statusQuery.isSuccess, statusQuery.data, initialLoad, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Notion CMS Setup</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Connect and manage your Notion database for your Airdrops Hunter website
          </p>
        </div>

        {/* Connection Status Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Check your connection to Notion</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {statusQuery.data?.notion_connected ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              ) : statusQuery.isLoading ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Checking...
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Checking your Notion connection status...
                </AlertDescription>
              </Alert>
            ) : statusQuery.data?.notion_connected ? (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Successfully connected to your Notion workspace. You can now manage your airdrops data.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {statusQuery.data?.error || "Failed to connect to Notion. Please check your integration settings."}
                </AlertDescription>
              </Alert>
            )}

            {/* Environment Variables Status */}
            {!statusQuery.data?.notion_connected && !statusQuery.isLoading && (
              <div className="mt-4 space-y-4">
                <h3 className="text-base font-medium">Required Environment Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {statusQuery.data?.error?.includes("NOTION_INTEGRATION_SECRET") ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">NOTION_INTEGRATION_SECRET</p>
                      <p className="text-sm text-neutral-600">
                        {statusQuery.data?.error?.includes("NOTION_INTEGRATION_SECRET")
                          ? "Missing or invalid. Set this in your Vercel environment variables."
                          : "Correctly configured"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {statusQuery.data?.error?.includes("NOTION_PAGE_URL") ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">NOTION_PAGE_URL</p>
                      <p className="text-sm text-neutral-600">
                        {statusQuery.data?.error?.includes("NOTION_PAGE_URL")
                          ? "Missing or invalid. Set this in your Vercel environment variables."
                          : "Correctly configured"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2">How to Fix</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-700">
                    <li>Go to your <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel Dashboard</a></li>
                    <li>Select your project and go to Settings &rarr; Environment Variables</li>
                    <li>Add both <code className="bg-neutral-200 px-1 rounded">NOTION_INTEGRATION_SECRET</code> and <code className="bg-neutral-200 px-1 rounded">NOTION_PAGE_URL</code></li>
                    <li>Redeploy your application for changes to take effect</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={refreshStatus} 
              variant="outline" 
              size="sm" 
              disabled={statusQuery.isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${statusQuery.isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </CardFooter>
        </Card>

        {/* Databases Management (only shown when connected) */}
        {statusQuery.data?.notion_connected && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notion Databases</CardTitle>
              <CardDescription>Manage your Notion databases for airdrops</CardDescription>
            </CardHeader>
            <CardContent>
              {databasesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : databasesQuery.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load databases. Please refresh and try again.
                  </AlertDescription>
                </Alert>
              ) : databasesQuery.data?.databases.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Databases Found</h3>
                  <p className="text-neutral-600 mb-4">
                    You don't have any databases in your Notion workspace yet.
                    Initialize the Airdrops database to get started.
                  </p>
                  <Button 
                    onClick={() => setupMutation.mutate()} 
                    disabled={setupMutation.isPending}
                    className="mx-auto"
                  >
                    {setupMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Initialize Airdrops Database
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-medium mb-3">Your Databases</h3>
                  <div className="space-y-2">
                    {databasesQuery.data?.databases.map((db: any) => {
                      const titleObj = db.title as any;
                      const title = Array.isArray(titleObj) && titleObj.length > 0 
                        ? titleObj[0]?.plain_text || "Untitled Database" 
                        : "Untitled Database";
                        
                      return (
                        <div key={db.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" />
                            <span className="font-medium">{title}</span>
                          </div>
                          <Badge variant="outline">{db.id.split('-')[0]}</Badge>
                        </div>
                      );
                    })}
                  </div>

                  {!hasAirdropsDatabase() && (
                    <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Airdrops Database Not Found
                      </h4>
                      <p className="text-sm text-neutral-600 mb-3">
                        You need to initialize the Airdrops database to store your airdrops data.
                      </p>
                      <Button 
                        onClick={() => setupMutation.mutate()} 
                        disabled={setupMutation.isPending}
                        size="sm"
                      >
                        {setupMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Airdrops Database
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {hasAirdropsDatabase() && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center gap-2 text-green-800">
                        <CheckCheck className="h-4 w-4 text-green-600" />
                        Airdrops Database Ready
                      </h4>
                      <p className="text-sm text-green-700 mb-3">
                        Your Airdrops database is set up and ready to use. You can add sample data or manage it directly in Notion.
                      </p>
                      <Button 
                        onClick={() => sampleDataMutation.mutate()} 
                        disabled={sampleDataMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        {sampleDataMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <FileJson className="h-4 w-4 mr-2" />
                            Add Sample Data
                          </>
                        )}
                      </Button>
                      <Button 
                        asChild
                        variant="secondary" 
                        size="sm"
                      >
                        <Link href="/">
                          <Home className="h-4 w-4 mr-2" />
                          Go to Homepage
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Advanced Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tools</CardTitle>
            <CardDescription>Diagnose and fix issues with your Notion integration</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cors" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="cors">CORS Check</TabsTrigger>
                <TabsTrigger value="vercel">Vercel Setup</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cors">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">CORS Configuration</h3>
                  <p className="text-sm text-neutral-600">
                    If you're experiencing issues with cross-origin requests, this could indicate a CORS configuration problem.
                  </p>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <h4 className="text-sm font-medium mb-2">CORS Error Solution</h4>
                    <div className="text-xs font-mono mb-3 bg-neutral-100 p-3 rounded overflow-x-auto">
                      <pre>{`
// In your API routes (Next.js example)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your API logic here
}
`}</pre>
                    </div>
                    <Button onClick={testCors} size="sm" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Test CORS Configuration
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vercel">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Vercel Deployment</h3>
                  <p className="text-sm text-neutral-600">
                    Make sure your environment variables are correctly set up in your Vercel project.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-primary-light rounded-full p-1">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Access Vercel Dashboard</p>
                        <p className="text-sm text-neutral-600">
                          Go to your Vercel dashboard and select your project
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-primary-light rounded-full p-1">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Navigate to Environment Variables</p>
                        <p className="text-sm text-neutral-600">
                          Go to Settings &rarr; Environment Variables
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-primary-light rounded-full p-1">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Set Notion Variables</p>
                        <p className="text-sm text-neutral-600">
                          Add NOTION_INTEGRATION_SECRET and NOTION_PAGE_URL
                        </p>
                        <div className="text-xs font-mono mt-1 bg-neutral-100 p-2 rounded">
                          NOTION_INTEGRATION_SECRET=<span className="text-primary">secret_...</span><br />
                          NOTION_PAGE_URL=<span className="text-primary">https://www.notion.so/user/Page-ID</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-primary-light rounded-full p-1">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Save and Redeploy</p>
                        <p className="text-sm text-neutral-600">
                          Save your changes and redeploy your application
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4">
                    <Button asChild variant="outline" size="sm">
                      <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open Vercel Dashboard
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Notion Permissions</h3>
                  <p className="text-sm text-neutral-600">
                    Make sure your Notion integration has access to your page and databases.
                  </p>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <h4 className="text-sm font-medium mb-2">How to Share Pages with Your Integration</h4>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Open the Notion page you want to connect</li>
                      <li>Click <strong>"Share"</strong> button in the top right corner</li>
                      <li>Click <strong>"Invite"</strong> tab</li>
                      <li>Find your integration under <strong>"Invite"</strong> search box</li>
                      <li>Select your integration from the list</li>
                      <li>Click <strong>"Invite"</strong></li>
                    </ol>
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm">
                        <a href="https://developers.notion.com/docs/getting-started" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Notion API Documentation
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </Button>
            <Button onClick={refreshStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Connection Again
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
