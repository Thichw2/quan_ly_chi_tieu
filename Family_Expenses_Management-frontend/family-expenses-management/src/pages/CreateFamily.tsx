'use client'

import { useState, useReducer } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import CreateFamilyName from '@/components/create-family/CreateFamilyName';
import CreateExpenseCategories from '@/components/create-family/CreateExpenseCategories';
import { LoadingModal } from '@/components/create-family/LoadingModal';
import { CreateFamilyNames, CreateCategories } from '@/service/API';

type FamilyState = {
  name: string;
  expenseCategories: string[];
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EXPENSE_CATEGORIES'; payload: string[] };

const initialState: FamilyState = {
  name: '',
  expenseCategories: [],
};

type Step = {
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

const createSteps: Step[] = [
  { label: 'Creating family profile', status: 'pending' },
  { label: 'Setting up expense categories', status: 'pending' },
];

function familyReducer(state: FamilyState, action: Action): FamilyState {
    switch (action.type) {
      case 'SET_NAME':
        return { ...state, name: action.payload };
      case 'SET_EXPENSE_CATEGORIES':
        return { ...state, expenseCategories: action.payload };
      default:
        return state;
    }
}

const TOTAL_STEPS = 2;

export default function CreateFamily() {
  const [step, setStep] = useState(1);
  const [state, dispatch] = useReducer(familyReducer, initialState);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSteps, setCreationSteps] = useState<Step[]>(createSteps);
  const nextStep = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <CreateFamilyName 
          name={state.name} 
          setName={(name: string) => dispatch({ type: 'SET_NAME', payload: name })} 
        />;
      case 2:
        return <CreateExpenseCategories 
          categories={state.expenseCategories}
          setCategories={(categories: string[]) => dispatch({ type: 'SET_EXPENSE_CATEGORIES', payload: categories })}
        />;
      default:
        return <div>Family created successfully!</div>;
    }
  };

  const updateStepStatus = (index: number, status: Step['status']) => {
    setCreationSteps(current => 
      current.map((step, i) => 
        i === index ? { ...step, status } : step
      )
    );
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      updateStepStatus(0, 'loading');
      const familyData = await CreateFamilyNames(state.name);
      localStorage.setItem("family_id", familyData.data._id)
      updateStepStatus(0, 'complete');

      // Step 2: Create Categories
      updateStepStatus(1, 'loading');
      for (const category of state.expenseCategories) {
        await CreateCategories(category);
      }
      updateStepStatus(1, 'complete');

    } catch (error) {
      console.error('Error creating family:', error);
      const failedStep = creationSteps.findIndex(step => step.status === 'loading');
      if (failedStep !== -1) {
        updateStepStatus(failedStep, 'error');
      }
    }
  };

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <Card className="w-full max-w-2xl mx-auto transition-all">
        <CardHeader>
          <CardTitle>Create Family - Step {step}</CardTitle>
          <CardDescription>Follow the steps to create your family</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 transition-all">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{progressPercentage.toFixed(0)}% Complete</span>
            </div>
          </div>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between transition-all">
          {step > 1 && (
            <Button 
              onClick={prevStep}
              disabled={isCreating}
            >
              Previous
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button 
              onClick={nextStep}
              className="ml-auto"
              disabled={isCreating}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleCreate}
              className="ml-auto"
              disabled={isCreating}
            >
              Finish
            </Button>
          )}
        </CardFooter>
      </Card>

      <LoadingModal 
        isOpen={isCreating} 
        steps={creationSteps}
      />
    </div>
  );
}