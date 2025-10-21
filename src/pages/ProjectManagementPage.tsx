import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { chatService, CanvasProject } from '@/lib/chat';
import { Loader2, Trash2, Edit, FolderOpen, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
export function ProjectManagementPage() {
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await chatService.listProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        toast.error('Failed to load projects', { description: response.error });
      }
    } catch (error) {
      toast.error('Failed to load projects', { description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await chatService.deleteProject(projectId);
      if (response.success) {
        toast.success('Project deleted successfully');
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        toast.error('Failed to delete project', { description: response.error });
      }
    } catch (error) {
      toast.error('Failed to delete project', { description: (error as Error).message });
    }
  };
  return (
    <div className="w-full">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-fredericka text-artisan-text-primary">Your Projects</h1>
          <p className="text-lg text-artisan-text-secondary max-w-2xl mx-auto">
            Manage your saved poster designs. Continue editing or start something new.
          </p>
        </section>
        <section className="space-y-8">
          <div className="flex justify-end">
            <Button asChild size="lg" className="btn-gradient transition-transform duration-300 hover:scale-105 active:scale-95">
              <Link to="/poster-editor">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Project
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-artisan-border shadow-sm">
                  <div className="aspect-video bg-muted/50 animate-pulse" />
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted/50 animate-pulse rounded-md" />
                    <div className="h-4 w-1/2 bg-muted/50 animate-pulse rounded-md mt-2" />
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2">
                    <div className="h-10 w-10 bg-muted/50 animate-pulse rounded-md" />
                    <div className="h-10 w-10 bg-muted/50 animate-pulse rounded-md" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 space-y-4 border-2 border-dashed rounded-lg">
              <FolderOpen className="h-16 w-16 mx-auto opacity-50" />
              <p className="text-xl font-playfair">No projects found.</p>
              <p>Click "New Project" to start creating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-artisan-border">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted/30 center">
                      <img
                        src={`https://placehold.co/600x400/EEE/31343C/png?text=${encodeURIComponent(project.title.substring(0, 15))}`}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1">
                    <CardTitle className="font-playfair text-xl truncate">{project.title}</CardTitle>
                    <CardDescription>Last modified: {new Date(project.lastModified).toLocaleString()}</CardDescription>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/poster-editor/${project.id}`)} title="Edit Project">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Project">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-artisan-card-bg border-artisan-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-playfair">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This will permanently delete the project "{project.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}