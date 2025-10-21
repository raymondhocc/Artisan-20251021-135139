import { AIChatPanel } from "@/components/common/AIChatPanel";
import { IllustrativeHero } from "@/components/common/IllustrativeHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
const mockProjects = [
  {
    title: "Vintage Coffee Poster",
    description: "A retro-style poster for a local coffee shop.",
    imageUrl: "https://placehold.co/600x400/FF7043/FFFFFF/png?text=Vintage+Coffee",
    lastEdited: "2 hours ago",
  },
  {
    title: "Summer Music Festival",
    description: "Vibrant and energetic poster for a summer event.",
    imageUrl: "https://placehold.co/600x400/20B2AA/FFFFFF/png?text=Music+Fest",
    lastEdited: "1 day ago",
  },
  {
    title: "Chinese New Year",
    description: "Traditional design with modern calligraphy.",
    imageUrl: "https://placehold.co/600x400/FFD700/000000/png?text=新年快乐",
    lastEdited: "3 days ago",
  },
];
export function DashboardPage() {
  return (
    <div className="w-full">
      <div className="space-y-16 md:space-y-24">
        <IllustrativeHero />
        <section className="space-y-8 animate-slide-up animation-delay-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-artisan-text-primary">Recent Projects</h2>
            <Button asChild size="lg" className="btn-gradient transition-transform duration-300 hover:scale-105 active:scale-95">
              <Link to="/poster-editor">
                <PlusCircle className="mr-2 h-5 w-5" />
                Start New Poster
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProjects.map((project, index) => (
              <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-artisan-border">
                <CardHeader className="p-0">
                  <img src={project.imageUrl} alt={project.title} className="aspect-video object-cover" />
                </CardHeader>
                <CardContent className="p-6 space-y-2">
                  <CardTitle className="font-playfair text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <p className="text-sm text-muted-foreground">{project.lastEdited}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        <section className="space-y-8 animate-slide-up animation-delay-600">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center text-artisan-text-primary">AI Design Assistant</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Need inspiration or a quick edit? Just ask your AI assistant. Describe what you want to create or change, and watch the magic happen.
          </p>
          <div className="max-w-4xl mx-auto">
            <AIChatPanel />
          </div>
        </section>
      </div>
    </div>
  );
}