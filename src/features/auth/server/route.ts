//D:\pj\finalpj\src\features\auth\server\route.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";
import type { StatusCode } from "hono/utils/http-status";

import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import { z } from "zod";

// Helper function to handle Appwrite errors
const handleAppwriteError = (error: any): { message: string; status: StatusCode } => {
  console.error("Appwrite error:", error);
  
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const appwriteError = error as { code: number; message: string; type?: string };
    
    switch (appwriteError.code) {
      case 401:
        if (appwriteError.message?.includes('Invalid credentials')) {
          return { message: "Invalid email or password", status: 401 };
        }
        return { message: "Authentication failed", status: 401 };
      
      case 409:
        if (appwriteError.message?.includes('already exists')) {
          return { message: "An account with this email already exists", status: 409 };
        }
        return { message: "Conflict error", status: 409 };
      
      case 400:
        if (appwriteError.message?.includes('password')) {
          return { message: "Password must be at least 8 characters long", status: 400 };
        }
        if (appwriteError.message?.includes('email')) {
          return { message: "Please provide a valid email address", status: 400 };
        }
        if (appwriteError.message?.includes('phone')) {
          return { message: "Invalid phone number format", status: 400 };
        }
        return { message: "Invalid input data", status: 400 };
      
      case 404:
        return { message: "User not found", status: 404 };
      
      case 429:
        return { message: "Too many requests. Please try again later", status: 429 };
      
      case 500:
      case 503:
        return { message: "Server error. Please try again later", status: 500 };
      
      default:
        return { message: appwriteError.message || "An unexpected error occurred", status: 500 };
    }
  }
  
  return { message: "An unexpected error occurred", status: 500 };
};

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data: user });
    } catch (error) {
      console.error("Get current user error:", error);
      const { message, status } = handleAppwriteError(error);
      return c.json({ error: message }, status);
    }
  })
  
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      if (!email || !password) {
        return c.json({ error: "Email and password are required" }, 400);
      }

      const { account } = await createAdminClient();
      const session = await account.createEmailPasswordSession(email, password);

      if (!session || !session.secret) {
        return c.json({ error: "Failed to create session" }, 500);
      }

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });

      return c.json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      const { message, status } = handleAppwriteError(error);
      return c.json({ error: message }, status);
    }
  })
  
  .post("/register", zValidator("json", registerSchema), async (c) => {
    try {
      const { name, email, password } = c.req.valid("json");

      if (!name || !email || !password) {
        return c.json({ error: "Name, email, and password are required" }, 400);
      }

      const { account } = await createAdminClient();
      
      // Create user account
      const user = await account.create(ID.unique(), email, password, name);
      
      if (!user) {
        return c.json({ error: "Failed to create user account" }, 500);
      }

      // Create session
      const session = await account.createEmailPasswordSession(email, password);
      
      if (!session || !session.secret) {
        return c.json({ error: "Account created but failed to log in. Please try logging in manually" }, 500);
      }

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });

      return c.json({ success: true });
    } catch (error) {
      console.error("Registration error:", error);
      const { message, status } = handleAppwriteError(error);
      return c.json({ error: message }, status);
    }
  })
  
  .post("/logout", sessionMiddleware, async (c) => {
    try {
      const account = c.get("account");
      
      if (!account) {
        return c.json({ error: "No active session found" }, 400);
      }

      // Delete session from Appwrite
      await account.deleteSession("current");
      
      // Delete cookie
      deleteCookie(c, AUTH_COOKIE);

      return c.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if session deletion fails, clear the cookie
      deleteCookie(c, AUTH_COOKIE);
      
      // Don't return error for logout - user should be logged out regardless
      return c.json({ success: true });
    }
  })

  .patch(
    "/profile",
    sessionMiddleware,
    zValidator("json", z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      description: z.string().optional(),
    })),
    async (c) => {
      try {
        const { account } = await createSessionClient();
        const { name, phone, description } = c.req.valid("json");

        if (!name && !phone && description === undefined) {
          return c.json({ error: "At least one field must be provided for update" }, 400);
        }

        // Update name if provided
        if (name) {
          if (name.trim().length < 1) {
            return c.json({ error: "Name cannot be empty" }, 400);
          }
          await account.updateName(name.trim());
        }

        // Handle phone and description updates
        if (phone !== undefined || description !== undefined) {
          const currentUser = await account.get();
          const currentPrefs = currentUser.prefs || {};
          const updatedPrefs = { ...currentPrefs };

          // Validate and update phone
          if (phone !== undefined) {
            const cleanPhone = phone.trim();
            
            if (cleanPhone !== "") {
              // Validate phone format
              if (!cleanPhone.startsWith('+')) {
                return c.json({ error: "Phone number must start with '+'" }, 400);
              }
              
              const formattedPhone = '+' + cleanPhone.slice(1).replace(/\D/g, '');
              
              if (formattedPhone.length < 8 || formattedPhone.length > 16) {
                return c.json({ error: "Phone number must be between 7-15 digits" }, 400);
              }
              
              updatedPrefs.phone = formattedPhone;
            } else {
              // Remove phone if empty string provided
              delete updatedPrefs.phone;
            }
          }

          // Update description
          if (description !== undefined) {
            if (description.trim() === "") {
              delete updatedPrefs.description;
            } else {
              updatedPrefs.description = description.trim();
            }
          }

          await account.updatePrefs(updatedPrefs);
        }

        // Get updated user info
        const updatedUser = await account.get();

        return c.json({ 
          data: {
            ...updatedUser,
            phone: updatedUser.prefs?.phone || "",
            description: updatedUser.prefs?.description || "",
          }
        });
      } catch (error) {
        console.error("Profile update error:", error);
        const { message, status } = handleAppwriteError(error);
        return c.json({ error: message }, status);
      }
    }
  )

  // Global error handler
  .onError((err, c) => {
    console.error("Unhandled error:", err);
    
    // Check if it's a validation error
    if (err.message?.includes('validation')) {
      return c.json({ error: "Invalid request data" }, 400);
    }
    
    // Check if it's a network/connection error
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      return c.json({ error: "Network error. Please check your connection" }, 503);
    }
    
    return c.json({ error: "Internal server error" }, 500);
  });

export default app;
