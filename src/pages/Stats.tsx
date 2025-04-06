import React, { useState, useEffect } from 'react';
import { Expense } from '@/components/expense/ExpenseCard';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const Stats = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [chartData, setChartData] = useState<any[]>([]);
  
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
    
    if (viewMode === 'daily') {
      // Group expenses by day
      const dailyData: { [key: string]: number } = {};
      
      expenses.forEach((expense) => {
        const day = format(new Date(expense.date), 'MM/dd');
        if (dailyData[day]) {
          dailyData[day] += expense.amount;
        } else {
          dailyData[day] = expense.amount;
        }
      });
      
      // Convert to chart data format
      const data = Object.keys(dailyData).map((day) => ({
        name: day,
        amount: dailyData[day]
      }));
      
      // Sort by date
      data.sort((a, b) => {
        const [aMonth, aDay] = a.name.split('/').map(Number);
        const [bMonth, bDay] = b.name.split('/').map(Number);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      });
      
      // Only keep the last 7 days
      setChartData(data.slice(-7));
    } else {
      // Group expenses by week
      const weeklyData: { [key: string]: number } = {};
      
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const weekStart = format(startOfWeek(date), 'MM/dd');
        const weekEnd = format(endOfWeek(date), 'MM/dd');
        const weekKey = `${weekStart} - ${weekEnd}`;
        
        if (weeklyData[weekKey]) {
          weeklyData[weekKey] += expense.amount;
        } else {
          weeklyData[weekKey] = expense.amount;
        }
      });
      
      // Convert to chart data format
      const data = Object.keys(weeklyData).map((week) => ({
        name: week,
        amount: weeklyData[week]
      }));
      
      setChartData(data);
    }
  }, [expenses, viewMode]);
  
  // Calculate total spending by payment mode
  const spendingByMode: { [key: string]: number } = {};
  expenses.forEach((expense) => {
    const { paymentMode, amount } = expense;
    if (spendingByMode[paymentMode]) {
      spendingByMode[paymentMode] += amount;
    } else {
      spendingByMode[paymentMode] = amount;
    }
  });
  
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'UPI': return '#7DD3AE';
      case 'Card': return '#80C2FF';
      case 'Cash': return '#FFD166';
      case 'Online': return '#D4B2FF';
      default: return '#CCCCCC';
    }
  };
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Spending Stats</h1>
      
      <div className="mb-6">
        <Card className="card-gradient p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Spending Over Time</h2>
            <RadioGroup 
              defaultValue={viewMode} 
              onValueChange={(value) => setViewMode(value as 'daily' | 'weekly')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
            </RadioGroup>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 75%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Not enough data to display</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mb-6">
        <Card className="card-gradient p-4">
          <h2 className="font-semibold mb-4">Spending by Payment Mode</h2>
          
          {Object.keys(spendingByMode).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(spendingByMode).map(([mode, amount]) => (
                <div key={mode} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{mode}</span>
                    <span className="text-sm font-semibold">₹ {amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: getModeColor(mode),
                        width: `${(amount / Math.max(...Object.values(spendingByMode))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">No spending data available</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default Stats;
