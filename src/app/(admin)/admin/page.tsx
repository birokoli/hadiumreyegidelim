import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the first admin section
  redirect('/admin/orders');
}
