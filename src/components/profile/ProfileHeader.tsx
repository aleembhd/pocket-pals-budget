
import React, { useState } from 'react';
import { Edit, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import ProfileConfetti from './ProfileConfetti';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
}

interface ProfileHeaderProps {
  profileData: ProfileData;
  isProfileComplete: boolean;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  setIsProfileComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
  showConfetti: boolean;
  badges: any[];
  setBadges: React.Dispatch<React.SetStateAction<any[]>>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isProfileComplete,
  setProfileData,
  setIsProfileComplete,
  setShowConfetti,
  showConfetti,
  badges,
  setBadges
}) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<boolean>(false);
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
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
      const profileBadge = {
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
  
  return (
    <div className="mb-6 card-gradient rounded-xl p-5 shadow-sm">
      {showConfetti && <ProfileConfetti />}
      
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
    </div>
  );
};

export default ProfileHeader;
