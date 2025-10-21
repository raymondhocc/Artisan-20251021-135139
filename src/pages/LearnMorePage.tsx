import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Cloud, Database, FileArchive, AlertTriangle } from 'lucide-react';
export function LearnMorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24 lg:py-32 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-fredericka text-artisan-text-primary">About Artisan Canvas</h1>
          <p className="text-lg text-artisan-text-secondary max-w-3xl mx-auto">
            Discover the technology and vision behind your AI-powered design companion.
          </p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-artisan-border shadow-lg">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-playfair flex items-center gap-3">
                <Bot className="h-8 w-8 text-artisan-primary" />
                Our AI Models
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-muted-foreground">
              <p>
                Artisan Canvas leverages powerful open-source AI models from Alibaba Cloud to bring your creative visions to life.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-artisan-text-primary">Qwen-Image:</strong> A state-of-the-art AI image generator that excels at creating designs with complex multilingual text, including Traditional and Simplified Chinese characters.
                </li>
                <li>
                  <strong className="text-artisan-text-primary">Qwen-Image-Edit:</strong> An extension that allows for pixel-perfect editing of text directly within images, preserving the original style, font, and size.
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-artisan-border shadow-lg">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-playfair flex items-center gap-3">
                <Cloud className="h-8 w-8 text-artisan-secondary" />
                Our Persistence Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-muted-foreground">
              <p>
                To provide a fast, scalable, and globally accessible service, Artisan Canvas is built entirely on Cloudflare's serverless platform.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 mt-1 text-artisan-secondary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-artisan-text-primary">Cloudflare Durable Objects</h4>
                    <p>Project states and session data are managed by Durable Objects, providing strong consistency and stateful logic right at the network edge.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileArchive className="h-5 w-5 mt-1 text-artisan-secondary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-artisan-text-primary">Cloudflare R2 Storage</h4>
                    <p>Your uploaded media assets are securely stored in R2, Cloudflare's zero-egress-fee object storage, making them readily available for your designs.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-artisan-border">
                <h4 className="font-semibold text-artisan-text-primary">Why not a local database like SQLite3?</h4>
                <p className="text-sm mt-2">
                  Cloudflare Workers operate in a serverless environment without a persistent local filesystem. This architecture prevents the use of file-based databases like SQLite3. Our cloud-native approach with Durable Objects and R2 ensures your data is persistent, secure, and fast to access from anywhere in the world.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="border-artisan-border shadow-lg bg-amber-50 dark:bg-amber-900/20">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-playfair flex items-center gap-3 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-8 w-8" />
              A Note on Browser Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 text-amber-700 dark:text-amber-400">
            <p>
              Occasionally, you might encounter a client-side JavaScript error in your browser's console, such as <code className="bg-amber-200 dark:bg-amber-800/50 p-1 rounded-md text-sm font-mono">Uncaught SyntaxError: Unexpected identifier 'Set'</code>.
            </p>
            <p>
              These types of errors are typically not related to the application's code itself but stem from the complex interaction between the browser, the Vite build tool, and its Hot Module Replacement (HMR) feature. They are often transient and can usually be resolved by a simple page refresh. This is a known aspect of modern web development environments and is outside the scope of application-level bug fixes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}