
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, Settings, Award, Trophy, User, Edit, UserCheck } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import ProfileConfetti from '@/components/profile/ProfileConfetti';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Coins } from 'lucide-react';

const Profile = () => {
  const { toast } = useToast();
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseCount, setExpenseCount] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
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
  const [editMode, setEditMode] = useState<boolean>(false);
  
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
  
  const saveProfileData = () => {
    const isComplete = isProfileDataComplete(profileData);
    const wasCompleteBefore = isProfileComplete;
    
    localStorage.setItem('profileData', JSON.stringify(profileData));
    setIsProfileComplete(isComplete);
    setEditMode(false);
    
    if (isComplete && !wasCompleteBefore) {
      // Show confetti and add badge when profile is completed for the first time
      setShowConfetti(true);
      
      // Add the profile completed badge
      const profileBadge: UserBadge = {
        id: '5',
        name: 'Profile Master',
        description: 'Completed your profile details',
        icon: '👤',
        category: 'Special',
        date: new Date()
      };
      
      // Check if badge already exists
      if (!badges.some(badge => badge.id === '5')) {
        setBadges([...badges, profileBadge]);
      }
      
      toast({
        title: "Profile completed!",
        description: "You've earned the Profile Master badge!",
      });
      
      // Stop confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    }
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
    
    // Close dialog
    setShowResetDialog(false);
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
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Profile & Settings</h1>
      
      {showConfetti && <ProfileConfetti />}
      
      <div className="mb-6 card-gradient rounded-xl p-5 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="flex flex-col md:flex-row w-full">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                {profileData.profilePicture ? (
                  <AvatarImage src={profileData.profilePicture} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div>
                <h2 className="text-xl font-semibold dark:text-white">
                  {profileData.name || "User"}
                </h2>
                {!editMode && profileData.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{profileData.email}</p>
                )}
                {!editMode && profileData.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{profileData.phone}</p>
                )}
                {!editMode && !isProfileComplete && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete your profile to earn a badge!
                  </p>
                )}
              </div>
            </div>
            
            {!editMode && (
              <div className="ml-auto mt-4 md:mt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(true)}
                  className="bg-white/80 dark:bg-gray-800 dark:text-white"
                >
                  <Edit size={16} className="mr-2" />
                  {isProfileComplete ? "Edit Profile" : "Complete Profile"}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {editMode && (
          <Dialog open={editMode} onOpenChange={setEditMode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your profile information
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {profileData.profilePicture ? (
                      <AvatarImage src={profileData.profilePicture} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials(profileData.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => document.getElementById('profilePicture')?.click()}
                  >
                    <Edit size={14} />
                  </Button>
                  <input 
                    type="file" 
                    id="profilePicture" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium dark:text-white">Name</label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium dark:text-white">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium dark:text-white">Phone</label>
                  <Input 
                    id="phone" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                <Button onClick={saveProfileData}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        <div className="mt-2">
          <div className="bg-primary/10 rounded-full p-3 mr-3 inline-block float-left">
            <Trophy size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold dark:text-white">Level {userLevel}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{userXp} / {xpNeededForNextLevel} XP</p>
          </div>
          
          <Progress value={xpProgress} className="h-2 mt-2 mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Earn XP by tracking expenses, adding goals, and saving money!</p>
        </div>
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
