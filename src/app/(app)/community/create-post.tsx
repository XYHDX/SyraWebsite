
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wand2, Loader2, Image as ImageIcon } from "lucide-react";
import { createPost } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { generateImageForPost } from "@/ai/flows/generate-image-flow";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MAX_POST_LENGTH = 500;

export function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [generatedImageUrl, setGeneratedImageUrl] = useState("");
    const [imageHint, setImageHint] = useState("");
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Post content cannot be empty.",
            });
            return;
        }
        if (content.length > MAX_POST_LENGTH) {
             toast({
                variant: "destructive",
                title: "Error",
                description: `Post cannot exceed ${MAX_POST_LENGTH} characters.`,
            });
            return;
        }

        setIsLoading(true);
        try {
            await createPost(content, generatedImageUrl, imageHint);
            setContent(""); 
            setGeneratedImageUrl("");
            setImagePrompt("");
            setImageHint("");
            toast({
                title: "Post Submitted!",
                description: "Your post is now pending review by an admin.",
            });
            onPostCreated(); 
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to post",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) {
            toast({ variant: "destructive", title: "Please enter an image description."});
            return;
        }
        setIsGeneratingImage(true);
        try {
            const { imageUrl, hint } = await generateImageForPost({ prompt: imagePrompt });
            setGeneratedImageUrl(imageUrl);
            setImageHint(hint);
            toast({ title: "Image generated successfully!" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Image Generation Failed", description: error.message });
        } finally {
            setIsGeneratingImage(false);
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Create a new post</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="What's on your mind? Share an update or ask a question..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    className="text-base"
                    maxLength={MAX_POST_LENGTH}
                />
                 <p className="text-xs text-muted-foreground text-right mt-1">
                    {content.length} / {MAX_POST_LENGTH}
                </p>
                 {generatedImageUrl && !isGeneratingImage && (
                    <div className="mt-4">
                        <Image src={generatedImageUrl} alt="Generated image" width={200} height={150} className="rounded-lg border aspect-video object-cover" />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline" disabled={isLoading}><ImageIcon className="mr-2" />Add Image</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate an Image for Your Post</DialogTitle>
                            <DialogDescription>Describe the image you want to create with AI.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-prompt">Image Description</Label>
                                <Textarea id="image-prompt" placeholder="e.g., 'A team of students celebrating around a winning robot'" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} />
                            </div>
                            <Button onClick={handleGenerateImage} disabled={isGeneratingImage || !imagePrompt.trim()}>
                                {isGeneratingImage ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                                Generate
                            </Button>
                             {isGeneratingImage && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="ml-2">Generating image...</p>
                                </div>
                             )}
                             {generatedImageUrl && !isGeneratingImage &&(
                                <div>
                                    <p className="font-semibold mb-2">Generated Image:</p>
                                    <Image src={generatedImageUrl} alt="Generated image" width={400} height={300} className="rounded-lg border object-cover" />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                 </Dialog>
                <Button onClick={handleSubmit} disabled={isLoading || isGeneratingImage}>
                    {isLoading ? "Submitting..." : <><PlusCircle className="h-4 w-4 mr-2" />Submit for Review</>}
                </Button>
            </CardFooter>
        </Card>
    );
}
