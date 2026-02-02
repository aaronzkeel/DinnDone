import { redirect } from 'next/navigation'

// Redirect to new Kitchen page (Shopping tab)
export default function GroceryListPage() {
  redirect('/kitchen')
}
