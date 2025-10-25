// src/screens/MarketplacePage.tsx
import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Input } from "../../components/ui/input";

// ⬇️ import the sections from your LandingPage folder
// (If your paths differ, adjust accordingly.)
import { TrendingTokensSection } from "../LandingPage/sections/TrendingTokensSection";
import { TrendingItemsSection } from "../LandingPage/sections/TrendingItemsSection";
import { FooterSection } from "../LandingPage/sections/FooterSection";

const featuredCollections = [
  {
    id: 1,
    title: "Tud the Ugly Duck",
    creator: "By Choice Studios",
    nftCount: "345 NFTs",
    status: "Coming Soon",
    images: ["https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19.png"],
    gridImages: Array(6).fill("https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19.png"),
  },
  {
    id: 2,
    title: "Reptilia Heads",
    creator: "By Mari lorem",
    nftCount: "750 NFTs",
    status: "Live Mint",
    images: ["https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19-1.png"],
    gridImages: Array(6).fill("https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19-1.png"),
    showMintButton: true,
  },
  {
    id: 3,
    title: "Potrade",
    creator: "By Big Mouth Studios",
    nftCount: "120 NFTs",
    status: "Coming Soon",
    images: ["https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19-2.png"],
    gridImages: Array(6).fill("https://c.animaapp.com/mh588waf3IvYis/img/rectangle-19-2.png"),
  },
];

export const MarketplacePage = (): JSX.Element => {
  return (
    <div className="bg-[#0d0d0d] min-h-screen w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[7] flex items-center justify-between px-20 h-20 bg-[#0d0d0d30] backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)_brightness(100%)]">
        <img
          className="w-[90px] h-[22px] object-cover"
          alt="Hedraxlogo"
          src="https://c.animaapp.com/mh588waf3IvYis/img/hedraxlogo-2-1.png"
        />
        <nav className="flex items-center gap-5">
          <a
            href="/"
            className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-[#d5d7e38c] text-base tracking-[-0.32px] hover:text-[#d5d7e3]"
          >
            Marketplace
          </a>
          <a
            href="#launchpad"
            className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-[#d5d7e38c] text-base tracking-[-0.32px] hover:text-[#d5d7e3]"
          >
            Launchpad
          </a>
          <a
            href="#create"
            className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-[#d5d7e38c] text-base tracking-[-0.32px] hover:text-[#d5d7e3]"
          >
            Create
          </a>
          <a
            href="#swap"
            className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-[#d5d7e38c] text-base tracking-[-0.32px] hover:text-[#d5d7e3]"
          >
            Swap
          </a>
        </nav>
        <div className="relative w-[526px] max-w-[40vw]">
          <Input
            type="text"
            placeholder="Search collects, tokens and creators"
            className="w-full h-[50px] px-4 py-[13px] rounded-[18px] border border-[#d4d8e36e] bg-transparent text-white placeholder:text-white/50 pr-12"
          />
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
        </div>
        <Button className="w-[120px] h-[43px] bg-[#d5d7e3] hover:bg-[#e5e7f3] rounded-[18px] text-[#0d0d0d] text-base">
          Log in
        </Button>
      </header>

      {/* Main */}
      <main className="pt-32 px-20 pb-20 text-white">
        <div className="flex items-center justify-between mb-12">
          <div className="flex flex-col gap-2.5">
            <h1 className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-[#d5d7e3] text-4xl tracking-[-0.72px]">
              Featured Collection
            </h1>
            <p className="[font-family:'Gilroy-Regular-Regular',Helvetica] text-[#d5d7e3] text-base">
              Explore this week&apos;s live and upcoming projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="icon" className="w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#d5d7e34a]">
              <ChevronLeftIcon className="w-6 h-6 text-[#d5d7e3]" />
            </Button>
            <Button size="icon" className="w-12 h-12 rounded-full bg-[linear-gradient(99deg,rgba(0,16,89,1)_0%,rgba(0,34,191,1)_100%)] hover:opacity-90">
              <ChevronRightIcon className="w-6 h-6 text-[#d5d7e3]" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollections.map((collection) => (
            <Card
              key={collection.id}
              className="bg-[#0d0d0d] rounded-[30px] border border-[#d5d7e34a] overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="grid grid-cols-3">
                    {collection.gridImages.map((img, idx) => (
                      <img key={idx} className="w-full h-[120px] object-cover" alt={`${collection.title} ${idx + 1}`} src={img} />
                    ))}
                  </div>

                  {collection.status && (
                    <Badge className="absolute top-4 left-4 bg-[#1a1a1a] rounded-xl px-4 py-2 border-0 hover:bg-[#1a1a1a]">
                      {collection.status === "Live Mint" && (
                        <span className="w-2 h-2 rounded-full bg-[#2dd100] mr-2 inline-block" />
                      )}
                      <span className="[font-family:'Gilroy-Medium-Medium',Helvetica] text-[#d5d7e3] text-sm">
                        {collection.status}
                      </span>
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 py-8 px-6">
                  <h3 className="[font-family:'Gilroy-Medium-Medium',Helvetica] text-[#d5d7e3] text-[27px] text-center">
                    {collection.title}
                  </h3>

                  <p className="opacity-70 [font-family:'Gilroy-Regular-Regular',Helvetica] text-[#d5d7e3] text-base text-center">
                    {collection.creator}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <img className="w-5 h-5 object-cover" alt="NFT icon" src="https://c.animaapp.com/mh588waf3IvYis/img/nft-6298900-1-4.png" />
                    <span className="[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] text-white text-base">
                      {collection.nftCount}
                    </span>
                  </div>

                  {collection.showMintButton && (
                    <Button className="mt-4 w-full h-12 bg-[#d5d7e3] hover:bg-[#e5e7f3] rounded-[18px] text-[#0d0d0d] text-base">
                      Mint Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ⬇️ New sections */}
        <div className="mt-24">
          <TrendingTokensSection />
        </div>
        <div className="mt-16">
          <TrendingItemsSection />
        </div>
        <div className="mt-24">
          <FooterSection />
        </div>
      </main>
    </div>
  );
};
