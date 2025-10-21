import React from "react";
import { Home, Library, PencilRuler, Settings, Paintbrush, FolderKanban, Info, LogIn, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
interface AppSidebarProps {
  isCollapsed: boolean;
  isAuthenticated: boolean;
}
export function AppSidebar({ isCollapsed, isAuthenticated }: AppSidebarProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Sidebar className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Paintbrush className="h-7 w-7 text-artisan-primary flex-shrink-0" />
          {!isCollapsed && <span className="text-lg font-bold font-fredericka tracking-wider whitespace-nowrap">Artisan Canvas</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/')}>
                <Link to="/"><Home /> {!isCollapsed && <span>Dashboard</span>}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAuthenticated && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/projects')}>
                    <Link to="/projects"><FolderKanban /> {!isCollapsed && <span>My Projects</span>}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/poster-editor')}>
                    <Link to="/poster-editor"><PencilRuler /> {!isCollapsed && <span>Poster Editor</span>}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/media-library')}>
                    <Link to="/media-library"><Library /> {!isCollapsed && <span>Media Library</span>}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/learn-more')}>
              <Link to="/learn-more"><Info /> {!isCollapsed && <span>Learn More</span>}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
              <Link to="/settings"><Settings /> {!isCollapsed && <span>Settings</span>}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut /> {!isCollapsed && <span>Logout</span>}
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild isActive={isActive('/login')}>
                <Link to="/login"><LogIn /> {!isCollapsed && <span>Login</span>}</Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}