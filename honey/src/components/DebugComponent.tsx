// src/components/DebugComponent.tsx - For debugging object rendering issues
import React from 'react';

interface DebugComponentProps {
  data: unknown;
  label?: string;
}

// FIXED: Component to safely render debug information
const DebugComponent: React.FC<DebugComponentProps> = ({
  data,
  label = 'Debug Data',
}) => {
  // Function to safely convert data to string
  const safeStringify = (obj: unknown): string => {
    try {
      if (obj === null) return 'null';
      if (obj === undefined) return 'undefined';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number') return obj.toString();
      if (typeof obj === 'boolean') return obj.toString();
      if (React.isValidElement(obj)) return '[React Element]';
      if (typeof obj === 'function')
        return `[Function: ${obj.name || 'anonymous'}]`;
      if (typeof obj === 'object') {
        // Check if it's an array
        if (Array.isArray(obj)) {
          return `[Array(${obj.length})]`;
        }
        // Check if it has circular references
        const seen = new WeakSet();
        return JSON.stringify(
          obj,
          (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular Reference]';
              }
              seen.add(value);
            }
            if (typeof value === 'function') {
              return `[Function: ${value.name || 'anonymous'}]`;
            }
            return value;
          },
          2,
        );
      }
      return String(obj);
    } catch (error) {
      return `[Error stringifying: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-sm">
      <div className="font-bold text-gray-700 mb-2">{label}</div>
      <pre className="whitespace-pre-wrap text-gray-600 max-h-40 overflow-auto">
        {safeStringify(data)}
      </pre>
    </div>
  );
};

export default DebugComponent;

// FIXED: Safe wrapper for potentially problematic components
export const SafeRender: React.FC<{
  children: unknown;
  fallback?: React.ReactNode;
}> = ({
  children,
  fallback = <div className="text-red-500">Failed to render component</div>,
}) => {
  try {
    // Check if children is a valid React node
    if (React.isValidElement(children)) {
      return children;
    }

    // If it's a string, number, or boolean, render it directly
    if (
      typeof children === 'string' ||
      typeof children === 'number' ||
      typeof children === 'boolean'
    ) {
      return <>{children}</>;
    }

    // If it's null or undefined, render nothing
    if (children === null || children === undefined) {
      return null;
    }

    // If it's an array, try to render each element
    if (Array.isArray(children)) {
      return (
        <>
          {children.map((child, index) => (
            <SafeRender key={index} fallback={fallback}>
              {child}
            </SafeRender>
          ))}
        </>
      );
    }

    // If it's an object, show debug info instead of trying to render
    if (typeof children === 'object') {
      console.warn('Attempted to render object as React child:', children);
      return (
        <div className="bg-yellow-100 border border-yellow-400 p-2 rounded">
          <div className="text-yellow-800 text-sm font-bold">
            ⚠️ Object Render Prevented
          </div>
          <DebugComponent data={children} label="Object Data" />
        </div>
      );
    }

    // Fallback for functions or other types
    return fallback;
  } catch (error) {
    console.error('Error in SafeRender:', error);
    return fallback;
  }
};
