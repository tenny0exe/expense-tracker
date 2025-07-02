
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2 } from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES } from '@/context/CurrencyContext';
import { useTransactions } from '@/context/TransactionsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyCode } from "@/lib/types";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [email, setEmail] = useState("user@example.com");
  const [currentTheme, setCurrentTheme] = useState("system"); 
  const { selectedCurrency, setSelectedCurrencyCode } = useCurrency();
  const { clearAllTransactions } = useTransactions();
  const { toast } = useToast();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'system';
    setCurrentTheme(storedTheme);
    // Initial theme application is handled in Providers.tsx for early application
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else { // system
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };


  const handleSaveChanges = () => {
    // Mock save action for existing settings
    toast({
        title: "Settings Updated",
        description: "Your general settings have been saved (mock).",
    });
  };

  const handleClearTransactions = async () => {
    try {
      await clearAllTransactions();
      toast({
        title: "Success",
        description: "Transaction history cleared successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear transaction history. Please try again.",
      });
      console.error("Error clearing transactions:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Settings
          </CardTitle>
          <CardDescription>Manage your account and application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="notifications" className="font-medium">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your spending and budget alerts.
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                aria-label="Toggle notifications"
              />
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="flex items-center space-x-2">
              <Button variant={currentTheme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')}>Light</Button>
              <Button variant={currentTheme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')}>Dark</Button>
              <Button variant={currentTheme === 'system' ? 'default' : 'outline'} onClick={() => handleThemeChange('system')}>System</Button>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Localization</h3>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={selectedCurrency.code}
                onValueChange={(value) => setSelectedCurrencyCode(value as CurrencyCode)}
              >
                <SelectTrigger id="currency" className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose the currency for displaying monetary values across the app.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Management</h3>
            <div className="space-y-2">
                <Label htmlFor="clear-transactions">Transaction Data</Label>
                <div className="ml-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" id="clear-transactions">
                            <Trash2 className="mr-2 h-4 w-4" /> Clear Transaction History
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your
                            transaction history from your local storage.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearTransactions}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
              <p className="text-sm text-muted-foreground">
                Permanently remove all your transaction data stored in this browser.
              </p>
            </div>
          </div>


          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
