"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpValues, UserInfo } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState, useTransition } from "react";
import { singUp, resetPassword, findUser } from "./actions";
import { PasswordInput } from "@/components/ui/PasswordInput";
import LoadingButton from "@/components/ui/LoadingButton";
import { useSearchParams } from "next/navigation";

let userInfo: Partial<UserInfo> = {};
let defaultEmail: string | null = null;

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const pageType = useSearchParams()?.get("type");
  const defaultUsername = useSearchParams()?.get("username") || "";

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: defaultEmail || "",
      username: defaultUsername,
      password: "",
    },
  });

  const fetchUser = useCallback(async () => {
    const res = await findUser(defaultUsername);
    if (res?.error) {
      setError(res.error);
    } else if (res.userInfo) {
      userInfo = res.userInfo;
      if (userInfo.email) {
        defaultEmail = userInfo?.email;
        form.setValue("email", userInfo?.email);
      }
    }
  }, [defaultUsername, form]);

  useEffect(() => {
    if (pageType === "reset") {
      fetchUser();
    }
  }, [fetchUser, pageType]);

  async function onSubmit(values: SignUpValues) {
    setError(undefined);

    startTransition(async () => {
      if (pageType == "reset") {
        if (userInfo.id) {
          const { error } = await resetPassword(userInfo.id, values?.password);
          if (error) {
            setError(error);
          }
        }
      } else {
        const { error } = await singUp(values);
        if (error) {
          setError(error);
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          {error && <p className="flex justify-center text-red-700">{error}</p>}
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Username"
                  {...field}
                  disabled={pageType == "reset"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="email"
                  {...field}
                  disabled={pageType == "reset"}
                />
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
