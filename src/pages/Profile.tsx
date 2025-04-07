
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, Settings, Award, Trophy } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BadgeCard, { UserBadge } from '@/components/profile/BadgeCard';

const Profile = () => {
  const { toast } = useToast();
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXp, setUserXp] = useState<number>(0);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  
  const xpNeededForNextLevel = userLevel * 100;
  const xpProgress = Math.min(100, Math.round((userXp / xpNeededForNextLevel) * 100));
  
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
      
      // Calculate user level and XP based on expenses
      const baseXp = parsedExpenses.length * 10; // 10 XP per expense
      setUserXp(baseXp % (userLevel * 100));
      setUserLevel(Math.max(1, Math.floor(baseXp / 100) + 1));
      
      // Generate badges based on user activity
      const generatedBadges: UserBadge[] = [];
      
      if (parsedExpenses.length >= 5) {
        generatedBadges.push({
          id: '1',
          name: 'Expense Tracker',
          description: 'Tracked 5+ expenses',
          icon: '📝',
          date: new Date(),
          category: 'Consistency'
        });
      }
      
      if (parsedExpenses.length >= 10) {
        generatedBadges.push({
          id: '2',
          name: 'Tracking Pro',
          description: 'Tracked 10+ expenses',
          icon: '🏆',
          category: 'Consistency',
          date: new Date()
        });
      }
      
      // Check if user has used UPI or Online payments
      const hasUpiPayments = parsedExpenses.some((exp: any) => exp.paymentMode === 'UPI');
      if (hasUpiPayments) {
        generatedBadges.push({
          id: '3',
          name: 'Digital Payer',
          description: 'Made payments using UPI',
          icon: '📱',
          category: 'Payment',
          date: new Date()
        });
      }
      
      // Check for big savings
      if (budget > 0 && totalExpenses < budget * 0.7) {
        generatedBadges.push({
          id: '4',
          name: 'Super Saver',
          description: 'Spent less than 70% of budget',
          icon: '💰',
          category: 'Savings',
          date: new Date()
        });
      }
      
      setBadges(generatedBadges);
    }
  }, []);
  
  const handleResetApp = () => {
    localStorage.removeItem('budget');
    localStorage.removeItem('expenses');
    localStorage.removeItem('goals');
    
    toast({
      title: "App reset",
      description: "All data has been cleared",
    });
    
    // Reset state
    setBudget(0);
    setTotalExpenses(0);
    setExpenseCount(0);
    setUserLevel(1);
    setUserXp(0);
    setBadges([]);
    
    // Close dialog
    setShowResetDialog(false);
  };
  
  const handleExportData = () => {
    const expenses = localStorage.getItem('expenses') || '[]';
    const budget = localStorage.getItem('budget') || '0';
    const goals = localStorage.getItem('goals') || '[]';
    
    const data = {
      expenses: JSON.parse(expenses),
      budget: Number(budget),
      goals: JSON.parse(goals),
      badges,
      userLevel,
      userXp,
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
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Profile & Settings</h1>
      
      <div className="mb-6 card-gradient rounded-xl p-5 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 rounded-full p-3 mr-3">
            <Trophy size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold dark:text-white">Level {userLevel}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{userXp} / {xpNeededForNextLevel} XP</p>
          </div>
        </div>
        
        <Progress value={xpProgress} className="h-2 mb-1" />
        <p className="text-xs text-gray-500 dark:text-gray-400">Earn XP by tracking expenses, adding goals, and saving money!</p>
      </div>
      
      <Tabs defaultValue="badges" className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges">
          <div className="space-y-1">
            {badges.length > 0 ? (
              badges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))
            ) : (
              <div className="text-center py-6">
                <Award size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No badges earned yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Keep using the app to earn badges!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="card-gradient rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Monthly Budget</span>
                <span className="font-medium dark:text-white">₹ {budget.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Expenses</span>
                <span className="font-medium dark:text-white">₹ {totalExpenses.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Number of Expenses</span>
                <span className="font-medium dark:text-white">{expenseCount}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Settings</h2>
        
        <Button
          onClick={handleExportData}
          variant="outline"
          className="w-full justify-start bg-white/80 dark:bg-gray-800 dark:text-white"
        >
          <Download size={18} className="mr-2" />
          Export Data
        </Button>
        
        <Button
          onClick={() => setShowResetDialog(true)}
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive bg-white/80 dark:bg-gray-800"
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
