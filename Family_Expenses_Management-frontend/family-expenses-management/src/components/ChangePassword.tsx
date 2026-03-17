import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChangePassword } from "@/service/API";
import { AxiosError } from "axios";

interface ChangePasswordDialogProps {
    isOpen: boolean,
    onClose: () => void
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({isOpen, onClose}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match!",
        variant: "destructive",
      });
      return;
    }

    try {
        await ChangePassword(currentPassword, newPassword)
        toast({
            title: "Success",
            description: "Password updated successfully!",
          });
    }catch (e: unknown) {
        if (e instanceof AxiosError) {
          toast({
            variant: "destructive",
            title: "Uh oh! Đã có lỗi xảy ra",
            description: e.response?.data?.detail || "Unknown error",
          });
        } else {
          console.error("An unexpected error occurred:", e);
        }
    }

    onClose()

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePasswordChange}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;