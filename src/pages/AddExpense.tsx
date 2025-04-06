
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import AmountInput from '@/components/ui/amount-input';
import PaymentModeSelector, { PaymentMode } from '@/components/expense/PaymentModeSelector';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Expense } from '@/components/expense/ExpenseCard';

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid expense amount",
        variant: "destructive"
      });
      return;
    }
    
    if (!paymentMode) {
      toast({
        title: "Payment mode required",
        description: "Please select a payment mode",
        variant: "destructive"
      });
      return;
    }
    
    if (paymentMode === 'UPI' || paymentMode === 'Online') {
      setIsProcessing(true);
      // Simulate payment app opening
      launchPaymentApp();
    } else {
      saveExpense();
    }
  };
  
  const launchPaymentApp = () => {
    // In a real app, we would use deep linking to open payment apps
    // For our demo, we'll simulate this with a confirmation
    
    const confirmPayment = window.confirm(
      "This would normally open your payment app (Google Pay, PhonePe, etc). " +
      "Proceed with payment?"
    );
    
    if (confirmPayment) {
      // Navigate to confirmation screen
      navigate('/payment-confirmation', { 
        state: { 
          amount, 
          paymentMode,
          description 
        } 
      });
    } else {
      setIsProcessing(false);
    }
  };
  
  const saveExpense = () => {
    // Create new expense object
    const newExpense: Expense = {
      id: uuidv4(),
      amount: Number(amount),
      paymentMode: paymentMode as PaymentMode,
      date: new Date(),
      description: description || undefined
    };
    
    // Retrieve existing expenses from localStorage
    const existingExpensesJson = localStorage.getItem('expenses');
    const existingExpenses = existingExpensesJson ? JSON.parse(existingExpensesJson) : [];
    
    // Add new expense and save back to localStorage
    const updatedExpenses = [newExpense, ...existingExpenses];
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    toast({
      title: "Expense added",
      description: `Added ₹${Number(amount).toLocaleString()} expense`
    });
    
    navigate('/');
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Amount</label>
          <AmountInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
          <Input
            type="text"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg h-12"
          />
        </div>
        
        {/* Payment Mode Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Payment Mode</label>
          <PaymentModeSelector 
            selectedMode={paymentMode} 
            onSelect={setPaymentMode} 
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 text-lg rounded-xl btn-gradient mt-8"
          disabled={isProcessing}
        >
          {paymentMode === 'UPI' || paymentMode === 'Online' 
            ? 'Pay Now' 
            : 'Add Expense'}
        </Button>
      </form>
    </AppLayout>
  );
};

export default AddExpense;
