import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterStartStep } from "@/components/auth/RegisterStartStep";

export default function Home() {
  return (
    <AuthLayout
      title="Select your registration type"
      description="Step 1: Choose whether you are registering as a sponsor or employee, then enter the number of employees to register."
    >
      <RegisterStartStep />
    </AuthLayout>
  );
}
