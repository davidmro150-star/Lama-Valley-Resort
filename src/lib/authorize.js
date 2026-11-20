import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

/**
 * Use in Server Components and admin pages.
 * Returns the authorized user, or null if access is denied.
 */
export async function getAuthorizedUser(permission) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (!hasPermission(session.user.role, permission)) {
    return null;
  }

  return session.user;
}

/**
 * Use in API routes.
 * Returns the user when authorized, otherwise an HTTP response.
 */
export async function authorizeApiRequest(permission) {
  const session = await auth();

  if (!session?.user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.user.role, permission)) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "You do not have permission to perform this action." },
        { status: 403 }
      ),
    };
  }

  return {
    user: session.user,
    response: null,
  };
}