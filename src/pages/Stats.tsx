
import React, { useState, useEffect } from 'react';
import { Expense } from '@/components/expense/ExpenseCard';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ExpenseCategory {
  name: string;
  value: number;
  percentage?: number;
}

const Stats = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [viewMode, setViewMode] = useState<'category' | 'payment'>('category');
  const [pieData, setPieData] = useState<ExpenseCategory[]>([]);
  
  useEffect(() => {
    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses).map((exp: any) => ({
        ...exp,
        date: new Date(exp.date)
      }));
      setExpenses(parsedExpenses);
    }
  }, []);
  
  useEffect(() => {
    if (expenses.length === 0) return;
    
    if (viewMode === 'category') {
      // Group expenses by category (using description as proxy for category)
      const categoryData: { [key: string]: number } = {};
      
      expenses.forEach((expense) => {
        const category = expense.description ? expense.description : 'Uncategorized';
        if (categoryData[category]) {
          categoryData[category] += expense.amount;
        } else {
          categoryData[category] = expense.amount;
        }
      });
      
      // Calculate total amount
      const totalAmount = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
      
      // Convert to chart data format with percentages
      const data = Object.entries(categoryData).map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: Math.round((amount / totalAmount) * 100)
      }));
      
      setPieData(data);
    } else {
      // Group expenses by payment mode
      const paymentData: { [key: string]: number } = {};
      
      expenses.forEach((expense) => {
        const { paymentMode, amount } = expense;
        if (paymentData[paymentMode]) {
          paymentData[paymentMode] += amount;
        } else {
          paymentData[paymentMode] = amount;
        }
      });
      
      // Calculate total amount
      const totalAmount = Object.values(paymentData).reduce((sum, amount) => sum + amount, 0);
      
      // Convert to chart data format with percentages
      const data = Object.entries(paymentData).map(([mode, amount]) => ({
        name: mode,
        value: amount,
        percentage: Math.round((amount / totalAmount) * 100)
      }));
      
      setPieData(data);
    }
  }, [expenses, viewMode]);
  
  const COLORS = ['#7DD3AE', '#80C2FF', '#FFD166', '#D4B2FF', '#FF7C70', '#AECAFC', '#FFC9DD', '#C1E8B0'];
  
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'UPI': return '#7DD3AE';
      case 'Card': return '#80C2FF';
      case 'Cash': return '#FFD166';
      case 'Online': return '#D4B2FF';
      default: return '#CCCCCC';
    }
  };

  // Format currency values for the tooltip
  const formatTooltipValue = (value: number) => `₹${value.toLocaleString()}`;
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Spending Stats</h1>
      
      <div className="mb-6">
        <Card className="card-gradient p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Spending Breakdown</h2>
            <RadioGroup 
              defaultValue={viewMode} 
              onValueChange={(value) => setViewMode(value as 'category' | 'payment')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="category" id="category" />
                <Label htmlFor="category">By Category</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="payment" id="payment" />
                <Label htmlFor="payment">By Payment</Label>
              </div>
            </RadioGroup>
          </div>
          
          {pieData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={viewMode === 'payment' ? getModeColor(entry.name) : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Not enough data to display</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mb-6">
        <Card className="card-gradient p-4">
          <h2 className="font-semibold mb-4">Spending Details</h2>
          
          {pieData.length > 0 ? (
            <div className="space-y-3">
              {pieData.map((item, index) => (
                <div key={item.name} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ 
                          backgroundColor: viewMode === 'payment' 
                            ? getModeColor(item.name) 
                            : COLORS[index % COLORS.length] 
                        }}
                      ></span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      ₹{item.value.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: viewMode === 'payment' 
                          ? getModeColor(item.name) 
                          : COLORS[index % COLORS.length],
                        width: `${item.percentage}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">No spending data available</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default Stats;
