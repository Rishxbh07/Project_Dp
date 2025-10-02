import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const Step = ({ children }) => <>{children}</>;

const Stepper = ({
  initialStep = 0,
  onStepChange,
  onFinalStepCompleted,
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = React.Children.toArray(children);
  const isFinalStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isFinalStep) {
      if (onFinalStepCompleted) onFinalStepCompleted();
    } else {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) onStepChange(newStep);
    }
  };

  const handleBack = () => {
    const newStep = Math.max(0, currentStep - 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10">
      <div className="relative mb-6">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-slate-700"></div>
        <div className="relative flex justify-between">
          {steps.map((_, index) => {
            const isActive = index <= currentStep;
            return (
              <div key={index} className="relative flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle size={14} /> : index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6 text-center min-h-[100px] flex flex-col justify-center">
        {steps[currentStep]}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-gray-200 dark:bg-slate-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity"
        >
          {isFinalStep ? 'Finish' : 'Next'}
          {!isFinalStep && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default Stepper;