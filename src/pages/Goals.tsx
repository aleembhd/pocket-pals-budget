
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import GoalCard, { Goal } from '@/components/goals/GoalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import AmountInput from '@/components/ui/amount-input';

const Goals = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Form states
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  
  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      setGoals(parsedGoals);
    }
  }, []);
  
  const saveGoals = (updatedGoals: Goal[]) => {
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };
  
  const handleAddGoal = () => {
    if (!newGoalName.trim()) {
      toast({
        title: "Goal name required",
        description: "Please enter a name for your goal",
        variant: "destructive"
      });
      return;
    }
    
    if (!newGoalAmount || Number(newGoalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid goal amount",
        variant: "destructive"
      });
      return;
    }
    
    const newGoal: Goal = {
      id: uuidv4(),
      name: newGoalName,
      targetAmount: Number(newGoalAmount),
      currentAmount: 0
    };
    
    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    
    toast({
      title: "Goal added",
      description: `Added goal: ${newGoalName}`
    });
    
    // Reset form
    setNewGoalName('');
    setNewGoalAmount('');
    setIsAddGoalOpen(false);
  };
  
  const handleOpenAddFunds = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddFundsAmount('');
    setIsAddFundsOpen(true);
  };
  
  const handleAddFunds = () => {
    if (!selectedGoalId) return;
    
    if (!addFundsAmount || Number(addFundsAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    const updatedGoals = goals.map(goal => {
      if (goal.id === selectedGoalId) {
        const newAmount = goal.currentAmount + Number(addFundsAmount);
        return {
          ...goal,
          currentAmount: Math.min(newAmount, goal.targetAmount)
        };
      }
      return goal;
    });
    
    saveGoals(updatedGoals);
    
    const goal = goals.find(g => g.id === selectedGoalId);
    
    toast({
      title: "Funds added",
      description: `Added ₹${Number(addFundsAmount).toLocaleString()} to ${goal?.name}`
    });
    
    // Check if goal is complete
    const updatedGoal = updatedGoals.find(g => g.id === selectedGoalId);
    if (updatedGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount) {
      toast({
        title: "Goal achieved! 🎉",
        description: `Congratulations! You've reached your goal for ${updatedGoal.name}`
      });
    }
    
    setIsAddFundsOpen(false);
  };

  return (
    <AppLayout>
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold dark:text-white"
        >
          Savings Goals
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-gray-600 dark:text-gray-300"
        >
          Track your progress towards financial targets
        </motion.p>
      </header>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg dark:text-white">Your Goals</h2>
        <Button
          onClick={() => setIsAddGoalOpen(true)}
          className="btn-gradient flex items-center gap-1 rounded-full px-4 py-1 h-8"
        >
          <PlusCircle size={16} />
          <span>New Goal</span>
        </Button>
      </div>
      
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onAddFunds={handleOpenAddFunds}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No goals yet</p>
          <Button
            onClick={() => setIsAddGoalOpen(true)}
            className="btn-gradient mt-4"
          >
            Create your first goal
          </Button>
        </div>
      )}
      
      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Name</label>
              <Input
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g., Trip to Goa"
                className="rounded-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount</label>
              <AmountInput
                value={newGoalAmount}
                onChange={setNewGoalAmount}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddGoalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleAddGoal} className="btn-gradient">Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Add</label>
              <AmountInput
                value={addFundsAmount}
                onChange={setAddFundsAmount}
                placeholder="500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddFundsOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleAddFunds} className="btn-gradient">Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Goals;
