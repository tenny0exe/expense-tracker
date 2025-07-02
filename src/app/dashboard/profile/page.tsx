"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Edit3 } from "lucide-react";
import { useState } from 'react';

export default function ProfilePage() {
  // Mock user data and edit state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("User Name");
  const [email, setEmail] = useState("user@example.com");
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");

  const handleSaveChanges = () => {
    // Mock save action
    alert("Profile updated (mock)!");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-6 w-6" />
            User Profile
          </CardTitle>
          <CardDescription>View and update your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-primary" data-ai-hint="user avatar large">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm">
                <Edit3 className="mr-2 h-4 w-4" /> Change Photo
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={!isEditing} 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={!isEditing} 
                className="mt-1"
              />
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
