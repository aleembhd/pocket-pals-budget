import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming shadcn card
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { Expense, PaymentMode } from '@/components/expense/ExpenseCard'; // Assuming Expense type is here

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract payment details safely
  const paymentDetails = location.state?.paymentDetails;

  if (!paymentDetails || !paymentDetails.upiData) {
    // Handle cases where navigation state is missing (e.g., direct access)
    React.useEffect(() => {
      toast({
        title: "Error",
        description: "Payment details not found. Returning home.",
        variant: "destructive",
      });
      navigate('/');
    }, [navigate, toast]);
    return <AppLayout><div>Loading or redirecting...</div></AppLayout>; // Or a proper loading state
  }

  const { amount, upiData, note } = paymentDetails;

  const saveExpense = () => {
    // Create new expense object
    const newExpense: Expense = {
      id: uuidv4(),
      amount: Number(amount),
      paymentMode: 'UPI', // Payment was via UPI QR scan
      date: new Date(),
      description: note || `Paid to ${upiData.pn}`, // Use note or generate description
      payeeName: upiData.pn, // Store payee name
      payeeAddress: upiData.pa // Store payee address
    };

    // Retrieve existing expenses from localStorage
    const existingExpensesJson = localStorage.getItem('expenses');
    const existingExpenses = existingExpensesJson ? JSON.parse(existingExpensesJson) : [];

    // Add new expense and save back to localStorage
    const updatedExpenses = [newExpense, ...existingExpenses];
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

    toast({
      title: "Payment Confirmed",
      description: `Recorded ₹${Number(amount).toLocaleString()} expense to ${upiData.pn}`
    });

    navigate('/');
  };

  const handleConfirm = () => {
    saveExpense();
  };

  const handleCancel = () => {
    toast({
      title: "Payment Not Confirmed",
      description: "Expense was not recorded.",
      variant: "secondary" // Use a less prominent variant
    });
    navigate('/');
  };

  return (
    <AppLayout hideNav> {/* Hide nav bar on this confirmation screen */}
      <div className="flex flex-col justify-center items-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Confirm Payment</CardTitle>
            <CardDescription className="text-center">
              Did your payment of ₹{Number(amount).toLocaleString()} succeed?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Paying To</span>
              <span className="font-medium text-right">{upiData.pn || 'Merchant'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">UPI Address</span>
              <span className="font-medium text-sm text-right">{upiData.pa}</span>
            </div>
             {note && (
               <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Note</span>
                  <span className="font-medium text-sm text-right">{note}</span>
               </div>
             )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
             <Button
                onClick={handleConfirm}
                className="w-full py-3 text-base btn-gradient"
             >
                Yes, Payment Successful
             </Button>
             <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full py-3 text-base"
             >
                No, Payment Failed
             </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PaymentConfirmation;
