import { redirect } from "next/navigation";

/**
 * Redirects /meal-helper to the home page.
 * The home page (/) is the meal helper.
 */
export default function MealHelperPage() {
  redirect("/");
}
