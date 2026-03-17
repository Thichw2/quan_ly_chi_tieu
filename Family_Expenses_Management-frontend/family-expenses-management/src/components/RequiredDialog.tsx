import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function CreateFamilyDialog() {
  const navigate = useNavigate()
  const family_id = localStorage.getItem('family_id')
  
  return (
    <Dialog open={family_id === 'null'} modal>
      <DialogContent className="sm:max-w-md" >
        <DialogHeader>
          <DialogTitle>Family Information Required</DialogTitle>
          <DialogDescription>
            Before proceeding, you need to set up your family information. This will help us personalize your experience and organize your household finances better.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Setting up your family profile includes:
          </p>
          <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
            <li>Creating a family name</li>
            <li>Setting up expense categories for better organization</li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={() => navigate('/create-family')}
            className="w-full sm:w-auto"
          >
            Create Family Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}