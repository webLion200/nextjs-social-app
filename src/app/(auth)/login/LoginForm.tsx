"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/LoadingButton";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginSchema, LoginValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login } from "./actions";
import { useState, useTransition } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [errType, setErrType] = useState<string | number>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const username = form.watch("username");

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, type } = await login(values);
      if (error) {
        setError(error);
      }
      if (type) {
        setErrType(type);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          {error && <p className="flex justify-center text-red-700">{error}</p>}
          {errType == "-1" && (
            <Link
              href={`/signup?type=reset&username=${username}`}
              className="flex justify-center text-sky-600"
            >
              forget password?
            </Link>
          )}
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
