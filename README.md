# Artisan Canvas: Multilingual AI Poster Creator

[cloudflarebutton]

Artisan Canvas is a cutting-edge web application designed to empower users with the ability to create stunning, multilingual posters using advanced open-source AI models, Qwen-Image and Qwen-Image-Edit. This platform offers a comprehensive suite of tools, from robust media management to an intuitive AI-powered design assistant and a highly interactive canvas editor, all meticulously crafted with visual excellence and user experience at its core.

Users can upload their own image files to build a personalized media library, which seamlessly integrates with the canvas for poster creation. The core innovation lies in its AI chat interface, where users can 'chat with images' and describe their design intentions, text content (supporting Traditional Chinese, Simplified Chinese, and English, including calligraphy and mixed content), and editing requirements. Qwen-Image, a 20-billion-parameter multimodal diffusion transformer, is adept at generating designs that incorporate complex multilingual text rendering, while its extension, Qwen-Image-Edit, provides pixel-level precision for direct text editing within images, preserving original fonts, sizes, and styles. The canvas environment acts as a dynamic workspace where AI-generated elements and edits can be directly applied, allowing for a fluid and collaborative design process that transforms abstract ideas into visually breathtaking, print-ready posters and social media graphics. The application is built on Cloudflare Workers, leveraging Durable Objects for persistent state management and running on Cloudflare's edge network for unparalleled performance and scalability.

## ✨ Key Features

*   **Multilingual Poster Creation**: Generate designs incorporating Traditional Chinese, Simplified Chinese, and English characters, calligraphy, and mixed content.
*   **AI-Powered Image Generation**: Leverage Qwen-Image for advanced image generation with complex text rendering.
*   **AI-Powered Image Editing**: Utilize Qwen-Image-Edit for pixel-level precision text editing within images, preserving original fonts, sizes, and styles.
*   **Interactive Canvas Editor**: A dynamic workspace powered by `fabric.js` for combining manual adjustments with AI-generated elements and edits.
*   **Intuitive AI Chat Interface**: Describe design intentions, text content, and editing requirements through natural language.
*   **Robust Media Library**: Upload, browse, organize, and delete personal image assets.
*   **Persistent Project Management**: Save and retrieve design sessions and projects using Cloudflare Durable Objects.
*   **High Performance & Scalability**: Built on Cloudflare Workers and Durable Objects for unparalleled performance and global scalability.
*   **Visually Stunning UI**: Crafted with obsessive attention to visual excellence, smooth animations, and responsive design across all devices.

## 🚀 Technology Stack

Artisan Canvas is built with a modern and robust technology stack:

**Frontend**:
*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **Vite**: A fast build tool that provides an extremely quick development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Shadcn/ui**: A collection of beautifully designed components built with Radix UI and Tailwind CSS.
*   **Framer Motion**: A production-ready motion library for React to power animations.
*   **Lucide React**: A beautiful, customizable icon library.
*   **Zustand**: A small, fast, and scalable bear-necessities state-management solution.
*   **React Hook Form**: For flexible and extensible forms with easy validation.
*   **fabric.js**: A powerful JavaScript HTML5 canvas library for interactive canvas editing.
*   **react-dropzone**: Simple React hook for creating a HTML5 drag-and-drop zone.
*   **google-fonts-webfont-loader**: For dynamically loading custom Google Fonts.

**Backend (Cloudflare Worker)**:
*   **Hono**: A small, fast, and modern web framework for the edge.
*   **Cloudflare Agents SDK**: For stateful agent management with persistent Durable Objects.
*   **Model Context Protocol (MCP)**: For real server integration with AI models.
*   **OpenAI SDK**: For AI model integration via Cloudflare AI Gateway.
*   **Durable Objects**: Cloudflare's distributed coordination primitive for persistent state management.

**Tooling**:
*   **TypeScript**: For type safety and an extensible architecture.
*   **Bun**: A fast all-in-one JavaScript runtime, package manager, bundler, and test runner.

## ⚙️ Setup and Installation

To get Artisan Canvas up and running on your local machine, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/artisan-canvas.git
    cd artisan-canvas
    ```

2.  **Install dependencies**:
    Artisan Canvas uses `bun` as its package manager. Ensure you have `bun` installed.
    ```bash
    bun install
    ```

3.  **Configure Environment Variables**:
    Create a `.dev.vars` file in the root of your project (or set them in your Cloudflare Worker environment for deployment).
    You will need the following variables:
    *   `CF_AI_BASE_URL`: Cloudflare AI Gateway base URL (e.g., `https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai`)
    *   `CF_AI_API_KEY`: API key for Cloudflare AI Gateway access.
    *   `SERPAPI_KEY`: (Optional, for `web_search` tool) API key for SerpAPI. Get one at [https://serpapi.com/](https://serpapi.com/).
    *   `OPENROUTER_API_KEY`: (Optional, for specific models) API key for OpenRouter.

    Example `.dev.vars` content:
    ```
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-ai-api-key"
    SERPAPI_KEY="your-serpapi-key"
    # OPENROUTER_API_KEY="your-openrouter-api-key"
    ```
    **IMPORTANT**: Never expose your API keys to client-side code. These keys are used server-side within the Cloudflare Worker.

## 🚀 Usage

Once the application is running, navigate to `http://localhost:3000` (or your deployed URL).

1.  **Dashboard**: The main landing page provides an overview and a call-to-action to start a new poster.
2.  **AI Chat Panel**: Integrated into the dashboard and editor, this panel allows you to interact with the AI. Describe your design ideas, text content, and editing requests.
3.  **Media Library (Future Phase)**: Upload and manage your image assets.
4.  **Poster Editor (Future Phase)**: Drag images onto the canvas, combine manual adjustments with AI suggestions, and refine your poster design.

## 💻 Development

To run the application in development mode:

```bash
bun dev
```
This will start the Vite development server, and the page will auto-update as you edit the frontend files. The Cloudflare Worker (backend API) will also be running locally.

The chat API is powered by Cloudflare Agents (Durable Objects) and accessible through the worker at `/api/chat/:sessionId/*` routes.

## ☁️ Deployment to Cloudflare

Artisan Canvas is designed for seamless deployment to Cloudflare Workers.

[cloudflarebutton]

1.  **Build the project**:
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare Workers**:
    Ensure you have the Cloudflare `wrangler` CLI installed and configured.
    ```bash
    bun run deploy
    ```
    Wrangler will prompt you to log in if you haven't already and guide you through the deployment process. It will automatically pick up the environment variables from your Cloudflare Worker's settings.

## ⚠️ Important Note on AI Usage

Although this project has AI capabilities, there is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period. Please use the AI features responsibly.