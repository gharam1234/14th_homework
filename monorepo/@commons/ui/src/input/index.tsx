"use client";

import { Path } from "react-hook-form";
import { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import styles from "./styles.module.css";
import { HTMLInputTypeAttribute } from "react";

interface IProps<T extends FieldValues> {
  error?: FieldError;
  register?: UseFormRegister<T>;
  name: Path<T>;
  type: HTMLInputTypeAttribute;
  readonly?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  
}

export function MyInput<T extends FieldValues>({placeholder,defaultValue,register,name,type,error,...rest}:IProps<T>) {

  return (
    
    <input
    className={`${styles.myinput} ${(error ? styles.red : "")}`}
    type={type}
      {...(register ? register(name): {})}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...rest}
    />
  );
}
