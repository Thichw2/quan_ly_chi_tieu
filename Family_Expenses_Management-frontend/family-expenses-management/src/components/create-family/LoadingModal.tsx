import { CheckCircle2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

interface Step {
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface LoadingModalProps {
  isOpen: boolean;
  steps: Step[];
}

export function LoadingModal({ isOpen, steps }: LoadingModalProps) {
  const navigate = useNavigate()

  const handleBackHome = () => {
    navigate("/")
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle >
            Create New Family
        </DialogTitle>
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {step.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                {step.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {(step.status === 'pending' || step.status === 'error') && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={`flex-1 ${
                  step.status === 'loading' ? 'text-blue-500 font-medium' :
                  step.status === 'complete' ? 'text-green-500' :
                  step.status === 'error' ? 'text-red-500' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
            <div className='w-full flex justify-end'>
              <Button onClick={handleBackHome} className='text-right'>
                Home <Home className='w-4 h-4'/>
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

