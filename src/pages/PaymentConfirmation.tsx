
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMode } from '@/components/expense/PaymentModeSelector';
import { Expense } from '@/components/expense/ExpenseCard';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Get data from location state
  const { amount, paymentMode, description } = location.state || {};
  
  if (!amount || !paymentMode) {
    // Redirect if data is missing
    navigate('/add-expense');
    return null;
  }
  
  const handleConfirm = (successful: boolean) => {
    setIsConfirming(true);
    
    if (successful) {
      // Save the expense if payment was successful
      const newExpense: Expense = {
        id: uuidv4(),
        amount: Number(amount),
        paymentMode: paymentMode as PaymentMode,
        date: new Date(),
        description: description || undefined
      };
      
      // Get existing expenses
      const existingExpensesJson = localStorage.getItem('expenses');
      const existingExpenses = existingExpensesJson ? JSON.parse(existingExpensesJson) : [];
      
      // Add new expense and save back to localStorage
      const updatedExpenses = [newExpense, ...existingExpenses];
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      toast({
        title: "Payment successful",
        description: `Added ₹${Number(amount).toLocaleString()} expense`
      });
    } else {
      toast({
        title: "Payment cancelled",
        description: "No expense has been recorded",
        variant: "destructive"
      });
    }
    
    // Redirect to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 300);
  };
  
  return (
    <AppLayout hideNav>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center py-10 px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Payment Confirmation</h1>
          <p className="text-gray-600">
            Did your payment of ₹{Number(amount).toLocaleString()} complete successfully?
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 w-full max-w-sm shadow-md">
          <div className="mb-6">
            <p className="text-gray-500 text-sm">Amount</p>
            <p className="text-2xl font-bold">₹ {Number(amount).toLocaleString()}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-500 text-sm">Payment Method</p>
            <p className="font-medium">{paymentMode}</p>
          </div>
          
          {description && (
            <div className="mb-6">
              <p className="text-gray-500 text-sm">Description</p>
              <p className="font-medium">{description}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-8 w-full max-w-sm">
          <Button
            onClick={() => handleConfirm(true)}
            disabled={isConfirming}
            className="flex-1 flex items-center justify-center gap-2 bg-budget-green text-white h-14 rounded-xl font-medium"
          >
            <Check size={20} />
            <span>Yes, Successful</span>
          </Button>
          
          <Button
            onClick={() => handleConfirm(false)}
            disabled={isConfirming}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 border-budget-red text-budget-red h-14 rounded-xl font-medium"
          >
            <X size={20} />
            <span>No, Failed</span>
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default PaymentConfirmation;
