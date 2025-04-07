
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileLevel from '@/components/profile/ProfileLevel';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSettings from '@/components/profile/ProfileSettings';
import { UserBadge } from '@/components/profile/BadgeCard';

const Profile = () => {
  const { toast } = useToast();
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXp, setUserXp] = useState<number>(0);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  
  const xpNeededForNextLevel = userLevel * 100;
  const xpProgress = Math.min(100, Math.round((userXp / xpNeededForNextLevel) * 100));
  
  useEffect(() => {
    // Load data from localStorage
    const savedBudget = localStorage.getItem('budget');
    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
    
    const savedProfileData = localStorage.getItem('profileData');
    if (savedProfileData) {
      const parsedProfileData = JSON.parse(savedProfileData);
      setProfileData(parsedProfileData);
      setIsProfileComplete(isProfileDataComplete(parsedProfileData));
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
      
      // Add Profile Completed badge if profile is complete
      if (isProfileComplete) {
        generatedBadges.push({
          id: '5',
          name: 'Profile Master',
          description: 'Completed your profile details',
          icon: '👤',
          category: 'Special',
          date: new Date()
        });
      }
      
      setBadges(generatedBadges);
    }
  }, []);
  
  const isProfileDataComplete = (data: any) => {
    return data.name && data.email && data.phone;
  };
  
  const handleResetApp = () => {
    localStorage.removeItem('budget');
    localStorage.removeItem('expenses');
    localStorage.removeItem('goals');
    localStorage.removeItem('profileData');
    
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
    setProfileData({
      name: '',
      email: '',
      phone: '',
      profilePicture: ''
    });
    setIsProfileComplete(false);
  };
  
  const handleExportData = () => {
    const expenses = localStorage.getItem('expenses') || '[]';
    const budget = localStorage.getItem('budget') || '0';
    const goals = localStorage.getItem('goals') || '[]';
    const profileData = localStorage.getItem('profileData') || '{}';
    
    const data = {
      expenses: JSON.parse(expenses),
      budget: Number(budget),
      goals: JSON.parse(goals),
      profileData: JSON.parse(profileData),
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
      
      <ProfileHeader 
        profileData={profileData}
        isProfileComplete={isProfileComplete}
        setProfileData={setProfileData}
        setIsProfileComplete={setIsProfileComplete}
        showConfetti={showConfetti}
        setShowConfetti={setShowConfetti}
        badges={badges}
        setBadges={setBadges}
      />
      
      <div className="card-gradient rounded-xl p-5 shadow-sm mb-6">
        <ProfileLevel 
          userLevel={userLevel}
          userXp={userXp}
          xpNeededForNextLevel={xpNeededForNextLevel}
          xpProgress={xpProgress}
        />
      </div>
      
      <ProfileTabs 
        badges={badges}
        summary={{
          budget,
          totalExpenses,
          expenseCount
        }}
      />
      
      <ProfileSettings 
        onReset={handleResetApp}
        onExport={handleExportData}
      />
    </AppLayout>
  );
};

export default Profile;
