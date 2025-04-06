
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, Settings } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { toast } = useToast();
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
  
  useEffect(() => {
    // Load data from localStorage
    const savedBudget = localStorage.getItem('budget');
    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
    
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenseCount(parsedExpenses.length);
      
      const total = parsedExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      setTotalExpenses(total);
    }
  }, []);
  
  const handleResetApp = () => {
    localStorage.removeItem('budget');
    localStorage.removeItem('expenses');
    
    toast({
      title: "App reset",
      description: "All data has been cleared",
    });
    
    // Reset state
    setBudget(0);
    setTotalExpenses(0);
    setExpenseCount(0);
    
    // Close dialog
    setShowResetDialog(false);
  };
  
  const handleExportData = () => {
    const expenses = localStorage.getItem('expenses') || '[]';
    const budget = localStorage.getItem('budget') || '0';
    
    const data = {
      expenses: JSON.parse(expenses),
      budget: Number(budget),
      exportDate: new Date().toISOString()
    };
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    
    toast({
      title: "Data exported",
      description: "Your data has been downloaded as a JSON file",
    });
  };
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
      
      <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Budget</span>
            <span className="font-medium">₹ {budget.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Expenses</span>
            <span className="font-medium">₹ {totalExpenses.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Number of Expenses</span>
            <span className="font-medium">{expenseCount}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        
        <Button
          onClick={handleExportData}
          variant="outline"
          className="w-full justify-start bg-white/80"
        >
          <Download size={18} className="mr-2" />
          Export Data
        </Button>
        
        <Button
          onClick={() => setShowResetDialog(true)}
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive bg-white/80"
        >
          <Trash2 size={18} className="mr-2" />
          Reset All Data
        </Button>
      </div>
      
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all your budget information and expense records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetApp} className="bg-destructive text-destructive-foreground">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Profile;
