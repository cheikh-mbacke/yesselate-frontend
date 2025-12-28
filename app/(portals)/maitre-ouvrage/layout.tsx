import { BMOLayout } from '@/components/shared/layouts/BMOLayout';

export default function MaitreOuvrageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BMOLayout>{children}</BMOLayout>;
}
