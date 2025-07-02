
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, Sparkles } from 'lucide-react';
import { getSpendingInsights } from '@/ai/flows/spending-insights';
import type { SpendingInsightsInput, SpendingInsightsOutput } from '@/ai/flows/spending-insights';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTransactions } from '@/context/TransactionsContext'; 
import { useCurrency } from '@/context/CurrencyContext'; 

export default function SuggestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SpendingInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions(); 
  const { selectedCurrency } = useCurrency(); 

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    if (transactionsLoading) {
      setError("Transactions are still loading. Please wait a moment and try again.");
      setIsLoading(false);
      return;
    }

    if (transactionsError) {
      setError(`Could not fetch transaction data: ${transactionsError}. Please try again.`);
      setIsLoading(false);
      return;
    }
    
    if (transactions.length === 0) {
      setError("No spending data available to generate suggestions. Please add some transactions first.");
      setIsLoading(false);
      return;
    }

    try {
      const spendingDataString = transactions
        .filter(t => t.type === 'expense') 
        .map(t => 
          `${t.date}: ${t.description} (${t.category}) - ${selectedCurrency.code} ${Math.abs(t.amount).toFixed(2)}`
        ).join('\n');
      
      if (!spendingDataString) {
        setError("No expense data available to generate suggestions.");
        setIsLoading(false);
        return;
      }

      const input: SpendingInsightsInput = {
        spendingData: spendingDataString,
      };
      
      const result = await getSpendingInsights(input);
      setSuggestions(result);
    } catch (err) {
      console.error("Error getting spending insights:", err);
      setError("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-yellow-400" />
            Smart Saving Suggestions
          </CardTitle>
          <CardDescription>
            Get personalized tips from our AI to help you save money based on your spending habits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGetSuggestions} 
            disabled={isLoading || transactionsLoading} 
            className="w-full md:w-auto"
          >
            {isLoading || transactionsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Generating..." : (transactionsLoading ? "Loading Data..." : "Get My Smart Suggestions")}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {suggestions && (
            <Card className="bg-accent/30 border-accent">
              <CardHeader>
                <CardTitle className="text-lg">Your Personalized Savings Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap p-4 bg-background rounded-md shadow">
                  {suggestions.savingsTips}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !suggestions && !error && !transactionsLoading && (
             <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Lightbulb className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold">Ready for some insights?</h3>
              <p>
                {transactions.length === 0 
                  ? "Add some transactions first, then click the button above."
                  : "Click the button above to generate AI-powered saving tips."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
