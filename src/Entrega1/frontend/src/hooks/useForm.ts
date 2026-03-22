import type { ChangeEvent } from "react";
import { useState } from "react";


type Errors<T> = Partial<Record<keyof T, string>>;
type Validator<T> = (values: T) => Errors<T>;

function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate?: Validator<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (onValid: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
      }
      onValid(values);
    };
  };

  return { values, errors, handleChange, handleSubmit, setErrors };
}

export default useForm;
