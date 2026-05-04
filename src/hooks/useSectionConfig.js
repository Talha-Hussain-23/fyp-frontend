import { useCallback, useState } from 'react';

/**
 * Custom hook for managing sectioned interview configuration
 * Handles section state, smart weight redistribution, and validation
 */
export const useSectionConfig = (initialSections = null) => {
  const [sections, setSections] = useState(initialSections || {
    Descriptive: {
      type: 'Descriptive',
      enabled: true,
      num_questions: 5,
      weight: 100,
      time_per_question: 180,
      difficulty: 'Moderate'
    },
    MCQ: {
      type: 'MCQ',
      enabled: false,
      num_questions: 5,
      weight: 0,
      time_per_question: 60,
      difficulty: 'Moderate'
    },
    Code: {
      type: 'Code',
      enabled: false,
      num_questions: 2,
      weight: 0,
      time_per_question: 600,
      difficulty: 'Hard',
      language: 'Python'
    }
  });

  /**
   * Smart weight redistribution
   * Automatically adjusts weights when sections are enabled/disabled
   */
  const redistributeWeights = useCallback((updatedSections) => {
    const enabledSections = Object.values(updatedSections).filter(s => s.enabled);
    
    if (enabledSections.length === 0) {
      return updatedSections;
    }
    
    const equalWeight = Math.floor(100 / enabledSections.length);
    const remainder = 100 % enabledSections.length;
    
    const newSections = { ...updatedSections };
    let idx = 0;
    
    Object.keys(newSections).forEach(type => {
      if (newSections[type].enabled) {
        newSections[type] = {
          ...newSections[type],
          weight: equalWeight + (idx < remainder ? 1 : 0)
        };
        idx++;
      } else {
        newSections[type] = {
          ...newSections[type],
          weight: 0
        };
      }
    });
    
    return newSections;
  }, []);

  /**
   * Toggle section enabled/disabled
   */
  const toggleSection = useCallback((type, enabled) => {
    setSections(prev => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          enabled
        }
      };
      return redistributeWeights(updated);
    });
  }, [redistributeWeights]);

  /**
   * Update section field
   */
  const updateSection = useCallback((type, field, value) => {
    setSections(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  }, []);

  /**
   * Update section weight manually
   */
  const updateWeight = useCallback((type, weight) => {
    setSections(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        weight: Math.max(0, Math.min(100, weight))
      }
    }));
  }, []);

  /**
   * Get validation errors
   */
  const getValidationErrors = useCallback(() => {
    const errors = [];
    const enabledSections = Object.values(sections).filter(s => s.enabled);
    
    if (enabledSections.length === 0) {
      errors.push('At least one interview section must be enabled');
    }
    
    const totalWeight = enabledSections.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight !== 100 && enabledSections.length > 0) {
      errors.push(`Total weight must be 100% (currently ${totalWeight}%)`);
    }
    
    enabledSections.forEach(section => {
      if (section.num_questions < 1) {
        errors.push(`${section.type} section must have at least 1 question`);
      }
      
      if (section.type === 'Code' && !section.language) {
        errors.push('Code section must specify a programming language');
      }
    });
    
    return errors;
  }, [sections]);

  /**
   * Check if configuration is valid
   */
  const isValid = useCallback(() => {
    return getValidationErrors().length === 0;
  }, [getValidationErrors]);

  /**
   * Convert sections to API format
   */
  const toAPIFormat = useCallback(() => {
    const enabledSections = Object.values(sections).filter(s => s.enabled);
    
    // Calculate total questions
    const totalQuestions = enabledSections.reduce((sum, s) => sum + s.num_questions, 0);
    
    // Get enabled section types
    const enabledTypes = enabledSections.map(s => s.type);
    
    // Calculate total time (sum of all questions * their time limits)
    const totalTime = enabledSections.reduce((sum, s) => 
      sum + (s.num_questions * s.time_per_question), 0
    );
    
    return {
      sections: enabledSections.map(s => ({
        type: s.type,
        enabled: true,
        num_questions: s.num_questions,
        weight: s.weight,
        time_per_question: s.time_per_question,
        difficulty: s.difficulty,
        ...(s.language && { language: s.language })
      })),
      total_questions: totalQuestions,
      total_time: totalTime,
      enabled_section_types: enabledTypes
    };
  }, [sections]);

  /**
   * Load sections from API format
   */
  const fromAPIFormat = useCallback((apiConfig) => {
    if (!apiConfig || !apiConfig.sections) {
      return;
    }
    
    // FIX: Use functional state updater to avoid stale closure
    // Previously read 'sections' from closure, causing dependency cycles
    setSections(prev => {
      const newSections = { ...prev };
      
      // Reset all to disabled
      Object.keys(newSections).forEach(type => {
        newSections[type] = {
          ...newSections[type],
          enabled: false,
          weight: 0
        };
      });
      
      // Apply API config
      apiConfig.sections.forEach(section => {
        if (newSections[section.type]) {
          newSections[section.type] = {
            ...newSections[section.type],
            ...section
          };
        }
      });
      
      return newSections;
    });
  }, []);  // Stable reference — no dependency on sections

  return {
    sections,
    setSections,
    toggleSection,
    updateSection,
    updateWeight,
    redistributeWeights,
    getValidationErrors,
    isValid,
    toAPIFormat,
    fromAPIFormat
  };
};
