import React, { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "../ThemeToggle";
import { Footer } from "../common/Footer";
import { Paintbrush, PanelLeftClose, PanelLeftOpen, LogIn, LogOut, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/auth";
function Header({ isSidebarCollapsed, toggleSidebar }: { isSidebarCollapsed: boolean; toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex w-9 h-9 rounded-full hover:bg-artisan-accent/20 hover:text-artisan-accent transition-all duration-300"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <Paintbrush className="h-7 w-7 text-artisan-primary" />
              <h1 className="text-xl font-bold font-fredericka tracking-wider">Artisan Canvas</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-artisan-text-secondary" />
                <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="w-9 h-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="ghost" size="icon" title="Login" className="w-9 h-9 rounded-full hover:bg-artisan-primary/10 hover:text-artisan-primary transition-all duration-300">
                <Link to="/login">
                  <LogIn className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <AppSidebar isCollapsed={isSidebarCollapsed} isAuthenticated={!!user} />
        <Header isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <SidebarInset className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[256px]'}`}>
          <main className="flex-1 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-16 md:py-24 lg:py-32">
                {children}
              </div>
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}