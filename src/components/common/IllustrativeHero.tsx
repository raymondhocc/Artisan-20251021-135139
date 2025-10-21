import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export function IllustrativeHero() {
  return (
    <section className="text-center relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-artisan-primary/20 rounded-full filter blur-3xl opacity-50 animate-float" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-artisan-secondary/20 rounded-full filter blur-3xl opacity-50 animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-fredericka text-artisan-text-primary mb-6 animate-fade-in">
          Artisan Canvas
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-playfair text-artisan-text-secondary max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
          Create Stunning Multilingual Posters with the Power of AI
        </p>
        <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Button asChild size="lg" className="btn-gradient px-8 py-6 text-lg font-semibold transition-transform duration-300 hover:scale-105 active:scale-95">
            <Link to="/poster-editor">
              Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold transition-transform duration-300 hover:scale-105 active:scale-95">
            Learn More
          </Button>
        </div>
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '900ms' }}>
          <img
            src="https://placehold.co/1200x600/FFFFFF/CCCCCC/png?text=AI+Generated+Poster+Showcase"
            alt="AI Generated Poster Showcase"
            className="rounded-2xl shadow-2xl aspect-video object-cover border-4 border-white dark:border-artisan-card-bg"
          />
        </div>
      </div>
    </section>
  );
}