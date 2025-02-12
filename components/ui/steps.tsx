"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/utils/cn"

interface StepsProps {
  currentStep: number
  steps: {
    number: number
    title: string
    icon: React.ElementType
  }[]
}

export function Steps({ currentStep, steps }: StepsProps) {
  return (
    <div className="flex md:flex-col md:space-y-20 md:pl-2 space-x-4 md:space-x-0">
      {steps.map((step) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.number
        const isCurrent = currentStep === step.number

        return (
          <div key={step.number} className="relative">
            {step.number !== steps.length && (
              <div
                className={cn(
                  "hidden md:block absolute left-5 top-8 h-[calc(100%+3rem)] w-[2px] -translate-x-[0.5px] transition-colors duration-300",
                  isCompleted ? "bg-sky-blue dark:bg-sky-400" : "bg-gray-200 dark:bg-gray-500"
                )}
              />
            )}
            <div className="group relative flex items-start gap-4">
              <div
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                  isCompleted
                    ? "bg-sky-blue dark:bg-sky-400 text-white"
                    : isCurrent
                    ? "border-2 border-sky-blue dark:border-sky-400 bg-white dark:bg-gray-900"
                    : "border-2 border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-900"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className={cn(
                    "h-4 w-4 transition-colors duration-300", 
                    isCurrent 
                      ? "text-sky-blue dark:text-sky-400" 
                      : "text-gray-400 dark:text-gray-500"
                  )} />
                )}
              </div>
              <div className="hidden md:flex h-full my-auto">
                <div
                  className={cn(
                    "font-medium transition-colors duration-300",
                    isCompleted || isCurrent 
                      ? "text-primary dark:text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
