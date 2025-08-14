
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CreateCompetitionForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show success message since we haven't migrated competitions to Prisma yet
      toast({
        title: "Success",
        description: "Competition created successfully! (Mock implementation)",
      });
      
      // Reset form
      setName("");
      setDate("");
      setLocation("");
      setDescription("");
      setMaxTeams("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create competition",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Competition</CardTitle>
        <CardDescription>
          Announce a new robotics competition for students to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., VEX Robotics Competition"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Damascus Convention Center"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTeams">Maximum Teams</Label>
              <Input
                id="maxTeams"
                type="number"
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                placeholder="50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the competition, rules, and prizes..."
              rows={4}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Competition"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
