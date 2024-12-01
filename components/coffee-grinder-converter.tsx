'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Analytics } from "@vercel/analytics/react";

interface GrinderData {
  micronsPerClick: number;
  maxClicks: number;
  baseOffset: number;
}

interface GrinderDataMap {
  [key: string]: GrinderData;
}

interface ConversionResult {
  clicks: number;
  microns: number;
}

const grinderData: GrinderDataMap = {
  'Kingrinder K6': {
    micronsPerClick: 16,
    maxClicks: 240,
    baseOffset: 0
  },
  'Kingrinder K1': {
    micronsPerClick: 18,
    maxClicks: 240,
    baseOffset: 0
  },
  'Comandante C40': {
    micronsPerClick: 30,
    maxClicks: 50,
    baseOffset: 0
  },
  'Porlex Mini 2': {
    micronsPerClick: 37,
    maxClicks: 50,
    baseOffset: 0
  },
  'Timemore S3': {
    micronsPerClick: 15,
    maxClicks: 36,
    baseOffset: 0
  },
  '1Zpresso Q2/J': {
    micronsPerClick: 25,
    maxClicks: 30,
    baseOffset: 0
  },
  '1Zpresso JX-Pro/JE-Plus': {
    micronsPerClick: 12.5,
    maxClicks: 40,
    baseOffset: 0
  },
  '1Zpresso X-Pro/X-Ultra': {
    micronsPerClick: 12.5,
    maxClicks: 60,
    baseOffset: 0
  },
  '1Zpresso J-Max': {
    micronsPerClick: 8.8,
    maxClicks: 90,
    baseOffset: 0
  },
  '1Zpresso J-Ultra': {
    micronsPerClick: 8,
    maxClicks: 100,
    baseOffset: 0
  },
  '1Zpresso K-Plus/K-Pro/K-Max': {
    micronsPerClick: 22,
    maxClicks: 90,
    baseOffset: 0
  },
  '1Zpresso K-Ultra': {
    micronsPerClick: 20,
    maxClicks: 100,
    baseOffset: 0
  }
};

const calculateMicrons = (grinder: string, clicks: number): number => {
  const { micronsPerClick, baseOffset } = grinderData[grinder];
  return baseOffset + (clicks * micronsPerClick);
};

const calculateClicks = (grinder: string, targetMicrons: number): number => {
  const { micronsPerClick, baseOffset, maxClicks } = grinderData[grinder];
  const clicks = Math.round((targetMicrons - baseOffset) / micronsPerClick);
  return Math.min(Math.max(0, clicks), maxClicks);
};

const CoffeeGrinderConverter = () => {
  const [sourceGrinder, setSourceGrinder] = useState<string>('');
  const [targetGrinder, setTargetGrinder] = useState<string>('');
  const [sourceValue, setSourceValue] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleConversion = (value: string) => {
    if (!sourceGrinder || !targetGrinder || !value) {
      setResult(null);
      return;
    }

    // Check if value is a valid positive integer
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue) || parsedValue < 0 || !Number.isInteger(parsedValue)) {
      setSourceValue(''); // Clear invalid input
      setResult(null);
      return;
    }
    
    const sourceMicrons = calculateMicrons(sourceGrinder, parsedValue);
    const targetClicks = calculateClicks(targetGrinder, sourceMicrons);
    const targetMicrons = calculateMicrons(targetGrinder, targetClicks);
    
    setResult({
      clicks: targetClicks,
      microns: targetMicrons
    });
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">Coffee Grinder Size Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Grinder:</label>
              <Select value={sourceGrinder} onValueChange={(value: string) => {
                setSourceGrinder(value);
                setSourceValue('');
                setResult(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source grinder" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(grinderData).map(grinder => (
                    <SelectItem key={grinder} value={grinder}>
                      {grinder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceGrinder && (
                <p className="text-xs text-gray-600">
                  {grinderData[sourceGrinder].micronsPerClick} microns per click, max {grinderData[sourceGrinder].maxClicks} clicks
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Grinder:</label>
              <Select value={targetGrinder} onValueChange={(value: string) => {
                setTargetGrinder(value);
                setResult(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target grinder" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(grinderData).map(grinder => (
                    <SelectItem key={grinder} value={grinder}>
                      {grinder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetGrinder && (
                <p className="text-xs text-gray-600">
                  {grinderData[targetGrinder].micronsPerClick} microns per click, max {grinderData[targetGrinder].maxClicks} clicks
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grind Setting (clicks):</label>
              <Input
                type="number"
                step="1"
                value={sourceValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  // Only allow positive integers within maxClicks limit
                  if (/^\d*$/.test(value)) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && sourceGrinder) {
                      if (numValue <= grinderData[sourceGrinder].maxClicks) {
                        setSourceValue(value);
                        handleConversion(value);
                      }
                    } else if (value === '') {
                      setSourceValue('');
                      setResult(null);
                    }
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric input
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Enter number of clicks"
                min={0}
                max={sourceGrinder ? grinderData[sourceGrinder].maxClicks : 100}
              />
              {sourceValue && sourceGrinder && (
                <p className="text-sm text-gray-600">
                  ≈ {calculateMicrons(sourceGrinder, Number(sourceValue))} microns
                </p>
              )}
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg space-y-2">
                <p className="text-center text-lg font-medium">
                  Converted Setting: {result.clicks} clicks
                </p>
                <p className="text-center text-sm text-gray-600">
                  ≈ {result.microns} microns
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Analytics />
    </>
  );
};

export default CoffeeGrinderConverter;