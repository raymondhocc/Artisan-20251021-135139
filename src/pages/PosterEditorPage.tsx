import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image, Plus, Trash2, Redo, Undo, Save, Download, Type, Square, Circle, Layers, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { AIChatPanel } from '@/components/common/AIChatPanel';
import { chatService } from '@/lib/chat';
import { useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useParams, useNavigate } from 'react-router-dom';
// Define ILoadImageOptions locally as it's not directly exported from 'fabric' namespace in some environments
interface ILoadImageOptions {
  crossOrigin?: string;
  // Add other common image options if needed
  [key: string]: any; // Allow for additional properties
}
interface ImageAsset {
  url: string;
  filename: string;
}
export function PosterEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(30);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const sessionId = chatService.getSessionId();
  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/r2/list/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      if (data.success && data.data?.imageUrls) {
        const fetchedImages: ImageAsset[] = data.data.imageUrls.map((url: string) => ({
          url,
          filename: url.substring(url.lastIndexOf('/') + 1),
        }));
        setImages(fetchedImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load media library', { description: (error as Error).message });
    }
  }, [sessionId]);
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
  const saveCanvasState = useCallback(() => {
    if (fabricCanvasRef.current) {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      if (newHistory[newHistory.length - 1] !== json) {
        newHistory.push(json);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [history, historyIndex]);
  const loadCanvasState = useCallback((state: string) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll();
        const newHistory = [state];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      });
    }
  }, []);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f8f8',
      });
      fabricCanvasRef.current = canvas;
      const handleCanvasEvent = () => saveCanvasState();
      canvas.on('object:modified', handleCanvasEvent);
      canvas.on('object:added', handleCanvasEvent);
      canvas.on('object:removed', handleCanvasEvent);
      canvas.on('selection:created', (e) => setActiveObject(e.selected ? e.selected[0] : null));
      canvas.on('selection:updated', (e) => setActiveObject(e.selected ? e.selected[0] : null));
      canvas.on('selection:cleared', () => setActiveObject(null));
      if (projectId) {
        setIsLoadingProject(true);
        chatService.loadProject(projectId).then(res => {
          if (res.success && res.data) {
            loadCanvasState(res.data.canvasState);
            toast.success(`Project '${res.data.title}' loaded.`);
          } else {
            toast.error('Failed to load project.', { description: res.error });
            navigate('/poster-editor');
          }
        }).finally(() => setIsLoadingProject(false));
      } else {
        saveCanvasState();
      }
      return () => {
        canvas.dispose();
      };
    }
  }, [projectId, saveCanvasState, loadCanvasState, navigate]);
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      fabricCanvasRef.current?.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [history, historyIndex]);
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      fabricCanvasRef.current?.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [history, historyIndex]);
  const addImageToCanvas = useCallback((url: string) => {
    const imageLoadedCallback: (img: fabric.Image) => void = (img) => {
      const canvasWidth = fabricCanvasRef.current?.width || 800;
      const imgWidth = img.width || 200;
      const scale = (canvasWidth * 0.25) / imgWidth; // Scale to 25% of canvas width
      img.set({
        left: 50,
        top: 50,
        scaleX: scale,
        scaleY: scale,
      });
      fabricCanvasRef.current?.add(img);
      fabricCanvasRef.current?.setActiveObject(img);
      fabricCanvasRef.current?.renderAll();
    };
    const imageOptions: ILoadImageOptions = { // Using the locally defined interface
      crossOrigin: 'anonymous'
    };
    fabric.Image.fromURL(url, imageLoadedCallback, imageOptions);
  }, []);
  const addTextToCanvas = useCallback(() => {
    const text = new fabric.IText('Your Text Here', {
      left: 100, top: 100, fontFamily: 'Inter', fontSize: fontSize, fill: textColor, editable: true,
    });
    fabricCanvasRef.current?.add(text);
    fabricCanvasRef.current?.setActiveObject(text);
    fabricCanvasRef.current?.renderAll();
  }, [textColor, fontSize]);
  const addShapeToCanvas = useCallback((shapeType: 'rect' | 'circle') => {
    let shape;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({ left: 100, top: 100, fill: '#20B2AA', width: 100, height: 100 });
    } else {
      shape = new fabric.Circle({ left: 100, top: 100, fill: '#FF7043', radius: 50 });
    }
    fabricCanvasRef.current?.add(shape);
    fabricCanvasRef.current?.setActiveObject(shape);
    fabricCanvasRef.current?.renderAll();
  }, []);
  const deleteSelectedObject = useCallback(() => {
    if (activeObject) {
      fabricCanvasRef.current?.remove(activeObject);
      fabricCanvasRef.current?.renderAll();
      setActiveObject(null);
    }
  }, [activeObject]);
  const bringToFront = useCallback(() => {
    if (activeObject) {
      // @ts-expect-error - bringToFront exists on fabric.Canvas but is missing from type definitions
      fabricCanvasRef.current?.bringToFront(activeObject);
      fabricCanvasRef.current?.renderAll();
      saveCanvasState();
    }
  }, [activeObject, saveCanvasState]);
  const sendToBack = useCallback(() => {
    if (activeObject) {
      // @ts-expect-error - sendToBack exists on fabric.Canvas but is missing from type definitions
      fabricCanvasRef.current?.sendToBack(activeObject);
      fabricCanvasRef.current?.renderAll();
      saveCanvasState();
    }
  }, [activeObject, saveCanvasState]);
  const handleSaveProject = async () => {
    if (fabricCanvasRef.current) {
      setIsSaving(true);
      const canvasState = JSON.stringify(fabricCanvasRef.current.toJSON());
      const currentId = projectId || crypto.randomUUID();
      const title = projectId ? undefined : `New Project - ${new Date().toLocaleDateString()}`;
      const res = await chatService.saveProject(currentId, canvasState, title);
      if (res.success && res.data) {
        toast.success('Project saved successfully!');
        if (!projectId) {
          navigate(`/poster-editor/${res.data.projectId}`);
        }
      } else {
        toast.error('Failed to save project.', { description: res.error });
      }
      setIsSaving(false);
    }
  };
  const handleExportImage = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'artisan-canvas-poster.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Poster exported as PNG!');
    }
  };
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          addImageToCanvas(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [addImageToCanvas]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24 lg:py-32 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-fredericka text-artisan-text-primary">Poster Editor</h1>
          <p className="text-lg text-artisan-text-secondary max-w-2xl mx-auto">
            Unleash your creativity with AI-powered design tools.
          </p>
        </section>
        <div className="flex flex-col lg:flex-row gap-8" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="lg:w-1/4 space-y-8">
            <Card className="h-[40vh] border-artisan-border shadow-lg">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-xl font-playfair flex items-center gap-2">
                  <Image className="h-5 w-5 text-artisan-secondary" /> Media Library
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(40vh-65px)]">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {images.map((image) => (
                      <div key={image.filename} className="relative group cursor-pointer aspect-video overflow-hidden rounded-lg border border-artisan-border shadow-sm" onClick={() => addImageToCanvas(image.url)}>
                        <img src={image.url} alt={image.filename} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <div className="h-[70vh]">
              <AIChatPanel onAIGeneratedImage={addImageToCanvas} />
            </div>
          </div>
          <Card className={`lg:w-3/4 flex-1 flex flex-col border-artisan-border shadow-lg ${isDragActive ? 'border-artisan-accent ring-4 ring-artisan-accent/20' : ''}`}>
            <CardHeader className="p-4 border-b flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-xl font-playfair">Design Canvas</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="icon" onClick={addTextToCanvas} title="Add Text"><Type className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => addShapeToCanvas('rect')} title="Add Rectangle"><Square className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => addShapeToCanvas('circle')} title="Add Circle"><Circle className="h-4 w-4" /></Button>
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" size="icon" title="Text Color"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: textColor }} /></Button></PopoverTrigger>
                  <PopoverContent className="w-48 bg-artisan-card-bg border-artisan-border p-4">
                    <Label htmlFor="textColor" className="text-sm font-medium mb-2 block">Text Color</Label>
                    <Input id="textColor" type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); if (activeObject?.type === 'i-text') { (activeObject as fabric.IText).set({ fill: e.target.value }); fabricCanvasRef.current?.renderAll(); saveCanvasState(); } }} className="h-8 w-full" />
                    <Label htmlFor="fontSize" className="text-sm font-medium mt-4 mb-2 block">Font Size</Label>
                    <Slider id="fontSize" min={10} max={100} step={1} value={[fontSize]} onValueChange={(val) => { setFontSize(val[0]); if (activeObject?.type === 'i-text') { (activeObject as fabric.IText).set({ fontSize: val[0] }); fabricCanvasRef.current?.renderAll(); saveCanvasState(); } }} className="w-full" />
                    <span className="text-sm text-muted-foreground mt-2 block">{fontSize}px</span>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={bringToFront} disabled={!activeObject} title="Bring to Front"><Layers className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="icon" onClick={sendToBack} disabled={!activeObject} title="Send to Back"><Layers className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0} title="Undo"><Undo className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo"><Redo className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={deleteSelectedObject} disabled={!activeObject} title="Delete Selected"><Trash2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={handleSaveProject} disabled={isSaving} title="Save Project">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button className="btn-gradient" onClick={handleExportImage}><Download className="h-4 w-4 mr-2" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex items-center justify-center relative bg-muted/20">
              {isLoadingProject && (
                <div className="absolute inset-0 flex items-center justify-center bg-artisan-card-bg/80 z-10">
                  <Loader2 className="h-12 w-12 text-artisan-primary animate-spin" />
                </div>
              )}
              <canvas ref={canvasRef} className="border border-artisan-border rounded-lg shadow-inner" />
              {isDragActive && (<div className="absolute inset-0 flex items-center justify-center bg-artisan-accent/20 text-artisan-text-primary text-2xl font-bold rounded-lg pointer-events-none">Drop image here!</div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}