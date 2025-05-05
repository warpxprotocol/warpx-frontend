import { useCallback, useState } from 'react';

// 소수점 자리수 제한 함수
function limitDecimals(value: string, decimals: number) {
  if (!value.includes('.')) return value;
  const [int, frac] = value.split('.');
  return frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : value;
}

// 반올림 함수
function snapToDecimals(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals));
}

// lotsize/ticksize 스냅 함수
function snapToStep(value: number, step: number, decimals: number) {
  const snapped = Math.round(value / step) * step;
  return parseFloat(snapped.toFixed(decimals));
}

/**
 * @param initialValue 초기값
 * @param decimals 소수점 자리수
 * @param step lotsize/ticksize 등 최소 단위
 * @returns [value, handleChange, handleBlur, setValue]
 */
export function useDecimalInput(initialValue: string, decimals: number, step: number) {
  const [value, setValue] = useState(initialValue);

  // 입력 중: 자유롭게 입력 허용
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  // blur: lotsize/ticksize 반올림
  const handleBlur = useCallback(() => {
    if (!value || value === '.') {
      setValue(step.toFixed(decimals));
      return;
    }
    let num = Number(value);
    if (isNaN(num) || num < step) {
      num = step;
    } else {
      num = snapToStep(num, step, decimals);
    }
    setValue(num.toFixed(decimals));
  }, [value, decimals, step]);

  return [value, handleChange, handleBlur, setValue] as const;
}
