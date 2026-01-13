/**
 * Hook pour gérer les simulations analytics
 */

import { useState, useCallback, useMemo } from 'react';

export interface SimulationParameter {
  id: string;
  label: string;
  type: 'number' | 'percentage' | 'slider';
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  impact?: string;
}

export interface SimulationResult {
  parameterId: string;
  originalValue: number;
  newValue: number;
  difference: number;
  differencePercent: number;
}

interface UseSimulationOptions {
  initialParameters?: SimulationParameter[];
  onSimulate?: (parameters: SimulationParameter[]) => Promise<Record<string, number>>;
}

export function useSimulation(options: UseSimulationOptions = {}) {
  const [parameters, setParameters] = useState<SimulationParameter[]>(
    options.initialParameters || []
  );
  const [results, setResults] = useState<Record<string, number>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarios, setScenarios] = useState<Array<{
    id: string;
    name: string;
    parameters: SimulationParameter[];
    results: Record<string, number>;
  }>>([]);

  const updateParameter = useCallback((id: string, value: number) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  }, []);

  const resetParameters = useCallback(() => {
    setParameters(options.initialParameters || []);
    setResults({});
  }, [options.initialParameters]);

  const runSimulation = useCallback(async () => {
    setIsSimulating(true);
    try {
      let simResults: Record<string, number> = {};

      if (options.onSimulate) {
        simResults = await options.onSimulate(parameters);
      } else {
        // Simulation mockée
        parameters.forEach((param) => {
          simResults[param.id] = param.value * (1 + Math.random() * 0.2 - 0.1);
        });
      }

      setResults(simResults);
      return simResults;
    } catch (error) {
      console.error('Simulation error:', error);
      throw error;
    } finally {
      setIsSimulating(false);
    }
  }, [parameters, options.onSimulate]);

  const saveScenario = useCallback((name?: string) => {
    const scenario = {
      id: `scenario-${Date.now()}`,
      name: name || `Scénario ${scenarios.length + 1}`,
      parameters: [...parameters],
      results: { ...results },
    };
    setScenarios((prev) => [...prev, scenario]);
    return scenario;
  }, [parameters, results, scenarios.length]);

  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setParameters(scenario.parameters);
      setResults(scenario.results);
      return scenario;
    }
    return null;
  }, [scenarios]);

  // Calcul des différences
  const differences = useMemo(() => {
    const diffs: Record<string, SimulationResult> = {};

    parameters.forEach((param) => {
      const originalValue = options.initialParameters?.find((p) => p.id === param.id)?.value || 0;
      const newValue = results[param.id] || param.value;
      const difference = newValue - originalValue;
      const differencePercent = originalValue !== 0 ? (difference / originalValue) * 100 : 0;

      diffs[param.id] = {
        parameterId: param.id,
        originalValue,
        newValue,
        difference,
        differencePercent,
      };
    });

    return diffs;
  }, [parameters, results, options.initialParameters]);

  // Données pour graphiques
  const comparisonData = useMemo(() => {
    return scenarios.map((scenario) => ({
      name: scenario.name,
      ...Object.entries(scenario.results).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>),
    }));
  }, [scenarios]);

  return {
    parameters,
    results,
    isSimulating,
    scenarios,
    differences,
    comparisonData,
    updateParameter,
    resetParameters,
    runSimulation,
    saveScenario,
    loadScenario,
    hasResults: Object.keys(results).length > 0,
    hasScenarios: scenarios.length > 0,
  };
}

