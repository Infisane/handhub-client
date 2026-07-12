import { useState } from "react";
import { type ZodType } from "zod";

type UseValidatorProps<T extends Record<string, unknown>> = {
  store: T;
  schema: ZodType<T>;
};

function useValidator<T extends Record<string, unknown>>({ store, schema }: UseValidatorProps<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = (_callback?: () => void): boolean => {
    const result = schema.safeParse(store);

    if (!result.success) {
      const tempErrors: Partial<Record<keyof T, string>> = {};
      result.error.issues.forEach((error) => {
        if (error.path[0]) {
          tempErrors[error.path[0] as keyof T] = error.message;
        }
      });
      setErrors(tempErrors);
      return false;
    } else {
      setErrors({});
      _callback?.();
      return true;
    }
  };

  const revalidate = (field: keyof T, value: unknown) => {
    const updatedStore = { ...store, [field]: value };
    const result = schema.safeParse(updatedStore);

    if (!result.success) {
      const fieldError = result.error.issues.find((e) => e.path[0] === field);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError.message,
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    } else {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return { validate, revalidate, errors };
}

export { useValidator };
