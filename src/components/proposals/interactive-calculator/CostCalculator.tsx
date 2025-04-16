
import React, { useState, useEffect } from 'react';
import { CostCalculatorOption, InteractiveCostCalculator } from '@/types/proposal-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { currencyFormatter } from '@/lib/utils';

interface CostCalculatorProps {
  calculator: InteractiveCostCalculator;
  onPriceUpdate?: (totalPrice: number, selectedOptions: CostCalculatorOption[]) => void;
  readOnly?: boolean;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ 
  calculator, 
  onPriceUpdate,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const [options, setOptions] = useState<CostCalculatorOption[]>(calculator.options || []);
  const [basePrice, setBasePrice] = useState<number>(calculator.base_price);
  const [totalPrice, setTotalPrice] = useState<number>(calculator.base_price);

  // Calculate the total price whenever options change
  useEffect(() => {
    const calculateTotalPrice = () => {
      let total = basePrice;
      
      const addOptionPrice = (opt: CostCalculatorOption) => {
        if (opt.selected) {
          total += opt.price;
          
          // Add prices from nested options if they exist
          if (opt.options && opt.options.length > 0) {
            opt.options.forEach(subOpt => {
              addOptionPrice(subOpt);
            });
          }
        }
      };
      
      options.forEach(opt => addOptionPrice(opt));
      return total;
    };
    
    const newTotal = calculateTotalPrice();
    setTotalPrice(newTotal);
    
    if (onPriceUpdate) {
      const allSelectedOptions = getAllSelectedOptions(options);
      onPriceUpdate(newTotal, allSelectedOptions);
    }
  }, [options, basePrice, onPriceUpdate]);

  // Helper function to get all selected options (including nested ones)
  const getAllSelectedOptions = (opts: CostCalculatorOption[]): CostCalculatorOption[] => {
    let selected: CostCalculatorOption[] = [];
    
    opts.forEach(opt => {
      if (opt.selected) {
        selected.push(opt);
        
        if (opt.options && opt.options.length > 0) {
          selected = [...selected, ...getAllSelectedOptions(opt.options)];
        }
      }
    });
    
    return selected;
  };

  // Toggle selection state for an option
  const toggleOption = (optionId: string) => {
    const updateOptions = (opts: CostCalculatorOption[]): CostCalculatorOption[] => {
      return opts.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, selected: !opt.selected };
        }
        
        if (opt.options && opt.options.length > 0) {
          return { ...opt, options: updateOptions(opt.options) };
        }
        
        return opt;
      });
    };
    
    setOptions(updateOptions(options));
  };

  // For demo purposes, add an option to save this configuration
  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: `Your custom package with a total of ${currencyFormatter.format(totalPrice)} has been saved.`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Cost Calculator</CardTitle>
        <CardDescription>
          Customize your service package by selecting the options that meet your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Base Services</h3>
            <p className="text-lg font-semibold">{currencyFormatter.format(basePrice)}</p>
          </div>
          
          {!readOnly && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Additional Services</h3>
              
              {options.map(option => (
                <div key={option.id} className="mb-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id={option.id}
                      checked={option.selected}
                      onCheckedChange={() => toggleOption(option.id)}
                      disabled={readOnly}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor={option.id}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {option.name}
                        </Label>
                        <span className="text-sm font-medium">
                          {currencyFormatter.format(option.price)}
                        </span>
                      </div>
                      {option.description && (
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Nested options, if any */}
                  {option.selected && option.options && option.options.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2 border-l-2 pl-4 border-muted">
                      {option.options.map(subOption => (
                        <div key={subOption.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={subOption.id}
                            checked={subOption.selected}
                            onCheckedChange={() => toggleOption(subOption.id)}
                            disabled={readOnly}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <div className="flex items-center justify-between">
                              <Label 
                                htmlFor={subOption.id}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {subOption.name}
                              </Label>
                              <span className="text-sm font-medium">
                                {currencyFormatter.format(subOption.price)}
                              </span>
                            </div>
                            {subOption.description && (
                              <p className="text-sm text-muted-foreground">
                                {subOption.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="w-full flex justify-between items-center py-4 border-t">
          <h3 className="text-lg font-medium">Total Price</h3>
          <p className="text-xl font-bold">{currencyFormatter.format(totalPrice)}</p>
        </div>
        
        {!readOnly && (
          <Button className="w-full mt-2" onClick={handleSaveConfig}>
            Save Configuration
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CostCalculator;
