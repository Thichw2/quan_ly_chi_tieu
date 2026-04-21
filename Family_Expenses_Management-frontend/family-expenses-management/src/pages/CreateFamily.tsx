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

// Việt hóa các nhãn trong modal loading
const createSteps: Step[] = [
  { label: 'Đang tạo hồ sơ gia đình', status: 'pending' },
  { label: 'Đang thiết lập các danh mục chi tiêu', status: 'pending' },
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
        return <div className="text-center py-4 font-medium">Gia đình đã được tạo thành công!</div>;
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
      // Bước 1: Tạo tên gia đình
      updateStepStatus(0, 'loading');
      const familyData = await CreateFamilyNames(state.name);
      localStorage.setItem("family_id", familyData.data._id)
      updateStepStatus(0, 'complete');

      // Bước 2: Tạo danh mục chi tiêu
      updateStepStatus(1, 'loading');
      for (const category of state.expenseCategories) {
        await CreateCategories(category);
      }
      updateStepStatus(1, 'complete');

    } catch (error) {
      console.error('Lỗi khi tạo gia đình:', error);
      const failedStep = creationSteps.findIndex(step => step.status === 'loading');
      if (failedStep !== -1) {
        updateStepStatus(failedStep, 'error');
      }
    }
  };

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-50 p-4'>
      <Card className="w-full max-w-2xl mx-auto transition-all shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tạo hồ sơ gia đình - Bước {step}</CardTitle>
          <CardDescription>Vui lòng làm theo các bước để thiết lập gia đình của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 transition-all">
            <Progress value={progressPercentage} className="w-full h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
              <span>Bước {step} trên {TOTAL_STEPS}</span>
              <span>Hoàn thành {progressPercentage.toFixed(0)}%</span>
            </div>
          </div>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between transition-all pt-6">
          {step > 1 && (
            <Button 
              variant="outline"
              onClick={prevStep}
              disabled={isCreating}
            >
              Quay lại
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button 
              onClick={nextStep}
              className="ml-auto"
              disabled={isCreating}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button 
              onClick={handleCreate}
              className="ml-auto bg-green-600 hover:bg-green-700"
              disabled={isCreating}
            >
              Hoàn tất
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