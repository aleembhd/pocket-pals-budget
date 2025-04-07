
import React from 'react';
import { Award } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import BadgeCard, { UserBadge } from './BadgeCard';

interface ProfileSummary {
  budget: number;
  totalExpenses: number;
  expenseCount: number;
}

interface ProfileTabsProps {
  badges: UserBadge[];
  summary: ProfileSummary;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ badges, summary }) => {
  return (
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
              <span className="font-medium dark:text-white">₹ {summary.budget.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Expenses</span>
              <span className="font-medium dark:text-white">₹ {summary.totalExpenses.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Number of Expenses</span>
              <span className="font-medium dark:text-white">{summary.expenseCount}</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
