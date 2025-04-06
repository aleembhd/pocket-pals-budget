
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import AmountInput from '@/components/ui/amount-input';

const SetBudget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if we're editing an existing budget
    const savedBudget = localStorage.getItem('budget');
    if (savedBudget) {
      setBudget(savedBudget);
      setIsEditing(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budget || Number(budget) <= 0) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('budget', budget);
    
    toast({
      title: isEditing ? "Budget updated" : "Budget set",
      description: `Your monthly budget is now ₹${Number(budget).toLocaleString()}`,
    });
    
    navigate('/');
  };

  return (
    <AppLayout hideNav>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <div className="flex-1 flex flex-col justify-center items-center px-4 pt-10">
          <h1 className="text-2xl font-bold mb-2">
            {isEditing ? 'Update Your Budget' : 'Set Your Budget'}
          </h1>
          <p className="text-gray-600 text-center mb-10">
            {isEditing
              ? 'Change your monthly budget amount'
              : 'Enter how much you want to spend this month'}
          </p>
          
          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            <div className="space-y-8">
              <AmountInput
                value={budget}
                onChange={setBudget}
                placeholder="5000"
                className="mb-8"
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 text-lg rounded-xl btn-gradient"
              >
                {isEditing ? 'Update Budget' : 'Set Budget'}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full mt-3"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default SetBudget;
