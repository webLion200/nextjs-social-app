"use server";

import { lucia } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignUpValues, UserInfo, signUpSchema } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function singUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, password, email } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function findUser(username: string): Promise<{
  userInfo: Partial<UserInfo>;
  error?: string;
}> {
  try {
    const userInfo = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    const userId = userInfo?.id;
    if (!userId) {
      return {
        userInfo: {},
        error: "username not exist",
      };
    }

    return {
      userInfo: {
        email: userInfo.email,
        username: userInfo.username,
        id: userInfo.id,
      },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      userInfo: {},
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function resetPassword(id: string, password: string) {
  try {
    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
