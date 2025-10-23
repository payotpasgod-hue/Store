interface CheckoutProgressProps {
  currentStep: 1 | 2;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { number: 1, label: "Address Details", icon: "location_on" },
    { number: 2, label: "Payment", icon: "payment" },
  ];

  return (
    <div className="flex items-center justify-center max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
              }`}
              data-testid={`progress-step-${step.number}`}
            >
              {currentStep > step.number ? (
                <span className="material-icons text-xl">check</span>
              ) : (
                <span className="material-icons text-xl">{step.icon}</span>
              )}
            </div>
            <span
              className={`mt-2 text-sm font-medium transition-colors ${
                currentStep >= step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-24 md:w-32 mx-4 transition-colors ${
                currentStep > step.number ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
