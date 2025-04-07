
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download } from 'lucide-react';
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

interface ProfileSettingsProps {
  onReset: () => void;
  onExport: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onReset, onExport }) => {
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
  
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-3 dark:text-white">Settings</h2>
      
      <Button
        onClick={onExport}
        variant="outline"
        className="w-full justify-start bg-white dark:bg-gray-800 dark:text-white"
      >
        <Download size={18} className="mr-2" />
        Export Data
      </Button>
      
      <Button
        onClick={() => setShowResetDialog(true)}
        variant="outline"
        className="w-full justify-start text-red-500 hover:text-red-600 bg-white dark:bg-gray-800"
      >
        <Trash2 size={18} className="mr-2" />
        Reset All Data
      </Button>
      
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
            <AlertDialogAction onClick={() => {
              onReset();
              setShowResetDialog(false);
            }} className="bg-destructive text-destructive-foreground">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSettings;
