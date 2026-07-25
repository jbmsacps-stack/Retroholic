import { Clerk } from "@clerk/clerk-js";
import { ui } from "@clerk/ui";

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

await clerk.load({ ui });

export default clerk;