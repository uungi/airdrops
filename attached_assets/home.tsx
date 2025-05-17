import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sparkles, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AirdropCard from "@/components/airdrops/airdrop-card";
import { Airdrop } from "@shared/schema";

export default function Home() {
  // Query for featured airdrops
  const featuredAirdropsQuery = useQuery<{ airdrops: Airdrop[] }>({
    queryKey: ['/api/airdrops/featured'],
  });

  // Query for checking Notion connection status
  const notionStatusQuery = useQuery({
    queryKey: ['/api/notion/status'],
  });

  // Check if Notion is connected
  const isNotionConnected = notionStatusQuery.data?.notion_connected === true;

  // Set page title
  useEffect(() => {
    document.title = "Airdrops Hunter - Best Crypto Airdrops";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find the Best Crypto Airdrops
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
              Discover and track crypto airdrops to earn free tokens and grow your portfolio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="default" className="bg-white text-primary hover:bg-neutral-100">
                Explore Airdrops
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Notion Connection Status Alert (only shown if there's an issue) */}
        {!isNotionConnected && !notionStatusQuery.isLoading && (
          <div className="container mx-auto px-4 my-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>There's an issue with the Notion integration. Some content may not be available.</span>
                <Button asChild variant="outline" size="sm" className="ml-2 whitespace-nowrap">
                  <Link href="/notion-setup">Fix Connection</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Featured Airdrops Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                Featured Airdrops
              </h2>
              <Button asChild variant="ghost" className="text-primary">
                <Link href="/airdrops">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {featuredAirdropsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-0">
                      <Skeleton className="h-52 w-full rounded-t-lg" />
                      <div className="p-5">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredAirdropsQuery.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load featured airdrops. Please try again later.
                </AlertDescription>
              </Alert>
            ) : featuredAirdropsQuery.data?.airdrops.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Featured Airdrops Yet</h3>
                <p className="text-neutral-600 mb-6">
                  Setup your Notion database to add featured airdrops
                </p>
                <Button asChild>
                  <Link href="/notion-setup">
                    Setup Notion Integration
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAirdropsQuery.data?.airdrops.map((airdrop) => (
                  <AirdropCard key={airdrop.id} airdrop={airdrop} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Airdrops Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                Recent Airdrops
              </h2>
              <Button asChild variant="ghost" className="text-primary">
                <Link href="/airdrops">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {!isNotionConnected ? (
              <Card>
                <CardContent className="flex flex-col items-center text-center py-12">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Notion Connection Required</h3>
                  <p className="text-neutral-600 max-w-md mb-6">
                    To display airdrops from your Notion database, you need to set up the integration first.
                  </p>
                  <Button asChild>
                    <Link href="/notion-setup">
                      Setup Notion Integration
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : featuredAirdropsQuery.isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-2/3 mb-1" />
                          <div className="flex gap-2 mt-3">
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredAirdropsQuery.data?.airdrops.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No Airdrops Available</h3>
                  <p className="text-neutral-600 max-w-md mb-6">
                    Add some airdrops to your Notion database to see them here.
                  </p>
                  <Button asChild>
                    <Link href="/notion-setup">
                      Setup Sample Data
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredAirdropsQuery.data?.airdrops.slice(0, 4).map((airdrop) => (
                  <Card key={airdrop.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 h-auto">
                          <img 
                            src={airdrop.imageUrl || "https://via.placeholder.com/300"} 
                            alt={airdrop.name} 
                            className="w-full h-full object-cover"
                            style={{ minHeight: "140px" }}
                          />
                        </div>
                        <div className="p-4 sm:w-2/3">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{airdrop.name}</h3>
                            <div className={`px-2 py-1 text-xs font-bold rounded-full ${
                              airdrop.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : airdrop.status === 'Upcoming' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {airdrop.status}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{airdrop.description}</p>
                          <div className="flex items-center text-xs text-neutral-500 mb-3">
                            <span className="mr-3">{airdrop.platform}</span>
                            <span>{airdrop.estimatedValue}</span>
                          </div>
                          <Button size="sm" className="w-full sm:w-auto">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
