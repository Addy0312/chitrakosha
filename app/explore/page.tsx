"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, ArrowDownWideNarrow } from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  artist: { name: string };
  createdAt: string;
}

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function ExplorePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchArtworks();
  }, [search, category, sort]);

  async function fetchArtworks() {
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);
    const res = await fetch(`/api/artworks?${params.toString()}`);
    const data = await res.json();
    setArtworks(data.artworks || []);
    // Extract unique categories from artworks
    const cats = Array.from(new Set((data.artworks || []).map((a: Artwork) => a.category)));
    setCategories(cats as string[]);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Explore Artworks</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, artist, or description..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex-shrink-0" onClick={() => setSearch("")}>Clear</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={!category ? "default" : "outline"}
          onClick={() => setCategory(null)}
        >
          <Filter className="w-4 h-4 mr-2" />All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
          >
            <Filter className="w-4 h-4 mr-2" />{cat}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-8">
        <span className="text-muted-foreground">Sort by:</span>
        <select
          className="border border-border rounded-md px-3 py-2 bg-background text-foreground"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ArrowDownWideNarrow className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artworks.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-16">
            No artworks found.
          </div>
        ) : (
          artworks.map(artwork => (
            <Card key={artwork.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-gradient-saffron">
                    {artwork.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-2">{artwork.title}</CardTitle>
                <p className="text-muted-foreground mb-4">by {artwork.artist.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">₹{artwork.price.toLocaleString("en-IN")}</span>
                  <Button size="sm" className="bg-gradient-saffron hover:opacity-90">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
