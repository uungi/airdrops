import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  ArrowUpRight, 
  Clock, 
  Tag, 
  ExternalLink,
  Database,
  Layers
} from "lucide-react";
import { Airdrop } from "@shared/schema";

interface AirdropCardProps {
  airdrop: Airdrop;
}

export default function AirdropCard({ airdrop }: AirdropCardProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ethereum':
        return <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
          <path d="M16.498 4V12.87L23.995 16.219L16.498 4Z" fill="white" fillOpacity="0.602"/>
          <path d="M16.498 4L9 16.219L16.498 12.87V4Z" fill="white"/>
          <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fillOpacity="0.602"/>
          <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
          <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="white" fillOpacity="0.2"/>
          <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fillOpacity="0.602"/>
        </svg>;
      case 'solana':
        return <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="16" fill="#000000"/>
          <path d="M9.023 20.096C9.134 19.984 9.287 19.917 9.447 19.917H25.017C25.273 19.917 25.401 20.228 25.215 20.413L22.948 22.683C22.837 22.794 22.683 22.861 22.524 22.861H6.953C6.697 22.861 6.569 22.55 6.755 22.365L9.023 20.096Z" fill="url(#paint0_linear_1_10)"/>
          <path d="M9.023 9.318C9.139 9.207 9.293 9.14 9.447 9.14H25.017C25.273 9.14 25.401 9.451 25.215 9.636L22.948 11.906C22.837 12.017 22.683 12.084 22.524 12.084H6.953C6.697 12.084 6.569 11.773 6.755 11.588L9.023 9.318Z" fill="url(#paint1_linear_1_10)"/>
          <path d="M22.948 14.679C22.837 14.568 22.683 14.501 22.524 14.501H6.953C6.697 14.501 6.569 14.812 6.755 14.997L9.023 17.267C9.134 17.378 9.287 17.445 9.447 17.445H25.017C25.273 17.445 25.401 17.133 25.215 16.949L22.948 14.679Z" fill="url(#paint2_linear_1_10)"/>
          <defs>
            <linearGradient id="paint0_linear_1_10" x1="27.35" y1="6.147" x2="13.3" y2="28.198" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_10" x1="21.287" y1="2.854" x2="7.238" y2="24.905" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
            <linearGradient id="paint2_linear_1_10" x1="24.301" y1="4.493" x2="10.251" y2="26.544" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
          </defs>
        </svg>;
      case 'binance':
      case 'bsc':
        return <Coins className="h-4 w-4 text-yellow-500" />;
      default:
        return <Layers className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success" className="absolute top-3 right-3">ACTIVE</Badge>;
      case 'upcoming':
        return <Badge variant="warning" className="absolute top-3 right-3">UPCOMING</Badge>;
      case 'ended':
        return <Badge variant="danger" className="absolute top-3 right-3">ENDED</Badge>;
      default:
        return null;
    }
  };

  const getActionButton = (status: string, id: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <Button className="w-full">
            Participate Now <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        );
      case 'upcoming':
        return (
          <Button variant="secondary" className="w-full">
            Pre-Register <Clock className="h-4 w-4 ml-1" />
          </Button>
        );
      case 'ended':
        return (
          <Button variant="outline" className="w-full">
            View Details <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        );
      default:
        return (
          <Button className="w-full">
            View Details
          </Button>
        );
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={airdrop.imageUrl || "https://via.placeholder.com/800x400"} 
            alt={airdrop.name} 
            className="w-full h-48 object-cover"
          />
          {getStatusBadge(airdrop.status)}
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100">
              {getPlatformIcon(airdrop.platform)}
            </div>
            <h3 className="font-semibold text-lg">{airdrop.name}</h3>
          </div>
          
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {airdrop.description}
          </p>
          
          <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>{airdrop.platform}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{airdrop.estimatedValue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{airdrop.timing}</span>
            </div>
          </div>
          
          {getActionButton(airdrop.status, airdrop.id)}
        </div>
      </CardContent>
    </Card>
  );
}
