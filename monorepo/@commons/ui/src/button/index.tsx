"use client";
import { FieldValues, FormState } from "react-hook-form";
import styles from "./styles.module.css";
import { Button } from "@/stories/Button";
import { on } from "events";
// interface IProps {
//   formState?: FormState<FieldValues>;
//   children: React.ReactNode;
//   onClick?: () => void;
//   variant?: "primary" | "secondary";
//   isActive?: boolean;
//   type?: "submit" | "button";
// }
export interface IProps<T extends FieldValues = FieldValues> {
  formState?: FormState<T>;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  isActive?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function MyButton<T extends FieldValues>({
  children, variant="primary",
  onClick,
  formState,
  isActive = true,
  type = "button",
  
}: IProps<T>) {
  const className = isActive ? variant : `${variant}_disabled`;
  const disabled = formState ? !formState.isValid : !isActive
  return (
    <button className={styles[className]} disabled={disabled} onClick={onClick}>
      {children}
    </button>
    // <button onClick={onClick}>{children}</button>
  );
}
